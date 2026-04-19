const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cambia_esto_en_produccion';

// =============================================
// Middleware: verificar token JWT
// Uso: router.get('/', verificarToken, controller)
// =============================================
exports.verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      ok: false,
      message: 'Acceso denegado: token requerido'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded; // { id, nombre, rol }
    next();
  } catch (error) {
    return res.status(403).json({
      ok: false,
      message: 'Token inválido o expirado'
    });
  }
};

// =============================================
// Middleware: verificar que el rol sea admin
// Uso: router.get('/', verificarToken, soloAdmin, controller)
// =============================================
exports.soloAdmin = (req, res, next) => {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({
      ok: false,
      message: 'Acceso denegado: solo administradores'
    });
  }
  next();
};