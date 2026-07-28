import api from '../api/axios';

const mezclaService = {
  listar:            ()         => api.get('/mezclas'),
  obtener:           (id)       => api.get(`/mezclas/${id}`),
  crear:             (data)     => api.post('/mezclas', data),
  editar:            (id, data) => api.put(`/mezclas/${id}`, data),
  toggle:            (id)       => api.patch(`/mezclas/${id}/activar`),
  aplicar:           (id, data) => api.post(`/mezclas/${id}/aplicar`, data),
  listarAplicaciones:()         => api.get('/mezclas/aplicaciones'),
  auxProductos:      ()         => api.get('/mezclas/aux/productos'),
  auxUnidades:       ()         => api.get('/mezclas/aux/unidades'),
};

export default mezclaService;
