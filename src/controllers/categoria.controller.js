const db = require('../config/db');

// GET /api/categorias
exports.getCategorias = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.id, c.nombre,
        COUNT(i.id) AS total_items
      FROM categoria c
      LEFT JOIN inventario i ON c.id = i.categoria_id
      GROUP BY c.id, c.nombre
      ORDER BY c.nombre ASC
    `);
    res.json({ ok: true, data: rows });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// POST /api/categorias
exports.createCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ ok: false, error: 'El nombre es requerido' });

    const [existe] = await db.query('SELECT id FROM categoria WHERE nombre = ?', [nombre]);
    if (existe.length) return res.status(400).json({ ok: false, error: 'Ya existe una categoría con ese nombre' });

    const [result] = await db.query('INSERT INTO categoria (nombre) VALUES (?)', [nombre]);
    res.json({ ok: true, id: result.insertId, mensaje: 'Categoría creada' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// PUT /api/categorias/:id
exports.updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ ok: false, error: 'El nombre es requerido' });

    const [existe] = await db.query('SELECT id FROM categoria WHERE id = ?', [id]);
    if (!existe.length) return res.status(404).json({ ok: false, error: 'Categoría no encontrada' });

    await db.query('UPDATE categoria SET nombre = ? WHERE id = ?', [nombre, id]);
    res.json({ ok: true, mensaje: 'Categoría actualizada' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// DELETE /api/categorias/:id
exports.deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que no tenga items asociados
    const [items] = await db.query('SELECT id FROM inventario WHERE categoria_id = ?', [id]);
    if (items.length) {
      return res.status(400).json({
        ok: false,
        error: `No se puede eliminar: tiene ${items.length} item(s) asociado(s)`
      });
    }

    await db.query('DELETE FROM categoria WHERE id = ?', [id]);
    res.json({ ok: true, mensaje: 'Categoría eliminada' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};
