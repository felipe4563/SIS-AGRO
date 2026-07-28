const db     = require('../../config/db');
const PDFDoc = require('pdfkit');

// ── helpers ────────────────────────────────────────────────────────────────
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const fmtMonto = (n) => `Bs ${Number(n ?? 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

async function fetchData(year, month) {
  const [ingresosMes] = await db.promise().query(
    `SELECT MONTH(fecha_pago) AS mes, COUNT(*) AS cantidad_pagos, COALESCE(SUM(monto),0) AS total
     FROM pago_suscripcion
     WHERE estado='PAGADO' AND YEAR(fecha_pago)=?
     GROUP BY MONTH(fecha_pago) ORDER BY mes`,
    [year]
  );

  let ingresosFiltro;
  if (month) {
    [ingresosFiltro] = await db.promise().query(
      `SELECT DAY(fecha_pago) AS dia, COUNT(*) AS cantidad_pagos, COALESCE(SUM(monto),0) AS total
       FROM pago_suscripcion
       WHERE estado='PAGADO' AND YEAR(fecha_pago)=? AND MONTH(fecha_pago)=?
       GROUP BY DAY(fecha_pago) ORDER BY dia`,
      [year, month]
    );
  } else {
    ingresosFiltro = ingresosMes;
  }

  const [[totalesPeriodo]] = await db.promise().query(
    month
      ? `SELECT COALESCE(SUM(monto),0) AS total, COUNT(*) AS cantidad
         FROM pago_suscripcion WHERE estado='PAGADO' AND YEAR(fecha_pago)=? AND MONTH(fecha_pago)=?`
      : `SELECT COALESCE(SUM(monto),0) AS total, COUNT(*) AS cantidad
         FROM pago_suscripcion WHERE estado='PAGADO' AND YEAR(fecha_pago)=?`,
    month ? [year, month] : [year]
  );

  const [ingresosPlan] = await db.promise().query(
    month
      ? `SELECT pl.nombre AS plan, COUNT(ps.id_pago) AS cantidad, COALESCE(SUM(ps.monto),0) AS total
         FROM pago_suscripcion ps
         JOIN suscripcion s ON s.id_suscripcion=ps.id_suscripcion
         JOIN plan pl ON pl.id_plan=s.id_plan
         WHERE ps.estado='PAGADO' AND YEAR(ps.fecha_pago)=? AND MONTH(ps.fecha_pago)=?
         GROUP BY pl.id_plan, pl.nombre ORDER BY total DESC`
      : `SELECT pl.nombre AS plan, COUNT(ps.id_pago) AS cantidad, COALESCE(SUM(ps.monto),0) AS total
         FROM pago_suscripcion ps
         JOIN suscripcion s ON s.id_suscripcion=ps.id_suscripcion
         JOIN plan pl ON pl.id_plan=s.id_plan
         WHERE ps.estado='PAGADO' AND YEAR(ps.fecha_pago)=?
         GROUP BY pl.id_plan, pl.nombre ORDER BY total DESC`,
    month ? [year, month] : [year]
  );

  const [suscripcionesMes] = await db.promise().query(
    `SELECT MONTH(fecha_inicio) AS mes, COUNT(*) AS cantidad
     FROM suscripcion WHERE YEAR(fecha_inicio)=?
     GROUP BY MONTH(fecha_inicio) ORDER BY mes`,
    [year]
  );

  const [empresasMes] = await db.promise().query(
    `SELECT MONTH(creado_en) AS mes, COUNT(*) AS cantidad
     FROM empresa WHERE YEAR(creado_en)=?
     GROUP BY MONTH(creado_en) ORDER BY mes`,
    [year]
  );

  const [estadoSuscripciones] = await db.promise().query(
    `SELECT estado, COUNT(*) AS cantidad FROM suscripcion GROUP BY estado`
  );

  const [aniosDisponibles] = await db.promise().query(
    `SELECT DISTINCT YEAR(fecha_pago) AS anio FROM pago_suscripcion WHERE estado='PAGADO' ORDER BY anio DESC`
  );

  return {
    ingresosMes, ingresosFiltro, totalesPeriodo,
    ingresosPlan, suscripcionesMes, empresasMes,
    estadoSuscripciones,
    aniosDisponibles: aniosDisponibles.map(r => r.anio),
  };
}

// ── GET /admin/reportes  ────────────────────────────────────────────────────
const getReporte = async (req, res) => {
  const year  = parseInt(req.query.year)  || new Date().getFullYear();
  const month = parseInt(req.query.month) || null;

  try {
    const d = await fetchData(year, month);
    return res.json({
      year, month,
      periodo: {
        total: parseFloat(d.totalesPeriodo.total).toFixed(2),
        cantidad_pagos: d.totalesPeriodo.cantidad,
      },
      ingresos_filtro:      d.ingresosFiltro.map(r => ({ ...r, total: parseFloat(r.total).toFixed(2) })),
      ingresos_mes:         d.ingresosMes.map(r => ({ ...r, total: parseFloat(r.total).toFixed(2) })),
      ingresos_plan:        d.ingresosPlan.map(r => ({ ...r, total: parseFloat(r.total).toFixed(2) })),
      suscripciones_mes:    d.suscripcionesMes,
      empresas_mes:         d.empresasMes,
      estado_suscripciones: d.estadoSuscripciones,
      anios_disponibles:    d.aniosDisponibles,
    });
  } catch (err) {
    console.error('[admin/reportes]', err);
    return res.status(500).json({ error: 'Error al generar reporte' });
  }
};

// ── GET /admin/reportes/pdf  ────────────────────────────────────────────────
const getReportePDF = async (req, res) => {
  const year  = parseInt(req.query.year)  || new Date().getFullYear();
  const month = parseInt(req.query.month) || null;
  const periodoLabel = month ? `${MESES[month - 1]} ${year}` : `Año ${year}`;

  try {
    const d = await fetchData(year, month);

    // ── setup documento ─────────────────────────────────────────────────────
    const doc = new PDFDoc({ size: 'A4', margin: 50, bufferPages: true, info: {
      Title:   `Reporte Financiero SIS-AGRO — ${periodoLabel}`,
      Author:  'SIS-AGRO Admin',
      Subject: 'Resumen Financiero',
    }});

    const filename = `reporte-sisagro-${month ? `${String(month).padStart(2,'0')}-` : ''}${year}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    // ── colores ──────────────────────────────────────────────────────────────
    const C = {
      primary:  '#4f46e5',  // indigo-600
      accent:   '#10b981',  // emerald-500
      muted:    '#6b7280',
      light:    '#f4f4f5',
      dark:     '#18181b',
      white:    '#ffffff',
      border:   '#e4e4e7',
      rowAlt:   '#fafafa',
    };

    const W = doc.page.width - 100; // ancho útil (márgenes 50c/lado)

    // ════════════════════════════════════════════════════════════════════════
    // CABECERA
    // ════════════════════════════════════════════════════════════════════════
    doc.rect(50, 50, W, 72).fill(C.primary);

    doc.fillColor(C.white)
       .fontSize(20).font('Helvetica-Bold')
       .text('SIS-AGRO', 65, 62, { width: W - 20 });

    doc.fontSize(10).font('Helvetica')
       .text('Sistema Agropecuario — Panel Administrativo', 65, 86, { width: W - 20 });

    doc.fontSize(10).font('Helvetica-Bold')
       .text(`Reporte Financiero · ${periodoLabel}`, 65, 102, { width: W - 20 });

    // fecha de generación (derecha)
    const fechaGen = new Date().toLocaleDateString('es-BO', {
      day:'2-digit', month:'long', year:'numeric'
    });
    doc.fontSize(8).font('Helvetica')
       .fillColor('#c7d2fe')
       .text(`Generado el ${fechaGen}`, 65, 86, { width: W - 20, align: 'right' });

    doc.moveDown(0.5);
    let y = 140;

    // ════════════════════════════════════════════════════════════════════════
    // HELPER: sección con línea decorativa
    // ════════════════════════════════════════════════════════════════════════
    const section = (title) => {
      y += 18;
      doc.rect(50, y, 4, 14).fill(C.primary);
      doc.fillColor(C.dark).fontSize(11).font('Helvetica-Bold')
         .text(title, 60, y + 1, { width: W - 10 });
      y += 20;
      doc.moveTo(50, y).lineTo(50 + W, y).strokeColor(C.border).lineWidth(0.5).stroke();
      y += 8;
    };

    // ════════════════════════════════════════════════════════════════════════
    // HELPER: tabla
    // cols = [{ label, width, align }]
    // rows = [['cel1', 'cel2', ...], ...]
    // ════════════════════════════════════════════════════════════════════════
    const drawTable = (cols, rows, emptyMsg = 'Sin datos en este período') => {
      const rowH = 20;
      const PAD  = 8;

      // cabecera
      doc.rect(50, y, W, rowH).fill(C.primary);
      let cx = 50;
      cols.forEach(col => {
        doc.fillColor(C.white).fontSize(8).font('Helvetica-Bold')
           .text(col.label.toUpperCase(), cx + PAD, y + 6, {
             width: col.width - PAD * 2, align: col.align || 'left',
           });
        cx += col.width;
      });
      y += rowH;

      if (rows.length === 0) {
        doc.rect(50, y, W, rowH).fill(C.rowAlt);
        doc.fillColor(C.muted).fontSize(9).font('Helvetica')
           .text(emptyMsg, 50 + PAD, y + 6, { width: W - PAD * 2, align: 'center' });
        y += rowH;
      } else {
        rows.forEach((row, ri) => {
          // salto de página si se acerca al borde
          if (y + rowH > doc.page.height - 70) {
            doc.addPage();
            y = 50;
          }
          doc.rect(50, y, W, rowH).fill(ri % 2 === 0 ? C.white : C.rowAlt);
          // borde inferior
          doc.moveTo(50, y + rowH).lineTo(50 + W, y + rowH)
             .strokeColor(C.border).lineWidth(0.3).stroke();
          cx = 50;
          row.forEach((cell, ci) => {
            const isLast = ci === row.length - 1;
            doc.fillColor(isLast ? C.dark : C.muted)
               .fontSize(9).font(isLast ? 'Helvetica-Bold' : 'Helvetica')
               .text(String(cell), cx + PAD, y + 6, {
                 width: cols[ci].width - PAD * 2,
                 align: cols[ci].align || 'left',
               });
            cx += cols[ci].width;
          });
          y += rowH;
        });
      }
      y += 6;
    };

    // ════════════════════════════════════════════════════════════════════════
    // KPI CARDS (2 columnas)
    // ════════════════════════════════════════════════════════════════════════
    section('Resumen del período');

    const kpis = [
      { label: 'Total ingresos',       value: fmtMonto(d.totalesPeriodo.total),    color: C.accent },
      { label: 'Pagos recibidos',       value: String(d.totalesPeriodo.cantidad),   color: C.primary },
      { label: 'Empresas activas',
        value: String(d.estadoSuscripciones.find(e => e.estado === 'ACTIVA')?.cantidad ?? 0),
        color: '#8b5cf6' },
      { label: 'En período de prueba',
        value: String(d.estadoSuscripciones.find(e => e.estado === 'PRUEBA')?.cantidad ?? 0),
        color: '#f59e0b' },
    ];

    const cardW = (W - 12) / 2;
    const cardH = 52;
    kpis.forEach((kpi, i) => {
      const kx = 50 + (i % 2) * (cardW + 12);
      const ky = y + Math.floor(i / 2) * (cardH + 8);
      doc.roundedRect(kx, ky, cardW, cardH, 4).fill(C.light);
      doc.rect(kx, ky, 3, cardH).fill(kpi.color);
      doc.fillColor(C.muted).fontSize(8).font('Helvetica')
         .text(kpi.label, kx + 12, ky + 10, { width: cardW - 20 });
      doc.fillColor(kpi.color).fontSize(18).font('Helvetica-Bold')
         .text(kpi.value, kx + 12, ky + 24, { width: cardW - 20 });
    });
    y += Math.ceil(kpis.length / 2) * (cardH + 8) + 4;

    // ════════════════════════════════════════════════════════════════════════
    // TABLA: Ingresos del período (por día o por mes)
    // ════════════════════════════════════════════════════════════════════════
    section(month ? `Ingresos por día — ${MESES[month - 1]} ${year}` : `Ingresos por mes — ${year}`);

    const colsIngresos = month
      ? [
          { label: 'Fecha',      width: W * 0.45 },
          { label: 'Pagos',      width: W * 0.25, align: 'center' },
          { label: 'Total',      width: W * 0.30, align: 'right' },
        ]
      : [
          { label: 'Mes',        width: W * 0.45 },
          { label: 'Pagos',      width: W * 0.25, align: 'center' },
          { label: 'Total',      width: W * 0.30, align: 'right' },
        ];

    const rowsIngresos = d.ingresosFiltro.map(r => {
      const etiqueta = month
        ? `${String(r.dia).padStart(2,'0')}/${String(month).padStart(2,'0')}/${year}`
        : MESES[(r.mes ?? 1) - 1];
      return [etiqueta, r.cantidad_pagos, fmtMonto(r.total)];
    });

    // fila totales
    if (rowsIngresos.length > 0) {
      rowsIngresos.push(['TOTAL', d.totalesPeriodo.cantidad, fmtMonto(d.totalesPeriodo.total)]);
    }

    drawTable(colsIngresos, rowsIngresos);

    // ════════════════════════════════════════════════════════════════════════
    // TABLA: Ingresos por plan
    // ════════════════════════════════════════════════════════════════════════
    section(`Ingresos por plan — ${periodoLabel}`);
    drawTable(
      [
        { label: 'Plan',   width: W * 0.50 },
        { label: 'Pagos',  width: W * 0.25, align: 'center' },
        { label: 'Total',  width: W * 0.25, align: 'right' },
      ],
      d.ingresosPlan.map(r => [r.plan, r.cantidad, fmtMonto(r.total)])
    );

    // ════════════════════════════════════════════════════════════════════════
    // TABLA: Estado actual de suscripciones
    // ════════════════════════════════════════════════════════════════════════
    section('Estado actual de suscripciones');
    drawTable(
      [
        { label: 'Estado',    width: W * 0.70 },
        { label: 'Cantidad',  width: W * 0.30, align: 'center' },
      ],
      d.estadoSuscripciones.map(r => [r.estado, r.cantidad])
    );

    // ════════════════════════════════════════════════════════════════════════
    // TABLA: Nuevas suscripciones y empresas por mes (solo vista anual)
    // ════════════════════════════════════════════════════════════════════════
    if (!month) {
      section(`Nuevas suscripciones y empresas por mes — ${year}`);
      const susMap = Object.fromEntries(d.suscripcionesMes.map(r => [r.mes, r.cantidad]));
      const empMap = Object.fromEntries(d.empresasMes.map(r => [r.mes, r.cantidad]));
      const mesesConDatos = [...new Set([
        ...d.suscripcionesMes.map(r => r.mes),
        ...d.empresasMes.map(r => r.mes),
      ])].sort((a, b) => a - b);

      drawTable(
        [
          { label: 'Mes',                      width: W * 0.40 },
          { label: 'Suscripciones nuevas',     width: W * 0.30, align: 'center' },
          { label: 'Empresas nuevas',           width: W * 0.30, align: 'center' },
        ],
        mesesConDatos.map(m => [MESES[m - 1], susMap[m] ?? 0, empMap[m] ?? 0])
      );
    }

    // ════════════════════════════════════════════════════════════════════════
    // PIE DE PÁGINA — se agrega a todas las páginas al final
    // ════════════════════════════════════════════════════════════════════════
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      const pageH = doc.page.height;
      doc.moveTo(50, pageH - 50).lineTo(50 + W, pageH - 50)
         .strokeColor(C.border).lineWidth(0.5).stroke();
      doc.fillColor(C.muted).fontSize(8).font('Helvetica')
         .text(
           `SIS-AGRO — Reporte Financiero ${periodoLabel}   ·   Generado el ${fechaGen}   ·   Página ${i + 1} de ${range.count}`,
           50, pageH - 38, { width: W, align: 'center' }
         );
    }

    doc.flushPages();
    doc.end();
  } catch (err) {
    console.error('[admin/reportes/pdf]', err);
    if (!res.headersSent) res.status(500).json({ error: 'Error al generar PDF' });
  }
};

module.exports = { getReporte, getReportePDF };
