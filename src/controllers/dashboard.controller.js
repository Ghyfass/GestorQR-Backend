const db = require('../config/db');

// GET /api/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const [[stats]] = await db.query('SELECT * FROM vista_dashboard_estadisticas');
    const [ultimosCambios] = await db.query('SELECT * FROM vista_ultimos_cambios');
    const [porCategoria] = await db.query('SELECT * FROM vista_resumen_categoria');

    res.json({
      ok: true,
      data: {
        stats,
        ultimosCambios,
        porCategoria
      }
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};
