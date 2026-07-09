import api from '../api/axios';

const ventaService = {
  listarProductosPOS: () => api.get('/ventas/pos-productos'),
  listar:  () => api.get('/ventas'),
  obtener: (id) => api.get(`/ventas/${id}`),
  crear:        (data) => api.post('/ventas', data),
  iniciarPagoQR:(data) => api.post('/ventas/checkout-qr', data),
  estadoPagoQR: (tx_id) => api.get(`/ventas/checkout-qr/status/${tx_id}`),
  anular:       (id)  => api.patch(`/ventas/${id}/anular`)
};

export default ventaService;
