import api from '../api/axios';

const authService = {
  login: (identificador, contrasena) =>
    api.post('/auth/login', { identificador, contrasena }),
  solicitarRecuperacion: (identificador) =>
    api.post('/auth/recuperar/solicitar', { identificador }, { timeout: 30000 }),
  verificarCodigoRecuperacion: (identificador, codigo) =>
    api.post('/auth/recuperar/verificar', { identificador, codigo }),
  restablecerContrasena: (reset_token, nueva_contrasena) =>
    api.post('/auth/recuperar/restablecer', { reset_token, nueva_contrasena }),
};

export default authService;
