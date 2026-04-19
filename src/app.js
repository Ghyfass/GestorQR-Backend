const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const db = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

// Test de conexión
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM usuario');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Rutas
app.use('/api/auth',       require('./routes/auth.routes'));
app.use('/api/inventario', require('./routes/inventario.routes'));
app.use('/api/categorias', require('./routes/categoria.routes'));
app.use('/api/usuarios',   require('./routes/usuario.routes'));
app.use('/api/historial',  require('./routes/historial.routes'));
app.use('/api/scan',       require('./routes/scan.routes'));

// Certificados generados por mkcert
const httpsOptions = {
  key:  fs.readFileSync('./192.168.1.100+2-key.pem'),
  cert: fs.readFileSync('./192.168.1.100+2.pem')
};

const PORT = 3000;
https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`Servidor HTTPS corriendo en https://localhost:${PORT}`);
});