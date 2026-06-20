const db = require('../config/db');

const listar = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const puedeVerTodas = req.user.permisos.includes('movimientos.ver_todas');
  const { desde, hasta, tipo } = req.query;

  const where = ['(m.id_sucursal IS NULL OR s.id_empresa = ?)'];
  const params = [id_empresa];

  if (!puedeVerTodas) {
    where.push('m.id_sucursal = ?');
    params.push(req.user.id_sucursal);
  }
  if (desde && hasta) {
    where.push('m.fecha BETWEEN ? AND ?');
    params.push(desde, hasta);
  }
  if (tipo && ['INGRESO', 'EGRESO'].includes(tipo)) {
    where.push('m.tipo = ?');
    params.push(tipo);
  }

  try {
    const [rows] = await db.promise().query(
      `SELECT m.*, cm.nombre AS categoria_nombre,
              COALESCE(s.nombre, 'General') AS sucursal_nombre
       FROM movimiento m
       LEFT JOIN categoria_movimiento cm ON cm.id_categoria = m.id_categoria
       LEFT JOIN sucursal s ON s.id_sucursal = m.id_sucursal
       WHERE ${where.join(' AND ')}
       ORDER BY m.fecha DESC, m.created_at DESC`,
      params
    );
    return res.json(rows);
  } catch (err) {
    console.error('[listar movimientos]', err);
    return res.status(500).json({ error: 'Error al obtener los movimientos' });
  }
};

const crear = async (req, res) => {
  const { tipo, id_categoria, descripcion, monto, fecha, id_sucursal, observaciones } = req.body;
  const puedeVerTodas = req.user.permisos.includes('movimientos.ver_todas');

  if (!['INGRESO', 'EGRESO'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo inválido' });
  }
  const descTxt = String(descripcion ?? '').trim();
  if (!descTxt) {
    return res.status(400).json({ error: 'La descripción es obligatoria' });
  }
  if (!monto || parseFloat(monto) <= 0) {
    return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
  }
  if (!fecha) {
    return res.status(400).json({ error: 'La fecha es obligatoria' });
  }
  if (!id_categoria) {
    return res.status(400).json({ error: 'La categoría es obligatoria' });
  }

  const id_empresa = req.user.id_empresa;

  try {
    const [cats] = await db.promise().query(
      'SELECT id_categoria FROM categoria_movimiento WHERE id_categoria = ? AND id_empresa = ? AND activo = 1',
      [id_categoria, id_empresa]
    );
    if (cats.length === 0) {
      return res.status(400).json({ error: 'Categoría no válida' });
    }

    const sucursalFinal = puedeVerTodas ? (id_sucursal || null) : req.user.id_sucursal;
    if (sucursalFinal) {
      const [sucRows] = await db.promise().query(
        'SELECT id_sucursal FROM sucursal WHERE id_sucursal = ? AND id_empresa = ?',
        [sucursalFinal, id_empresa]
      );
      if (sucRows.length === 0) {
        return res.status(400).json({ error: 'Sucursal no válida' });
      }
    }

    const [result] = await db.promise().query(
      `INSERT INTO movimiento (tipo, id_categoria, descripcion, monto, fecha, id_sucursal, id_usuario, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [tipo, id_categoria, descTxt, monto, fecha, sucursalFinal, req.user.id_usuario, observaciones || null]
    );

    const [rows] = await db.promise().query(
      `SELECT m.*, cm.nombre AS categoria_nombre,
              COALESCE(s.nombre, 'General') AS sucursal_nombre
       FROM movimiento m
       LEFT JOIN categoria_movimiento cm ON cm.id_categoria = m.id_categoria
       LEFT JOIN sucursal s ON s.id_sucursal = m.id_sucursal
       WHERE m.id_movimiento = ?`,
      [result.insertId]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[crear movimiento]', err);
    return res.status(500).json({ error: 'Error al crear el movimiento' });
  }
};

const actualizar = async (req, res) => {
  const { id } = req.params;
  const { tipo, id_categoria, descripcion, monto, fecha, id_sucursal, observaciones } = req.body;
  const puedeVerTodas = req.user.permisos.includes('movimientos.ver_todas');

  if (!['INGRESO', 'EGRESO'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo inválido' });
  }
  const descTxt = String(descripcion ?? '').trim();
  if (!descTxt) {
    return res.status(400).json({ error: 'La descripción es obligatoria' });
  }
  if (!monto || parseFloat(monto) <= 0) {
    return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
  }
  if (!fecha) {
    return res.status(400).json({ error: 'La fecha es obligatoria' });
  }

  const id_empresa = req.user.id_empresa;

  try {
    const [existing] = await db.promise().query(
      `SELECT m.id_movimiento, m.id_sucursal FROM movimiento m
       LEFT JOIN sucursal s ON s.id_sucursal = m.id_sucursal
       WHERE m.id_movimiento = ? AND (m.id_sucursal IS NULL OR s.id_empresa = ?)`,
      [id, id_empresa]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }
    if (!puedeVerTodas && existing[0].id_sucursal !== req.user.id_sucursal) {
      return res.status(403).json({ error: 'Sin permiso para editar este movimiento' });
    }

    const sucursalFinal = puedeVerTodas ? (id_sucursal || null) : req.user.id_sucursal;

    await db.promise().query(
      `UPDATE movimiento
       SET tipo=?, id_categoria=?, descripcion=?, monto=?, fecha=?, id_sucursal=?, observaciones=?
       WHERE id_movimiento=?`,
      [tipo, id_categoria, descTxt, monto, fecha, sucursalFinal, observaciones || null, id]
    );

    const [rows] = await db.promise().query(
      `SELECT m.*, cm.nombre AS categoria_nombre,
              COALESCE(s.nombre, 'General') AS sucursal_nombre
       FROM movimiento m
       LEFT JOIN categoria_movimiento cm ON cm.id_categoria = m.id_categoria
       LEFT JOIN sucursal s ON s.id_sucursal = m.id_sucursal
       WHERE m.id_movimiento = ?`,
      [id]
    );
    return res.json(rows[0]);
  } catch (err) {
    console.error('[actualizar movimiento]', err);
    return res.status(500).json({ error: 'Error al actualizar el movimiento' });
  }
};

const eliminar = async (req, res) => {
  const { id } = req.params;
  const puedeVerTodas = req.user.permisos.includes('movimientos.ver_todas');

  const id_empresa = req.user.id_empresa;

  try {
    const [existing] = await db.promise().query(
      `SELECT m.id_movimiento, m.id_sucursal FROM movimiento m
       LEFT JOIN sucursal s ON s.id_sucursal = m.id_sucursal
       WHERE m.id_movimiento = ? AND (m.id_sucursal IS NULL OR s.id_empresa = ?)`,
      [id, id_empresa]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }
    if (!puedeVerTodas && existing[0].id_sucursal !== req.user.id_sucursal) {
      return res.status(403).json({ error: 'Sin permiso para eliminar este movimiento' });
    }

    await db.promise().query('DELETE FROM movimiento WHERE id_movimiento = ?', [id]);
    return res.json({ mensaje: 'Movimiento eliminado' });
  } catch (err) {
    console.error('[eliminar movimiento]', err);
    return res.status(500).json({ error: 'Error al eliminar el movimiento' });
  }
};

const libroCaja = async (req, res) => {
  const { desde, hasta, id_sucursal, tipo } = req.query;
  const id_empresa = req.user.id_empresa;
  const puedeVerTodas = req.user.permisos.includes('movimientos.ver_todas');
  const sucursalId = !puedeVerTodas ? req.user.id_sucursal : (id_sucursal || null);

  const ventasConds  = ['v.estado = ?', 'sv.id_empresa = ?'];
  const ventasParams = ['COMPLETADA', id_empresa];
  const comprasConds  = ['c.estado != ?', 'sc.id_empresa = ?'];
  const comprasParams = ['CANCELADO', id_empresa];
  const movConds  = ['(m.id_sucursal IS NULL OR sm.id_empresa = ?)'];
  const movParams = [id_empresa];

  if (desde && hasta) {
    ventasConds.push('DATE(v.fecha_venta) BETWEEN ? AND ?');
    ventasParams.push(desde, hasta);
    comprasConds.push('c.fecha_compra BETWEEN ? AND ?');
    comprasParams.push(desde, hasta);
    movConds.push('m.fecha BETWEEN ? AND ?');
    movParams.push(desde, hasta);
  }

  if (sucursalId) {
    ventasConds.push('v.id_sucursal = ?');
    ventasParams.push(sucursalId);
    comprasConds.push('c.id_sucursal = ?');
    comprasParams.push(sucursalId);
    movConds.push('m.id_sucursal = ?');
    movParams.push(sucursalId);
  }

  const vWhere = `WHERE ${ventasConds.join(' AND ')}`;
  const cWhere = `WHERE ${comprasConds.join(' AND ')}`;
  const mWhere = `WHERE ${movConds.join(' AND ')}`;

  const tipoValido = tipo && ['INGRESO', 'EGRESO'].includes(tipo);
  const tipoFilter = tipoValido ? 'WHERE tipo = ?' : '';
  const tipoParam  = tipoValido ? [tipo] : [];

  const sql = `
    SELECT fecha, tipo, categoria, descripcion, monto, origen, id_origen, sucursal
    FROM (
      SELECT
        DATE(v.fecha_venta)  AS fecha,
        CONVERT('INGRESO' USING utf8mb4)  AS tipo,
        CONVERT('Venta'   USING utf8mb4)  AS categoria,
        CONVERT(CONCAT('Venta #', v.id_venta,
          IF(cl.nombre IS NOT NULL, CONCAT(' - ', cl.nombre), '')) USING utf8mb4) AS descripcion,
        v.total              AS monto,
        CONVERT('venta'   USING utf8mb4)  AS origen,
        v.id_venta           AS id_origen,
        CONVERT(COALESCE(sv.nombre, 'General') USING utf8mb4) AS sucursal
      FROM venta v
      LEFT JOIN cliente  cl ON cl.id_cliente  = v.id_cliente
      LEFT JOIN sucursal sv ON sv.id_sucursal = v.id_sucursal
      ${vWhere}

      UNION ALL

      SELECT
        c.fecha_compra       AS fecha,
        CONVERT('EGRESO'  USING utf8mb4)  AS tipo,
        CONVERT('Compra'  USING utf8mb4)  AS categoria,
        CONVERT(CONCAT('Compra #', c.id_compra, ' - ', COALESCE(p.empresa, '')) USING utf8mb4) AS descripcion,
        c.total              AS monto,
        CONVERT('compra'  USING utf8mb4)  AS origen,
        c.id_compra          AS id_origen,
        CONVERT(COALESCE(sc.nombre, 'General') USING utf8mb4) AS sucursal
      FROM compra c
      LEFT JOIN proveedor p  ON p.id_proveedor = c.id_proveedor
      LEFT JOIN sucursal  sc ON sc.id_sucursal  = c.id_sucursal
      ${cWhere}

      UNION ALL

      SELECT
        m.fecha              AS fecha,
        CONVERT(m.tipo       USING utf8mb4) AS tipo,
        CONVERT(COALESCE(cm.nombre, 'Sin categoria') USING utf8mb4) AS categoria,
        CONVERT(m.descripcion USING utf8mb4) AS descripcion,
        m.monto              AS monto,
        CONVERT('movimiento' USING utf8mb4) AS origen,
        m.id_movimiento      AS id_origen,
        CONVERT(COALESCE(sm.nombre, 'General') USING utf8mb4) AS sucursal
      FROM movimiento m
      LEFT JOIN categoria_movimiento cm ON cm.id_categoria = m.id_categoria
      LEFT JOIN sucursal             sm ON sm.id_sucursal   = m.id_sucursal
      ${mWhere}
    ) AS todos
    ${tipoFilter}
    ORDER BY fecha DESC, origen ASC
  `;

  const allParams = [...ventasParams, ...comprasParams, ...movParams, ...tipoParam];

  try {
    const [rows] = await db.promise().query(sql, allParams);

    let total_ingresos = 0;
    let total_egresos  = 0;
    for (const row of rows) {
      const monto = parseFloat(row.monto) || 0;
      if (row.tipo === 'INGRESO') total_ingresos += monto;
      else total_egresos += monto;
    }

    return res.json({
      movimientos: rows,
      resumen: {
        total_ingresos: total_ingresos.toFixed(2),
        total_egresos:  total_egresos.toFixed(2),
        balance:        (total_ingresos - total_egresos).toFixed(2),
      },
    });
  } catch (err) {
    console.error('[libroCaja]', err);
    return res.status(500).json({ error: 'Error al obtener el libro de caja' });
  }
};

module.exports = { listar, crear, actualizar, eliminar, libroCaja };
