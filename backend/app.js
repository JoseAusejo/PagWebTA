const express = require('express');
const app = express();
const path = require('path');

app.use(express.json()); // para leer JSON

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Ruta GET simple
app.get('/api/mensaje', (req, res) => {
  res.json({ mensaje: 'Hola desde el backend' });
});

// Ruta POST para recibir datos
app.post('/api/enviar', (req, res) => {
  const datos = req.body;
  console.log('Datos recibidos:', datos);
  res.json({ status: 'Datos recibidos correctamente', datos });
});

// Ruta GET con parámetro
app.get('/api/saludo/:nombre', (req, res) => {
  const nombre = req.params.nombre;
  res.json({ mensaje: `Hola, ${nombre}, desde el backend!` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
