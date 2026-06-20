import { useState, useEffect, useCallback } from 'react';
import categoriasMovimientoService from '../../../services/categoriasMovimiento.service';
import { usePermission } from '../../../hooks/usePermission';

const TIPOS = ['INGRESO', 'EGRESO', 'AMBOS'];
const FORM_VACIO = { nombre: '', tipo: 'EGRESO' };

export default function CategoriasModal({ abierto, onClose, onActualizado }) {
  const { puede } = usePermission();
  const puedeGestionar = puede('gestionar', 'categorias_movimiento');

  const [categorias, setCategorias]   = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [guardando, setGuardando]     = useState(false);
  const [form, setForm]               = useState(FORM_VACIO);
  const [editando, setEditando]       = useState(null);
  const [error, setError]             = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await categoriasMovimientoService.listar({ incluirInactivas: '1' });
      setCategorias(res.data);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { if (abierto) cargar(); }, [abierto, cargar]);

  const handleCampo = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError('');
  };

  const iniciarEdicion = (cat) => {
    setEditando(cat.id_categoria);
    setForm({ nombre: cat.nombre, tipo: cat.tipo });
    setError('');
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setForm(FORM_VACIO);
    setError('');
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return; }
    setGuardando(true);
    try {
      if (editando) {
        await categoriasMovimientoService.actualizar(editando, form);
      } else {
        await categoriasMovimientoService.crear(form);
      }
      setEditando(null);
      setForm(FORM_VACIO);
      await cargar();
      if (onActualizado) onActualizado();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const handleDesactivar = async (id) => {
    try {
      await categoriasMovimientoService.eliminar(id);
      await cargar();
      if (onActualizado) onActualizado();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al desactivar');
    }
  };

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">Categorías de Movimientos</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xl leading-none">✕</button>
        </div>

        {/* Formulario crear/editar — solo si puede gestionar */}
        {puedeGestionar && (
          <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-3">
              {editando ? 'Editar categoría' : 'Nueva categoría'}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleCampo}
                placeholder="Nombre de la categoría"
                className="flex-1 px-3 py-2 rounded-lg text-sm border border-zinc-200 dark:border-zinc-700
                           bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white
                           focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
              <select
                name="tipo"
                value={form.tipo}
                onChange={handleCampo}
                className="px-3 py-2 rounded-lg text-sm border border-zinc-200 dark:border-zinc-700
                           bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white
                           focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleGuardar}
                disabled={guardando}
                className="px-4 py-1.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg disabled:opacity-50 transition-colors"
              >
                {guardando ? 'Guardando...' : editando ? 'Actualizar' : 'Agregar'}
              </button>
              {editando && (
                <button
                  onClick={cancelarEdicion}
                  className="px-4 py-1.5 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {cargando ? (
            <div className="flex justify-center py-8">
              <span className="w-6 h-6 rounded-full border-2 border-zinc-300 dark:border-zinc-600 border-t-emerald-500 animate-spin" />
            </div>
          ) : categorias.length === 0 ? (
            <p className="text-sm text-center text-zinc-400 py-6">Sin categorías</p>
          ) : (
            <ul className="space-y-1">
              {categorias.map(cat => (
                <li key={cat.id_categoria}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${cat.activo ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                    <span className={`text-sm ${cat.activo ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 line-through'}`}>
                      {cat.nombre}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">{cat.tipo}</span>
                  </div>
                  {cat.activo && puedeGestionar && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => iniciarEdicion(cat)}
                        className="px-2 py-0.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDesactivar(cat.id_categoria)}
                        className="px-2 py-0.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                      >
                        Desactivar
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
