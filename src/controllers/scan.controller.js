const db = require('../config/db');

// GET /api/scan/:hash
// Busca el item por hash y devuelve sus datos si el usuario está logueado
exports.scanQR = async (req, res) => {
  try {
    const { hash } = req.params;

    const [rows] = await db.query(`
      SELECT 
        i.id,
        i.nombre,
        i.estado,
        i.responsable_nombre,
        i.hash_actual,
        i.fecha_creacion,
        i.fecha_ultima_actualizacion,
        c.nombre AS categoria
      FROM inventario i
      INNER JOIN categoria c ON i.categoria_id = c.id
      WHERE i.hash_actual = ?
    `, [hash]);

    if (!rows.length) {
      return res.status(404).json({ ok: false, error: 'Item no encontrado o QR inválido' });
    }

    res.json({ ok: true, data: rows[0] });

  } catch (error) {
    console.error('🔥 ERROR SCAN QR:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
};

// POST /api/scan/:hash/registrar
// Registra en historial que un usuario escaneó este item
exports.registrarScan = async (req, res) => {
  try {
    const { hash } = req.params;
    const nombre_usuario = req.usuario.nombre; // viene del JWT

    // Buscar el item por hash
    const [rows] = await db.query(
      'SELECT id, nombre FROM inventario WHERE hash_actual = ?',
      [hash]
    );

    if (!rows.length) {
      return res.status(404).json({ ok: false, error: 'Item no encontrado' });
    }

    const item = rows[0];

    // Registrar en historial con accion SCAN
    await db.query(
      `INSERT INTO historial (accion, nombre_usuario, inventario_id)
       VALUES ('SCAN', ?, ?)`,
      [nombre_usuario, item.id]
    );

    res.json({
      ok: true,
      mensaje: `Inspección de "${item.nombre}" registrada correctamente`
    });

  } catch (error) {
    console.error('🔥 ERROR REGISTRAR SCAN:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
};
