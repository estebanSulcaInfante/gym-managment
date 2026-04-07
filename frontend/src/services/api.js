import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Endpoint for Flask development server
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getEmpleados = () => api.get('/empleados').then(res => res.data);
export const getEmpleado = (id) => api.get(`/empleados/${id}`).then(res => res.data);
export const createEmpleado = (data) => api.post('/empleados', data).then(res => res.data);
export const updateEmpleado = (id, data) => api.put(`/empleados/${id}`, data).then(res => res.data);
export const deactivateEmpleado = (id) => api.delete(`/empleados/${id}`).then(res => res.data);

export const getReportesAsistencia = (limit = 50) => api.get(`/asistencias?limit=${limit}`).then(res => res.data);
export const registrarEntrada = (data) => api.post('/asistencias/entrada', data).then(res => res.data);
export const registrarSalida = (data) => api.post('/asistencias/salida', data).then(res => res.data);

export default api;
