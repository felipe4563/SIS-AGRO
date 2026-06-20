/**
 * Genera la plantilla Excel para carga manual de inventario.
 * Uso: node backend/scripts/generar_plantilla_inventario.js
 * Salida: bd/PLANTILLA_INVENTARIO.xlsx
 */

const XLSX = require('xlsx');
const path = require('path');
const fs   = require('fs');

// ── Hoja 1: INVENTARIO ────────────────────────────────────────────────────────

const encabezados = [
  // Datos del Producto
  'nombre_producto',
  'clasificacion',
  'marca',
  'unidad_medida',
  'precio_mayor_bs',
  'precio_menor_bs',
  // Sucursal donde estará el stock
  'sucursal',
  // Datos del Lote
  'numero_lote',
  'fecha_vencimiento',
  'fecha_produccion',
  'fecha_ingreso',
  'cantidad_cajas',
  'unidades_por_caja',
  'precio_costo_por_caja_bs',
  'stock_cajas',
  'stock_unidades',
  'observaciones',
];

const descripciones = [
  // Producto
  'Nombre del producto (ej: Urea 46% Granulada)',
  'Categoría (ej: Semillas / Fertilizantes / Agroquímicos / Veterinaria)',
  'Marca o laboratorio (ej: Yara / Bayer / Zoetis)',
  'Unidad de venta (ej: kg / lt / unidad / saco)',
  'Precio de venta al por MAYOR en Bs',
  'Precio de venta al por MENOR en Bs',
  // Sucursal
  'Nombre de la sucursal donde estará el stock (ej: Sucursal Central)',
  // Lote
  'Número o código del lote (ej: L-URE-2601) — opcional',
  'Fecha de vencimiento DD/MM/AAAA — dejar vacío si no aplica',
  'Fecha de producción/fabricación DD/MM/AAAA — opcional',
  'Fecha de ingreso al almacén DD/MM/AAAA — OBLIGATORIO',
  'Cantidad de cajas/sacos/paquetes que ingresaron',
  'Unidades dentro de cada caja (poner 1 si se vende por unidad)',
  'Precio de compra (costo) por caja en Bs',
  'Stock actual en cajas completas',
  'Stock actual en unidades sueltas (0 si no hay)',
  'Notas adicionales — opcional',
];

const ej1 = [
  'Semilla Maíz Híbrido DK-7088', 'Semillas', 'SeedCo', 'bolsa',
  120.00, 135.00,
  'Sucursal Central',
  'L-MAI-2601', '30/09/2027', '01/10/2025', '10/01/2026',
  50, 1, 120.00, 45, 45, '',
];

const ej2 = [
  'Urea 46% Granulada', 'Fertilizantes', 'Yara', 'saco',
  210.00, 235.00,
  'Sucursal Norte',
  'L-URE-2601', '31/07/2028', '01/08/2025', '15/01/2026',
  40, 1, 185.00, 38, 38, 'Almacenado en silo 2',
];

const ej3 = [
  'Balanceado Iniciador Pollos Parrillero', 'Alimento Animal', 'Ciproquim', 'saco',
  195.00, 215.00,
  'Sucursal Cochabamba',
  'L-BAL-2603', '31/12/2026', '01/01/2026', '15/03/2026',
  30, 1, 170.00, 10, 10, '',
];

const wsInventario = XLSX.utils.aoa_to_sheet([
  encabezados,
  descripciones,
  ej1,
  ej2,
  ej3,
]);

wsInventario['!cols'] = [
  { wch: 38 }, // nombre_producto
  { wch: 20 }, // clasificacion
  { wch: 18 }, // marca
  { wch: 14 }, // unidad_medida
  { wch: 18 }, // precio_mayor_bs
  { wch: 18 }, // precio_menor_bs
  { wch: 24 }, // sucursal
  { wch: 18 }, // numero_lote
  { wch: 20 }, // fecha_vencimiento
  { wch: 20 }, // fecha_produccion
  { wch: 20 }, // fecha_ingreso
  { wch: 16 }, // cantidad_cajas
  { wch: 20 }, // unidades_por_caja
  { wch: 26 }, // precio_costo_por_caja_bs
  { wch: 14 }, // stock_cajas
  { wch: 18 }, // stock_unidades
  { wch: 30 }, // observaciones
];

// ── Hoja 2: INSTRUCCIONES ─────────────────────────────────────────────────────

const instrucciones = [
  ['INSTRUCCIONES — PLANTILLA DE INVENTARIO SIS-AGRO'],
  [''],
  ['ESTRUCTURA DE LA PLANTILLA'],
  ['La plantilla tiene dos secciones: datos del PRODUCTO y datos del LOTE.'],
  ['Un mismo producto puede tener varios lotes (distintas fechas, sucursales o precios).'],
  ['Cada fila = un lote de un producto en una sucursal.'],
  [''],
  ['DATOS DEL PRODUCTO (columnas A–F)'],
  ['nombre_producto   → Nombre del producto tal como aparecerá en el sistema.'],
  ['clasificacion     → Categoría: Semillas / Fertilizantes / Agroquímicos / Veterinaria /'],
  ['                    Herramientas / Alimento Animal / Riego / Foliares'],
  ['marca             → Nombre de la marca o laboratorio.'],
  ['unidad_medida     → Cómo se vende al cliente (kg / lt / saco / bolsa / unidad / frasco).'],
  ['precio_mayor_bs   → Precio de venta al por mayor en Bolivianos.'],
  ['precio_menor_bs   → Precio de venta al por menor en Bolivianos.'],
  [''],
  ['SUCURSAL (columna G)'],
  ['sucursal          → Nombre exacto de la sucursal donde está físicamente el stock.'],
  ['                    Si el mismo lote está en varias sucursales, poner una fila por sucursal.'],
  [''],
  ['DATOS DEL LOTE (columnas H–Q)'],
  ['numero_lote       → Código de identificación del lote (ej: L-MAI-2601). Opcional.'],
  ['fecha_vencimiento → Fecha de vencimiento en formato DD/MM/AAAA. Dejar vacío si no vence.'],
  ['fecha_produccion  → Fecha de fabricación en formato DD/MM/AAAA. Opcional.'],
  ['fecha_ingreso     → Fecha en que entró al almacén. OBLIGATORIO. Formato DD/MM/AAAA.'],
  ['cantidad_cajas    → Número total de cajas/sacos que llegaron originalmente.'],
  ['unidades_por_caja → Cuántas unidades trae cada caja. Si vendes por unidad suelta: poner 1.'],
  ['precio_costo_...  → Precio de COMPRA (costo) por caja en Bolivianos.'],
  ['stock_cajas       → Cajas completas que hay AHORA físicamente.'],
  ['stock_unidades    → Unidades sueltas que hay AHORA. Si no hay unidades sueltas: poner 0.'],
  ['observaciones     → Cualquier nota: ubicación en bodega, estado del lote, etc.'],
  [''],
  ['PASOS PARA LLENAR'],
  ['1. Borra las filas de ejemplo (filas 3, 4 y 5) y empieza desde la fila 3.'],
  ['2. Llena una fila por cada lote de cada producto en cada sucursal.'],
  ['3. Si el mismo producto tiene stock en 2 sucursales, pon 2 filas (una por sucursal).'],
  ['4. Si el mismo producto tiene 2 lotes distintos en la misma sucursal, pon 2 filas.'],
  ['5. Las fechas SIEMPRE en formato DD/MM/AAAA (ej: 15/06/2026).'],
  ['6. Los números decimales con punto: 210.50 (NO coma).'],
  ['7. Una vez completado, guarda el archivo y entrégalo al responsable del sistema.'],
  [''],
  ['NOTAS'],
  ['- NO modificar los encabezados de la fila 1.'],
  ['- NO dejar filas vacías entre registros.'],
  ['- Si un producto no tiene fecha de vencimiento (herramientas, maquinaria), dejar vacío.'],
];

const wsInstrucciones = XLSX.utils.aoa_to_sheet(instrucciones);
wsInstrucciones['!cols'] = [{ wch: 95 }];

// ── Workbook ───────────────────────────────────────────────────────────────────

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, wsInventario,    'INVENTARIO');
XLSX.utils.book_append_sheet(wb, wsInstrucciones, 'INSTRUCCIONES');

const outputPath = path.join(__dirname, '../../bd/PLANTILLA_INVENTARIO.xlsx');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
XLSX.writeFile(wb, outputPath);

console.log(`✅ Plantilla generada: ${outputPath}`);
