import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login or kiosk
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/kiosk') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getEmpleados = () => api.get('/empleados').then(res => res.data);
export const getEmpleado = (id) => api.get(`/empleados/${id}`).then(res => res.data);
export const createEmpleado = (data) => api.post('/empleados', data).then(res => res.data);
export const updateEmpleado = (id, data) => api.put(`/empleados/${id}`, data).then(res => res.data);
export const deactivateEmpleado = (id) => api.delete(`/empleados/${id}`).then(res => res.data);

export const getReportesAsistencia = (limit = 50) => api.get(`/asistencias?limit=${limit}`).then(res => res.data);
export const registrarEntrada = (data) => api.post('/asistencias/entrada', data).then(res => res.data);
export const registrarSalida = (data) => api.post('/asistencias/salida', data).then(res => res.data);
export const editarAsistencia = (id, data) => api.put(`/asistencias/${id}`, data).then(res => res.data);
export const cerrarDia = (fecha) => api.post('/asistencias/cerrar-dia', { fecha }).then(res => res.data);
export const getEmpleadoStats = (id) => api.get(`/stats/empleado/${id}`).then(res => res.data);

// Auth API
export const loginUser = (credentials) => api.post('/auth/login', credentials).then(res => res.data);
export const getMe = () => api.get('/auth/me').then(res => res.data);

export default api;
