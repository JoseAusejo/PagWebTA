// 📦 Importaciones y carga dinámica de variables de entorno según NODE_ENV
const dotenv = require('dotenv');
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: envFile });

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const nodemailer = require('nodemailer'); // ✅ Se agrega para enviar correos

const app = express();

// 🔐 Middleware
app.use(cors());
app.use(express.json());

// 🔑 Variables de entorno
const apiKey = process.env.API_KEY;

// 🔌 Configuración dinámica para PostgreSQL
let pool;

if (process.env.DATABASE_URL) {
  // 👉 Usar DATABASE_URL (modo producción o Render)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  console.log('Usando DATABASE_URL para conectar a la base de datos.');
} else {
  // 👉 Usar variables separadas (modo local)
  pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: 5432,
  });
  console.log('Usando configuración local para conectar a la base de datos.');
}

// Probar conexión
pool.connect()
  .then(client => {
    console.log('✅ Conexión a la base de datos exitosa');
    client.release();
  })
  .catch(err => {
    console.error('❌ Error conectando a la base de datos:', err);
  });

//  Endpoint de health check para Render
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

//  Rutas de tu API
app.get('/api/obtener-mensaje', (req, res) => {
  res.json({ mensaje: 'Hola desde el backend' });
});

app.post('/api/enviar', (req, res) => {
  const datos = req.body;
  console.log('Datos recibidos:', datos);
  res.json({ status: 'Datos recibidos correctamente', datos });
});

app.get('/api/saludo/:nombre', (req, res) => {
  const nombre = req.params.nombre;
  res.json({ mensaje: `Hola, ${nombre}, desde el backend!` });
});


//  NUEVO 1: Endpoint para obtener productos desde la base de datos
app.get('/api/productos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

//  NUEVO 2: Endpoint para simular compra y enviar correo
app.post('/api/comprar', async (req, res) => {
  const { email, producto_id } = req.body;

  try {
    const productoRes = await pool.query('SELECT * FROM productos WHERE id = $1', [producto_id]);
    const producto = productoRes.rows[0];

    if (!producto || producto.stock <= 0) {
      return res.status(400).json({ error: 'Producto no disponible' });
    }

    // Descontar stock
    await pool.query('UPDATE productos SET stock = stock - 1 WHERE id = $1', [producto_id]);

    // Registrar compra
    await pool.query(
      'INSERT INTO compras (producto_id, email, fecha) VALUES ($1, $2, NOW())',
      [producto_id, email]
    );

    // Enviar correo de confirmación
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: 'Simulación Tienda <no-reply@tienda.com>',
      to: email,
      subject: 'Compra Simulada Confirmada',
      html: `<p>Has comprado: <strong>${producto.nombre}</strong></p><p>Gracias por usar nuestra simulación de tienda.</p>`,
    });

    res.json({ mensaje: 'Compra registrada y correo enviado correctamente.' });
  } catch (err) {
    console.error('Error al procesar compra:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

//  Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
