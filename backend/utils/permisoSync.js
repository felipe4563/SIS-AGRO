const VENDEDOR_BASE   = [6, 15, 33, 34, 40, 43];
const ALMACENERO_BASE = [15, 33, 34, 39, 43];

const VENDEDOR_POR_MODULO = {
  ventas:           [77, 78, 79, 81, 82, 83, 88],
  clientes:         [69, 70, 71, 72, 75, 76],
  caja:             [93, 97, 98, 99, 100, 101],
  reportes_basicos: [102, 103, 104, 105, 106, 119],
};

const ALMACENERO_POR_MODULO = {
  inventario:       [45, 46, 47, 48, 49, 50, 52, 53, 54],
  traslados:        [51, 89, 90, 91, 92],
  compras:          [61, 62, 63, 64, 66, 107, 108],
  proveedores:      [55, 56, 57, 58, 60],
  reportes_basicos: [109, 110, 114, 115, 116, 119],
  libro_caja:       [122, 123, 127],
};

/**
 * Agrega (sin eliminar) los permisos que corresponden al plan
 * a los roles VENDEDOR y ALMACENERO de la empresa.
 * Solo suma — nunca quita permisos existentes.
 *
 * @param {number}   id_empresa
 * @param {string[]} modulos     - Array de módulos del plan (plan.modulos parseado)
 * @param {object}   conn        - Conexión de pool con promise() o connection de transacción
 */
async function sincronizarPermisosRoles(id_empresa, modulos, conn) {
  const [roles] = await conn.query(
    `SELECT id_rol, nombre FROM rol
     WHERE id_empresa = ? AND nombre IN ('VENDEDOR', 'ALMACENERO')`,
    [id_empresa]
  );
  if (!roles.length) return;

  const [todosPermisos] = await conn.query('SELECT id_permiso FROM permiso');
  const existentes = new Set(todosPermisos.map(p => p.id_permiso));

  for (const rol of roles) {
    const ids = rol.nombre === 'VENDEDOR'
      ? calcularVendedor(modulos)
      : calcularAlmacenero(modulos);

    const validos = ids.filter(id => existentes.has(id));
    if (!validos.length) continue;

    await conn.query(
      'INSERT IGNORE INTO rol_permiso (id_rol, id_permiso) VALUES ?',
      [validos.map(id => [rol.id_rol, id])]
    );
  }
}

function calcularVendedor(modulos) {
  const set = new Set(VENDEDOR_BASE);
  for (const mod of modulos) {
    (VENDEDOR_POR_MODULO[mod] ?? []).forEach(id => set.add(id));
  }
  if (modulos.includes('ventas')) {
    set.add(129); // creditos.ver
    set.add(130); // creditos.abonar
    set.add(131); // creditos.reporte
  }
  return [...set];
}

function calcularAlmacenero(modulos) {
  const set = new Set(ALMACENERO_BASE);
  for (const mod of modulos) {
    (ALMACENERO_POR_MODULO[mod] ?? []).forEach(id => set.add(id));
  }
  if (modulos.includes('compras')) {
    set.add(129); // creditos.ver
    set.add(130); // creditos.abonar
    set.add(131); // creditos.reporte
  }
  return [...set];
}

module.exports = {
  sincronizarPermisosRoles,
  calcularVendedor,
  calcularAlmacenero,
  VENDEDOR_BASE,
  ALMACENERO_BASE,
  VENDEDOR_POR_MODULO,
  ALMACENERO_POR_MODULO,
};
