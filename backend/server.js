const express = require('express');
const app = express();
const path = require('path');

app.use(express.json()); // para leer JSON en el body

// Rutas API
app.get('/api/mensaje', (req, res) => {
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

// Servir archivos estáticos del frontend
const publicPath = path.resolve(__dirname, '../public');

app.use(express.static(publicPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
