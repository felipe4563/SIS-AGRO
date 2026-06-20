import { useState, useRef } from 'react';
import api from '../../api/axios';

const COL_INFO = [
  { col: 'A', campo: 'nombre_producto',        req: true  },
  { col: 'B', campo: 'clasificacion',           req: false },
  { col: 'C', campo: 'marca',                  req: false },
  { col: 'D', campo: 'unidad_medida',           req: false },
  { col: 'E', campo: 'precio_mayor_bs',         req: false },
  { col: 'F', campo: 'precio_menor_bs',         req: false },
  { col: 'G', campo: 'sucursal',               req: true  },
  { col: 'H', campo: 'numero_lote',            req: false },
  { col: 'I', campo: 'fecha_vencimiento',      req: false },
  { col: 'J', campo: 'fecha_produccion',       req: false },
  { col: 'K', campo: 'fecha_ingreso',          req: true  },
  { col: 'L', campo: 'cantidad_cajas',         req: false },
  { col: 'M', campo: 'unidades_por_caja',      req: false },
  { col: 'N', campo: 'precio_costo_por_caja_bs', req: false },
  { col: 'O', campo: 'stock_cajas',            req: false },
  { col: 'P', campo: 'stock_unidades',         req: false },
  { col: 'Q', campo: 'observaciones',          req: false },
];

export default function ImportarInventario() {
  const [archivo,    setArchivo]    = useState(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [cargando,   setCargando]   = useState(false);
  const [resultado,  setResultado]  = useState(null);
  const [error,      setError]      = useState('');
  const inputRef = useRef();

  const seleccionarArchivo = (file) => {
    setError('');
    setResultado(null);
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setError('Solo se aceptan archivos .xlsx (Excel)');
      return;
    }
    setArchivo(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setArrastrando(false);
    seleccionarArchivo(e.dataTransfer.files[0]);
  };

  const handleImportar = async () => {
    if (!archivo) return;
    setCargando(true);
    setError('');
    setResultado(null);
    try {
      const form = new FormData();
      form.append('archivo', archivo);
      const res = await api.post('/almacen/importar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResultado(res.data);
      setArchivo(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      setError(err.response?.data?.error || 'Error al importar el archivo');
    } finally {
      setCargando(false);
    }
  };

  const hayExito = resultado && resultado.procesados > 0;
  const hayErrores = resultado && resultado.errores?.length > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Encabezado */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Importar Inventario</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Carga masiva de productos y lotes desde la plantilla Excel oficial.
        </p>
      </div>

      {/* Zona de carga */}
      <div
        onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3
                    cursor-pointer transition-all duration-200
                    ${arrastrando
                      ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-400/10'
                      : archivo
                        ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-400/10'
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-yellow-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                    }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(e) => seleccionarArchivo(e.target.files[0])}
        />

        {/* Icono */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center
                        ${archivo ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
          {archivo ? (
            <svg className="w-7 h-7 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-zinc-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
          )}
        </div>

        {archivo ? (
          <>
            <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm">{archivo.name}</p>
            <p className="text-xs text-zinc-400">({(archivo.size / 1024).toFixed(1)} KB) — Haz clic para cambiar</p>
          </>
        ) : (
          <>
            <p className="font-semibold text-zinc-700 dark:text-zinc-200 text-sm">
              Arrastra el archivo aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-zinc-400">Solo archivos .xlsx · máx. 10 MB</p>
          </>
        )}
      </div>

      {/* Error de validación local */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-sm text-red-600 dark:text-red-400">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.008v.008H12v-.008Z" />
          </svg>
          {error}
        </div>
      )}

      {/* Botón importar */}
      <button
        onClick={handleImportar}
        disabled={!archivo || cargando}
        className="w-full py-3 rounded-xl text-sm font-semibold transition-all
                   bg-yellow-400 text-zinc-900 hover:bg-yellow-300
                   disabled:opacity-40 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
      >
        {cargando ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Importando…
          </>
        ) : 'Importar inventario'}
      </button>

      {/* Resultado */}
      {resultado && (
        <div className="space-y-4">
          {/* Resumen */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 text-center">
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{resultado.procesados}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5 uppercase tracking-wide font-semibold">Lotes creados</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 text-center">
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{resultado.productos_creados}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5 uppercase tracking-wide font-semibold">Productos nuevos</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 text-center">
              <p className="text-2xl font-black text-red-500 dark:text-red-400">{resultado.errores?.length ?? 0}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5 uppercase tracking-wide font-semibold">Errores</p>
            </div>
          </div>

          {hayExito && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-sm text-emerald-700 dark:text-emerald-400">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {resultado.procesados} lote(s) importado(s) correctamente · {resultado.productos_creados} producto(s) nuevo(s) creado(s).
            </div>
          )}

          {hayErrores && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  Filas con error ({resultado.errores.length})
                </p>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-64 overflow-y-auto">
                {resultado.errores.map((e, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3">
                    <span className="shrink-0 text-[10px] font-bold bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-md">
                      Fila {e.fila}
                    </span>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{e.motivo}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Referencia de columnas */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Estructura de la plantilla</p>
          <p className="text-xs text-zinc-400 mt-0.5">La fila 1 son los encabezados, la fila 2 las descripciones. Los datos comienzan en la fila 3.</p>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-72 overflow-y-auto">
          {COL_INFO.map(({ col, campo, req }) => (
            <div key={col} className="flex items-center gap-3 px-4 py-2">
              <span className="shrink-0 w-7 text-center text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded px-1.5 py-0.5">
                {col}
              </span>
              <span className="flex-1 text-sm font-mono text-zinc-700 dark:text-zinc-300">{campo}</span>
              {req && (
                <span className="text-[10px] font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded">
                  obligatorio
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
