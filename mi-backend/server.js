// 📦 Importaciones
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Cargar variables de entorno

const app = express();

// 🔐 Middleware
app.use(cors()); // Permitir CORS
app.use(express.json()); // Habilitar JSON

// 🔑 Acceso a API Key y conexión a base de datos desde variables de entorno
const apiKey = process.env.API_KEY;
const dbUrl = process.env.DATABASE_URL;

// 🔌 Conectar a base de datos (ejemplo general, puedes cambiarlo luego)
console.log('Conectando a la base de datos en:', dbUrl);
// Aquí iría la lógica real de conexión, según uses MongoDB, PostgreSQL, etc.

// 🛠️ Rutas API
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
