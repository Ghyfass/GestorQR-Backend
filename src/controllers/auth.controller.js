const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cambia_esto_en_produccion';
const JWT_EXPIRES = '8h'; // sesión de 8 horas

// =============================================
// POST /api/auth/login
// =============================================
exports.login = async (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({
      ok: false,
      message: 'Usuario y password son requeridos'
    });
  }

  try {
    // ✅ Tabla correcta: "usuario" (sin s)
    const [rows] = await db.query(
      'SELECT * FROM usuario WHERE nombre = ? AND activo = 1',
      [usuario]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        ok: false,
        message: 'Credenciales incorrectas o usuario inactivo'
      });
    }

    const user = rows[0];

    // ✅ Comparar password con bcrypt
    const passwordValido = await bcrypt.compare(password, user.password);
    if (!passwordValido) {
      return res.status(401).json({
        ok: false,
        message: 'Credenciales incorrectas'
      });
    }

    // ✅ Generar JWT con id, nombre y rol
    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, rol: user.rol },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({
      ok: true,
      token,
      data: {
        id: user.id,
        nombre: user.nombre,
        rol: user.rol
      }
    });

  } catch (error) {
    console.error('🔥 ERROR LOGIN:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Error en el servidor'
    });
  }
};

// =============================================
// POST /api/auth/cambiar-password
// (útil para que el admin setee contraseñas)
// =============================================
exports.cambiarPassword = async (req, res) => {
  const { nombre, nueva_password } = req.body;

  if (!nombre || !nueva_password) {
    return res.status(400).json({ ok: false, message: 'Faltan datos' });
  }

  try {
    const hash = await bcrypt.hash(nueva_password, 10);
    await db.query('UPDATE usuario SET password = ? WHERE nombre = ?', [hash, nombre]);
    res.json({ ok: true, message: 'Password actualizado' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};