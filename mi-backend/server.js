// 📦 Importaciones
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { Pool } = require('pg');

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
      rejectUnauthorized: false, // necesario si tu hosting lo requiere (Render lo usa)
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

// ✅ Endpoint de health check para Render
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// 🔁 Rutas de tu API
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

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
