// Cambia esta IP por la IP local de tu PC en la red (ej. 192.168.1.50).
// En web (misma máquina) puedes dejar 'localhost'; en el APK de Android
// necesitas la IP real de tu PC porque el teléfono no tiene "localhost" propio.
import { Platform } from 'react-native';

const HOST = Platform.OS === 'web' ? 'localhost' : '192.168.1.94';
const BASE_URL = `http://${HOST}:4000/api`;

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getMarcas: () => request('/marcas'),
  addMarca: (nombre) => request('/marcas', { method: 'POST', body: JSON.stringify({ nombre }) }),

  getPresentaciones: () => request('/presentaciones'),
  addPresentacion: (etiqueta, litros) =>
    request('/presentaciones', { method: 'POST', body: JSON.stringify({ etiqueta, litros }) }),

  getViscosidades: () => request('/viscosidades'),
  addViscosidad: (etiqueta) =>
    request('/viscosidades', { method: 'POST', body: JSON.stringify({ etiqueta }) }),

  getAceites: () => request('/aceites'),
  addAceite: (payload) => request('/aceites', { method: 'POST', body: JSON.stringify(payload) }),
  deleteAceite: (id) => request(`/aceites/${id}`, { method: 'DELETE' }),

  getVentas: () => request('/ventas'),
  addVenta: (aceite_id, cantidad) =>
    request('/ventas', { method: 'POST', body: JSON.stringify({ aceite_id, cantidad }) }),
  cancelarVenta: (id) => request(`/ventas/${id}`, { method: 'DELETE' }),

  getMarcasFiltro: () => request('/marcas-filtro'),
  addMarcaFiltro: (nombre) => request('/marcas-filtro', { method: 'POST', body: JSON.stringify({ nombre }) }),

  getTiposFiltro: () => request('/tipos-filtro'),
  addTipoFiltro: (etiqueta) =>
    request('/tipos-filtro', { method: 'POST', body: JSON.stringify({ etiqueta }) }),

  getFiltros: () => request('/filtros'),
  addFiltro: (payload) => request('/filtros', { method: 'POST', body: JSON.stringify(payload) }),
  deleteFiltro: (id) => request(`/filtros/${id}`, { method: 'DELETE' }),
};
