const db = require('../config/db');
const bcrypt = require('bcrypt');

// GET /api/usuarios
exports.getUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, nombre, rol, activo, fecha_desactivacion
      FROM usuario
      ORDER BY nombre ASC
    `);
    res.json({ ok: true, data: rows });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// POST /api/usuarios
exports.createUsuario = async (req, res) => {
  try {
    const { nombre, password, rol } = req.body;
    if (!nombre || !password || !rol) {
      return res.status(400).json({ ok: false, error: 'Nombre, password y rol son requeridos' });
    }

    const rolesValidos = ['admin', 'editor', 'consultor'];
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({ ok: false, error: 'Rol inválido' });
    }

    const [existe] = await db.query('SELECT id FROM usuario WHERE nombre = ?', [nombre]);
    if (existe.length) {
      return res.status(400).json({ ok: false, error: 'Ya existe un usuario con ese nombre' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO usuario (nombre, password, rol, activo) VALUES (?, ?, ?, 1)',
      [nombre, hash, rol]
    );

    res.json({ ok: true, id: result.insertId, mensaje: 'Usuario creado' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// PUT /api/usuarios/:id  — editar nombre/rol o activar/desactivar
exports.updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, rol, activo } = req.body;

    const [existe] = await db.query('SELECT id FROM usuario WHERE id = ?', [id]);
    if (!existe.length) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });

    // Si solo se está activando/desactivando
    if (activo !== undefined && !nombre && !rol) {
      const fecha_desactivacion = activo ? null : new Date();
      await db.query(
        'UPDATE usuario SET activo = ?, fecha_desactivacion = ? WHERE id = ?',
        [activo ? 1 : 0, fecha_desactivacion, id]
      );
      return res.json({ ok: true, mensaje: activo ? 'Usuario activado' : 'Usuario desactivado' });
    }

    // Edición completa
    if (nombre) {
      const [duplicado] = await db.query('SELECT id FROM usuario WHERE nombre = ? AND id != ?', [nombre, id]);
      if (duplicado.length) return res.status(400).json({ ok: false, error: 'Ese nombre ya está en uso' });
    }

    await db.query(
      'UPDATE usuario SET nombre = COALESCE(?, nombre), rol = COALESCE(?, rol) WHERE id = ?',
      [nombre || null, rol || null, id]
    );

    res.json({ ok: true, mensaje: 'Usuario actualizado' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// DELETE /api/usuarios/:id
exports.deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const [existe] = await db.query('SELECT id, rol FROM usuario WHERE id = ?', [id]);
    if (!existe.length) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });

    // No permitir eliminar el último admin
    if (existe[0].rol === 'admin') {
      const [admins] = await db.query("SELECT COUNT(*) as total FROM usuario WHERE rol = 'admin'");
      if (admins[0].total <= 1) {
        return res.status(400).json({ ok: false, error: 'No se puede eliminar el único administrador' });
      }
    }

    await db.query('DELETE FROM usuario WHERE id = ?', [id]);
    res.json({ ok: true, mensaje: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};
