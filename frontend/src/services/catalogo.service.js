import api from '../api/axios';

const catalogoService = {
  // Clasificaciones
  listarClasificaciones:       () => api.get('/catalogos/clasificaciones'),
  crearClasificacion:          (data) => api.post('/catalogos/clasificaciones', data),
  editarClasificacion:         (id, data) => api.put(`/catalogos/clasificaciones/${id}`, data),
  eliminarClasificacion:       (id) => api.delete(`/catalogos/clasificaciones/${id}`),
  toggleActivoClasificacion:   (id, activo) => api.patch(`/catalogos/clasificaciones/${id}/activo`, { activo }),

  // Marcas
  listarMarcas:       () => api.get('/catalogos/marcas'),
  crearMarca:         (data) => api.post('/catalogos/marcas', data),
  editarMarca:        (id, data) => api.put(`/catalogos/marcas/${id}`, data),
  eliminarMarca:      (id) => api.delete(`/catalogos/marcas/${id}`),
  toggleActivoMarca:  (id, activo) => api.patch(`/catalogos/marcas/${id}/activo`, { activo }),

  // Unidades
  listarUnidades:     () => api.get('/catalogos/unidades'),
  crearUnidad:        (data) => api.post('/catalogos/unidades', data),
  editarUnidad:       (id, data) => api.put(`/catalogos/unidades/${id}`, data),
  eliminarUnidad:     (id) => api.delete(`/catalogos/unidades/${id}`),

  // Conversiones de unidad
  listarConversiones:      () => api.get('/catalogos/conversiones'),
  crearConversion:         (data) => api.post('/catalogos/conversiones', data),
  editarConversion:        (id, data) => api.put(`/catalogos/conversiones/${id}`, data),
  toggleActivoConversion:  (id, activo) => api.patch(`/catalogos/conversiones/${id}/activo`, { activo }),
  eliminarConversion:      (id) => api.delete(`/catalogos/conversiones/${id}`),
};

export default catalogoService;
