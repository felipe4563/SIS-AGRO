import api from '../api/axios';

const perfilService = {
  obtener:    ()       => api.get('/perfil'),
  actualizar: (datos)  => api.put('/perfil', datos),
};

export default perfilService;
