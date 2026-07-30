const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function esCorreoValido(correo) {
  return REGEX_CORREO.test(String(correo));
}

module.exports = { esCorreoValido };
