const db = require('../config/db');

// GET /api/historial  (con filtros opcionales: anio, mes, responsable, busqueda)
exports.getHistorial = async (req, res) => {
  try {
    const { anio, mes, responsable, busqueda } = req.query;

    let query = `
      SELECT 
        id,
        fecha_modificacion,
        accion,
        nombre_usuario,
        inventario_id,
        producto_nombre,
        producto_estado,
        categoria_nombre,
        responsable_nombre,
        fecha_formateada
      FROM vista_historial_completo
      WHERE 1=1
    `;

    const params = [];

    if (anio) {
      query += ' AND YEAR(fecha_modificacion) = ?';
      params.push(anio);
    }

    if (mes) {
      query += ' AND MONTH(fecha_modificacion) = ?';
      params.push(mes);
    }

    if (responsable) {
      query += ' AND responsable_nombre = ?';
      params.push(responsable);
    }

    if (busqueda) {
      query += ' AND (producto_nombre LIKE ? OR nombre_usuario LIKE ?)';
      params.push(`%${busqueda}%`, `%${busqueda}%`);
    }

    query += ' ORDER BY fecha_modificacion DESC LIMIT 200';

    const [rows] = await db.query(query, params);
    res.json({ ok: true, data: rows });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// GET /api/historial/responsables  — para el filtro del frontend
exports.getResponsables = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT responsable_nombre 
      FROM vista_historial_completo 
      ORDER BY responsable_nombre ASC
    `);
    res.json({ ok: true, data: rows.map(r => r.responsable_nombre) });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};
