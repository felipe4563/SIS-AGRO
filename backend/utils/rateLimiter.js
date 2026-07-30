// Limitador de tasa en memoria, por clave arbitraria (IP, correo, etc).
// Mismo patrón que ya usa auth.Controller.js para el login, extraído para
// reutilizarlo también en los endpoints de recuperación de contraseña.
function crearRateLimiter({ max, ventanaMs }) {
  const registro = new Map();

  function verificar(clave) {
    const ahora = Date.now();
    const r = registro.get(clave);
    if (!r || ahora - r.inicio > ventanaMs) {
      return { bloqueado: false };
    }
    if (r.intentos >= max) {
      const restanteMs = ventanaMs - (ahora - r.inicio);
      return { bloqueado: true, restanteMin: Math.ceil(restanteMs / 60000) };
    }
    return { bloqueado: false };
  }

  function registrar(clave) {
    const ahora = Date.now();
    const r = registro.get(clave);
    if (!r || ahora - r.inicio > ventanaMs) {
      registro.set(clave, { intentos: 1, inicio: ahora });
    } else {
      r.intentos++;
    }
    // Sweep stale entries so an unauthenticated caller can't grow this Map unbounded.
    for (const [k, v] of registro) {
      if (ahora - v.inicio > ventanaMs) registro.delete(k);
    }
  }

  return { verificar, registrar };
}

module.exports = { crearRateLimiter };
