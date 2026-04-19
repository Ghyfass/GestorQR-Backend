const db = require('../config/db');

// =============================================
// GET INVENTARIO (filtra solo usuarios existentes)
// =============================================
exports.getInventario = async (req, res) => {
  try {
    const { rol, usuario_actual } = req.query;

    let query = `
      SELECT 
        i.id,
        i.nombre,
        c.nombre AS categoria,
        i.estado,
        i.responsable_nombre AS responsable,
        i.hash_actual,
        i.fecha_creacion,
        i.fecha_ultima_actualizacion
      FROM inventario i
      INNER JOIN categoria c ON i.categoria_id = c.id
      INNER JOIN usuario u ON i.responsable_nombre = u.nombre
    `;

    const params = [];

    // Si el rol NO es admin, solo ve sus productos
    if (rol && rol !== 'admin') {
      query += ' WHERE i.responsable_nombre = ?';
      params.push(usuario_actual);
    }

    query += ' ORDER BY i.id DESC';
    
    const [rows] = await db.query(query, params);
    
    res.json({ ok: true, data: rows });

  } catch (error) {
    console.error('🔥 ERROR GET INVENTARIO:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
};

// =============================================
// CREATE INVENTARIO (solo validar que responsable existe)
// =============================================
exports.createInventario = async (req, res) => {
  try {
    const { nombre, categoria_id, estado, responsable_nombre } = req.body;
    const usuario_logueado = req.body.usuario_logueado || 'system';

    // Validar que existe la categoría
    const [categoria] = await db.query('SELECT id FROM categoria WHERE id = ?', [categoria_id]);
    if (!categoria.length) {
      return res.status(400).json({ ok: false, error: 'Categoría no existe' });
    }

    // Validar que el responsable EXISTE (no importa si está activo)
    const [responsable] = await db.query(
      'SELECT id, nombre FROM usuario WHERE nombre = ?',
      [responsable_nombre]
    );
    if (!responsable.length) {
      return res.status(400).json({ 
        ok: false, 
        error: 'El responsable no existe en el sistema' 
      });
    }

    // INSERT sin hash_actual (el trigger lo generará automáticamente)
    const [result] = await db.query(
      `INSERT INTO inventario (nombre, categoria_id, estado, responsable_nombre)
       VALUES (?, ?, ?, ?)`,
      [nombre, categoria_id, estado, responsable_nombre]
    );

    // Insertar en historial
    await db.query(
      `INSERT INTO historial (accion, nombre_usuario, inventario_id)
       VALUES ('INSERT', ?, ?)`,
      [usuario_logueado, result.insertId]
    );

    // Recuperar el registro insertado CON el hash generado por la BD
    const [nuevoRegistro] = await db.query(
      `SELECT id, nombre, hash_actual, fecha_creacion, fecha_ultima_actualizacion 
       FROM inventario WHERE id = ?`,
      [result.insertId]
    );

    res.json({
      ok: true,
      id: result.insertId,
      hash_actual: nuevoRegistro[0].hash_actual,
      fecha_creacion: nuevoRegistro[0].fecha_creacion,
      mensaje: 'Producto creado con hash generado automáticamente'
    });

  } catch (error) {
    console.error('🔥 ERROR CREATE INVENTARIO:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
};

// =============================================
// UPDATE INVENTARIO (solo validar que responsable existe)
// =============================================
exports.updateInventario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, categoria_id, estado, responsable_nombre } = req.body;
    const usuario_logueado = req.body.usuario_logueado || 'system';

    // Verificar si existe el producto
    const [existe] = await db.query('SELECT id FROM inventario WHERE id = ?', [id]);
    if (!existe.length) {
      return res.status(404).json({ ok: false, error: 'Producto no encontrado' });
    }

    // Validar que el responsable EXISTE (no importa si está activo)
    const [responsable] = await db.query(
      'SELECT id, nombre FROM usuario WHERE nombre = ?',
      [responsable_nombre]
    );
    if (!responsable.length) {
      return res.status(400).json({ 
        ok: false, 
        error: 'El responsable no existe en el sistema' 
      });
    }

    // UPDATE sin hash_actual (el trigger lo actualizará automáticamente)
    await db.query(
      `UPDATE inventario 
       SET nombre = ?, categoria_id = ?, estado = ?, responsable_nombre = ?
       WHERE id = ?`,
      [nombre, categoria_id, estado, responsable_nombre, id]
    );

    // Insertar en historial
    await db.query(
      `INSERT INTO historial (accion, nombre_usuario, inventario_id)
       VALUES ('UPDATE', ?, ?)`,
      [usuario_logueado, id]
    );

    // Recuperar el registro actualizado
    const [registroActualizado] = await db.query(
      `SELECT id, nombre, hash_actual, fecha_creacion, fecha_ultima_actualizacion 
       FROM inventario WHERE id = ?`,
      [id]
    );

    res.json({ 
      ok: true, 
      hash_actualizado: registroActualizado[0].hash_actual,
      fecha_ultima_actualizacion: registroActualizado[0].fecha_ultima_actualizacion,
      mensaje: 'Producto actualizado, hash recalculado automáticamente'
    });

  } catch (error) {
    console.error('🔥 ERROR UPDATE INVENTARIO:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
};

// =============================================
// DELETE INVENTARIO (sin validaciones extras)
// =============================================
exports.deleteInventario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_logueado = req.body.usuario_logueado || 'system';

    // Verificar si existe el producto
    const [existe] = await db.query('SELECT id FROM inventario WHERE id = ?', [id]);
    if (!existe.length) {
      return res.status(404).json({ ok: false, error: 'Producto no encontrado' });
    }

    // Insertar en historial ANTES de eliminar
    await db.query(
      `INSERT INTO historial (accion, nombre_usuario, inventario_id)
       VALUES ('DELETE', ?, ?)`,
      [usuario_logueado, id]
    );

    // Eliminar el producto
    await db.query('DELETE FROM inventario WHERE id = ?', [id]);

    res.json({ ok: true, mensaje: 'Producto eliminado' });

  } catch (error) {
    console.error('🔥 ERROR DELETE INVENTARIO:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
};

// =============================================
// GET QR (verificar integridad)
// =============================================
exports.getQR = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT 
        i.id, 
        i.nombre, 
        i.hash_actual,
        i.estado,
        i.responsable_nombre,
        i.fecha_creacion,
        i.fecha_ultima_actualizacion,
        c.nombre AS categoria
       FROM inventario i
       INNER JOIN categoria c ON i.categoria_id = c.id
       WHERE i.id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ ok: false, error: 'Producto no encontrado' });
    }

    const producto = rows[0];
    
    const [verificacion] = await db.query(
      `SELECT 
        CASE 
          WHEN hash_actual = SHA2(CONCAT_WS('|', nombre, estado, categoria_id, responsable_nombre), 256)
          THEN 1
          ELSE 0
        END AS es_integrity
       FROM inventario 
       WHERE id = ?`,
      [id]
    );

    res.json({
      ok: true,
      data: {
        id: producto.id,
        nombre: producto.nombre,
        categoria: producto.categoria,
        estado: producto.estado,
        responsable: producto.responsable_nombre,
        hash_actual: producto.hash_actual,
        fecha_creacion: producto.fecha_creacion,
        fecha_ultima_actualizacion: producto.fecha_ultima_actualizacion,
        integridad_valida: verificacion[0].es_integrity === 1,
        mensaje: verificacion[0].es_integrity === 1 
          ? '✅ Producto íntegro' 
          : '❌ Datos corruptos o modificados manualmente'
      }
    });

  } catch (error) {
    console.error('🔥 ERROR GET QR:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
};

// =============================================
// VERIFICAR INTEGRIDAD GLOBAL
// =============================================
exports.verificarIntegridadGlobal = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        i.id,
        i.nombre,
        i.estado,
        i.responsable_nombre,
        i.fecha_creacion,
        i.fecha_ultima_actualizacion,
        c.nombre AS categoria,
        i.hash_actual AS hash_guardado,
        SHA2(CONCAT_WS('|', i.nombre, i.estado, i.categoria_id, i.responsable_nombre), 256) AS hash_deberia_ser,
        CASE 
          WHEN i.hash_actual = SHA2(CONCAT_WS('|', i.nombre, i.estado, i.categoria_id, i.responsable_nombre), 256)
          THEN '✅ ÍNTEGRO'
          ELSE '❌ CORRUPTO'
        END AS estado_integridad
      FROM inventario i
      INNER JOIN categoria c ON i.categoria_id = c.id
    `);
    
    const corruptos = rows.filter(r => r.estado_integridad === '❌ CORRUPTO');
    
    const porcentaje = rows.length > 0 
      ? ((rows.length - corruptos.length) / rows.length * 100).toFixed(2)
      : 0;
    
    res.json({
      ok: true,
      total_productos: rows.length,
      productos_corruptos: corruptos.length,
      integridad_porcentaje: porcentaje,
      lista_detallada: rows
    });
    
  } catch (error) {
    console.error('🔥 ERROR VERIFICAR INTEGRIDAD:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
};
// GET /api/inventario/stats
exports.getStats = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM vista_dashboard_estadisticas');
    res.json({ ok: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};