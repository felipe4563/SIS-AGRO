const db = require('../config/db');

const listarCajas = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  try {
    const puedeVerTodas = req.user.permisos.includes('caja.ver_todas');
    let query = `SELECT c.*, s.nombre as sucursal_nombre
                 FROM caja c
                 JOIN sucursal s ON c.id_sucursal = s.id_sucursal
                 WHERE s.id_empresa = ?`;
    const params = [id_empresa];
    if (!puedeVerTodas) {
      query += ' AND c.id_sucursal = ?';
      params.push(req.user.id_sucursal);
    }
    query += ' ORDER BY c.id_sucursal, c.nombre';
    const [rows] = await db.promise().query(query, params);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al listar cajas' });
  }
};

const crearCaja = async (req, res) => {
  const { nombre, descripcion, id_sucursal } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
  const sucursal = id_sucursal || req.user.id_sucursal;
  if (!sucursal) return res.status(400).json({ error: 'No se pudo determinar la sucursal. Selecciona una sucursal para esta caja.' });
  try {
    const [result] = await db.promise().query(
      'INSERT INTO caja (id_sucursal, nombre, descripcion) VALUES (?, ?, ?)',
      [sucursal, nombre.trim(), descripcion || null]
    );
    return res.status(201).json({ mensaje: 'Caja creada', id_caja: result.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al crear caja' });
  }
};

const editarCaja = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, id_sucursal } = req.body;
  const id_empresa = req.user.id_empresa;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
  try {
    const [cajaRows] = await db.promise().query(
      `SELECT c.id_caja FROM caja c
       JOIN sucursal s ON c.id_sucursal = s.id_sucursal
       WHERE c.id_caja = ? AND s.id_empresa = ?`,
      [id, id_empresa]
    );
    if (cajaRows.length === 0) return res.status(404).json({ error: 'Caja no encontrada' });

    const sucursal = id_sucursal || req.user.id_sucursal;
    const [sucursalRows] = await db.promise().query(
      'SELECT id_sucursal FROM sucursal WHERE id_sucursal = ? AND id_empresa = ?',
      [sucursal, id_empresa]
    );
    if (sucursalRows.length === 0) return res.status(400).json({ error: 'Sucursal no válida' });

    await db.promise().query(
      'UPDATE caja SET nombre = ?, descripcion = ?, id_sucursal = ? WHERE id_caja = ?',
      [nombre.trim(), descripcion || null, sucursal, id]
    );
    return res.json({ mensaje: 'Caja actualizada' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al editar caja' });
  }
};

const toggleCaja = async (req, res) => {
  const { id } = req.params;
  const id_empresa = req.user.id_empresa;
  try {
    const [rows] = await db.promise().query(
      `SELECT c.activo FROM caja c
       JOIN sucursal s ON c.id_sucursal = s.id_sucursal
       WHERE c.id_caja = ? AND s.id_empresa = ?`,
      [id, id_empresa]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Caja no encontrada' });
    const nuevoEstado = rows[0].activo ? 0 : 1;
    await db.promise().query('UPDATE caja SET activo = ? WHERE id_caja = ?', [nuevoEstado, id]);
    return res.json({ mensaje: `Caja ${nuevoEstado ? 'activada' : 'desactivada'}` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al cambiar estado de caja' });
  }
};

const listarTurnos = async (req, res) => {
  if (!req.user.permisos.includes('caja.ver_historial')) {
    return res.status(403).json({ error: 'Sin permiso para ver el historial de turnos' });
  }
  const id_empresa = req.user.id_empresa;
  try {
    const puedeVerTodas = req.user.permisos.includes('caja.ver_todas');
    let query = `SELECT ac.*, c.nombre as caja_nombre, s.nombre as sucursal_nombre,
                        u.nombre as usuario_nombre, u.apellido as usuario_apellido
                 FROM apertura_cierre_caja ac
                 JOIN caja c ON ac.id_caja = c.id_caja
                 JOIN sucursal s ON ac.id_sucursal = s.id_sucursal
                 JOIN usuario u ON ac.id_usuario = u.id_usuario
                 WHERE s.id_empresa = ?`;
    const params = [id_empresa];
    if (!puedeVerTodas) {
      query += ' AND ac.id_sucursal = ?';
      params.push(req.user.id_sucursal);
    }
    query += ' ORDER BY ac.fecha_apertura DESC LIMIT 200';
    const [rows] = await db.promise().query(query, params);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al listar turnos' });
  }
};

const obtenerTurnoActivo = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT ac.*, c.nombre as caja_nombre,
              u.nombre as usuario_nombre, u.apellido as usuario_apellido
       FROM apertura_cierre_caja ac
       JOIN caja c ON ac.id_caja = c.id_caja
       JOIN usuario u ON ac.id_usuario = u.id_usuario
       WHERE ac.id_sucursal = ? AND ac.estado = 'ABIERTA'
       ORDER BY ac.fecha_apertura DESC LIMIT 1`,
      [req.user.id_sucursal]
    );
    return res.json(rows.length === 0 ? null : rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener turno activo' });
  }
};

const abrirCaja = async (req, res) => {
  const { id_caja, monto_inicial, observaciones } = req.body;
  if (!id_caja) return res.status(400).json({ error: 'Debe seleccionar una caja' });

  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();

    // Bloquea la fila de la sucursal para serializar aperturas concurrentes
    // (doble clic / doble pestaña) y evitar dos turnos ABIERTA simultáneos.
    await conn.query('SELECT id_sucursal FROM sucursal WHERE id_sucursal = ? FOR UPDATE', [req.user.id_sucursal]);

    const [abiertos] = await conn.query(
      `SELECT id_apertura FROM apertura_cierre_caja WHERE id_sucursal = ? AND estado = 'ABIERTA'`,
      [req.user.id_sucursal]
    );
    if (abiertos.length > 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'Ya existe un turno abierto en esta sucursal. Cierre el turno actual primero.' });
    }
    const [cajaRows] = await conn.query(
      'SELECT id_caja FROM caja WHERE id_caja = ? AND id_sucursal = ? AND activo = 1',
      [id_caja, req.user.id_sucursal]
    );
    if (cajaRows.length === 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'Caja no válida para esta sucursal' });
    }
    const [result] = await conn.query(
      `INSERT INTO apertura_cierre_caja (id_caja, id_usuario, id_sucursal, monto_inicial, observaciones)
       VALUES (?, ?, ?, ?, ?)`,
      [id_caja, req.user.id_usuario, req.user.id_sucursal, parseFloat(monto_inicial) || 0, observaciones || null]
    );
    await conn.commit();
    return res.status(201).json({ mensaje: 'Turno abierto correctamente', id_apertura: result.insertId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return res.status(500).json({ error: 'Error al abrir turno' });
  } finally {
    conn.release();
  }
};

const cerrarCaja = async (req, res) => {
  const { id } = req.params;
  const { monto_final, observaciones } = req.body;
  try {
    const [turnoRows] = await db.promise().query(
      `SELECT * FROM apertura_cierre_caja WHERE id_apertura = ? AND id_sucursal = ? AND estado = 'ABIERTA'`,
      [id, req.user.id_sucursal]
    );
    if (turnoRows.length === 0) {
      return res.status(404).json({ error: 'Turno no encontrado o ya cerrado' });
    }
    const turno = turnoRows[0];
    if (turno.id_usuario !== req.user.id_usuario) {
      return res.status(403).json({ error: 'Solo el cajero que abrió este turno puede cerrarlo' });
    }

    const [ventasRows] = await db.promise().query(
      `SELECT COALESCE(SUM(total), 0) as total_efectivo
       FROM venta
       WHERE id_sucursal = ? AND metodo_pago = 'EFECTIVO' AND estado = 'COMPLETADA'
             AND fecha_venta >= ?`,
      [req.user.id_sucursal, turno.fecha_apertura]
    );
    const totalEfectivo = parseFloat(ventasRows[0].total_efectivo) || 0;
    const monto_esperado = parseFloat(turno.monto_inicial) + totalEfectivo;
    const monto_final_num = parseFloat(monto_final) || 0;
    const diferencia = monto_final_num - monto_esperado;

    await db.promise().query(
      `UPDATE apertura_cierre_caja
       SET monto_esperado = ?, monto_final = ?, diferencia = ?,
           observaciones = ?, fecha_cierre = NOW(), estado = 'CERRADA'
       WHERE id_apertura = ?`,
      [monto_esperado, monto_final_num, diferencia, observaciones || null, id]
    );
    return res.json({ mensaje: 'Turno cerrado correctamente', monto_esperado, monto_final: monto_final_num, diferencia });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al cerrar turno' });
  }
};

const listarMovimientosTurno = async (req, res) => {
  try {
    const [turnoRows] = await db.promise().query(
      `SELECT * FROM apertura_cierre_caja WHERE id_sucursal = ? AND estado = 'ABIERTA' ORDER BY fecha_apertura DESC LIMIT 1`,
      [req.user.id_sucursal]
    );
    if (turnoRows.length === 0) {
      return res.json({ turno: null, movimientos: [] });
    }
    const turno = turnoRows[0];

    const [rows] = await db.promise().query(
      `SELECT 'VENTA' AS origen, 'INGRESO' AS tipo, v.total AS monto,
              v.fecha_venta AS fecha,
              CONCAT('Venta #', v.id_venta) AS descripcion,
              v.nro_factura AS referencia
       FROM venta v
       WHERE v.id_sucursal = ? AND v.metodo_pago = 'EFECTIVO'
         AND v.estado = 'COMPLETADA' AND v.fecha_venta >= ?

       UNION ALL

       SELECT 'MOVIMIENTO' AS origen, m.tipo, m.monto,
              m.created_at AS fecha, m.descripcion, NULL AS referencia
       FROM movimiento m
       WHERE m.id_sucursal = ? AND m.created_at >= ?

       ORDER BY fecha DESC`,
      [req.user.id_sucursal, turno.fecha_apertura,
       req.user.id_sucursal, turno.fecha_apertura]
    );

    return res.json({ turno, movimientos: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al listar movimientos del turno' });
  }
};

module.exports = { listarCajas, crearCaja, editarCaja, toggleCaja, listarTurnos, obtenerTurnoActivo, abrirCaja, cerrarCaja, listarMovimientosTurno };
