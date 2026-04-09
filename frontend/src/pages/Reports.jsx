import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../services/api';
import { editarAsistencia, cerrarDia } from '../services/api';

export default function Reports() {
  const [asistencias, setAsistencias] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filtros
  const [searchName, setSearchName] = useState('');
  const [filterDepto, setFilterDepto] = useState('');
  const [filterDesde, setFilterDesde] = useState('');
  const [filterHasta, setFilterHasta] = useState('');

  // Edit modal
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [page]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/stats/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = `/asistencias?limit=20&page=${page}`;
      if (filterDepto) url += `&departamento=${encodeURIComponent(filterDepto)}`;
      if (filterDesde) url += `&desde=${filterDesde}`;
      if (filterHasta) url += `&hasta=${filterHasta}`;
      const res = await api.get(url);
      setAsistencias(res.data.data);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setPage(1);
    fetchReport();
  };

  const filtered = asistencias.filter(a => {
    if (!searchName) return true;
    return (a.empleado_nombre || '').toLowerCase().includes(searchName.toLowerCase());
  });

  // ─── Export CSV ───
  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const keys = ['Empleado', 'Cargo', 'Departamento', 'Fecha', 'Entrada', 'Salida', 'Estado', 'Justificacion', 'Horas'];
    const rows = filtered.map(a => [
      a.empleado_nombre || '', a.empleado_cargo || '', a.empleado_departamento || '',
      a.fecha, a.hora_entrada || '', a.hora_salida || '',
      a.estado || '', a.justificacion || '', a.horas_totales || ''
    ]);
    const csv = [keys.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = 'reporte_asistencias.csv';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  // ─── Export PDF (print) ───
  const handleExportPDF = () => {
    window.print();
  };

  // ─── Cerrar día ───
  const handleCerrarDia = async () => {
    if (!confirm('Esto marcará como AUSENTE a todos los empleados que no vinieron hoy. ¿Continuar?')) return;
    try {
      const res = await cerrarDia(null);
      alert(res.mensaje);
      fetchReport();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cerrar el día');
    }
  };

  // ─── Editar asistencia ───
  const openEditModal = (a) => {
    setEditForm({
      hora_entrada: a.hora_entrada ? a.hora_entrada.substring(0, 5) : '',
      hora_salida: a.hora_salida ? a.hora_salida.substring(0, 5) : '',
      estado: a.estado || '',
      justificacion: a.justificacion || '',
      observaciones: a.observaciones || ''
    });
    setEditModal(a);
  };

  const handleEditSave = async () => {
    try {
      await editarAsistencia(editModal.id, editForm);
      setEditModal(null);
      fetchReport();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al editar');
    }
  };

  const departamentos = [...new Set(asistencias.map(a => a.empleado_departamento).filter(Boolean))];

  const initialColors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-emerald-100 text-emerald-700', 'bg-orange-100 text-orange-700', 'bg-slate-100 text-slate-700'];
  const getInitialStyle = (name) => initialColors[(name || '').charCodeAt(0) % initialColors.length];

  const estadoBadge = (estado) => {
    const map = {
      puntual: 'bg-emerald-100 text-emerald-700', retraso: 'bg-amber-100 text-amber-700',
      ausente: 'bg-red-100 text-red-700', 'fuera de turno': 'bg-slate-100 text-slate-600',
      revision: 'bg-orange-100 text-orange-700 border border-orange-200'
    };
    return map[estado] || 'bg-slate-100 text-slate-600';
  };

  const estadoDot = (estado) => {
    const map = { puntual: 'bg-emerald-500', retraso: 'bg-amber-500', ausente: 'bg-red-500', revision: 'bg-orange-500 animate-pulse' };
    return map[estado] || 'bg-slate-400';
  };

  return (
    <div className="p-8 pb-20 print:p-4">
      {/* ─── Header ─── */}
      <div className="mb-10 flex justify-between items-end print:mb-4">
        <div>
          <span className="text-primary font-bold text-xs uppercase tracking-widest print:hidden">Métricas de Rendimiento</span>
          <h2 className="text-3xl font-extrabold font-headline text-slate-800 mt-1">Reportes de Asistencia</h2>
          <p className="text-slate-500 mt-2 print:hidden">Monitoreo de puntualidad y horas efectivas del personal.</p>
        </div>
        <div className="flex space-x-3 print:hidden">
          <button onClick={handleCerrarDia} className="flex items-center px-4 py-2 bg-red-50 text-red-700 font-semibold text-sm rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
            <span className="material-symbols-outlined mr-2 text-lg">event_busy</span>Cerrar Día
          </button>
          <button onClick={handleExportCSV} className="flex items-center px-4 py-2 bg-white text-slate-700 font-semibold text-sm rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined mr-2 text-lg">download</span>CSV
          </button>
          <button onClick={handleExportPDF} className="flex items-center px-4 py-2 bg-primary text-white font-semibold text-sm rounded-lg shadow-md shadow-primary/20 hover:bg-primary-container transition-colors">
            <span className="material-symbols-outlined mr-2 text-lg">print</span>PDF
          </button>
        </div>
      </div>

      {/* ─── KPI Cards ─── */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 print:grid-cols-4 print:gap-2 print:mb-4">
          {[
            { icon: 'timer', color: 'blue', label: 'Promedio Puntualidad', value: `${stats.puntualidad_promedio}%` },
            { icon: 'groups', color: 'purple', label: 'Total Staff Activo', value: stats.total_empleados },
            { icon: 'history', color: 'orange', label: 'Retrasos del Mes', value: stats.retrasos_mes },
            { icon: 'schedule', color: 'emerald', label: 'Horas Totales (Mes)', value: `${stats.horas_totales_mes}h` },
          ].map((kpi, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:p-3">
              <div className="flex justify-between items-start mb-4 print:mb-2">
                <span className={`material-symbols-outlined text-${kpi.color}-600 bg-${kpi.color}-50 p-2 rounded-lg print:p-1`}>{kpi.icon}</span>
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{kpi.label}</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1 font-headline print:text-xl">{kpi.value}</h3>
            </div>
          ))}
        </div>
      )}

      {/* ─── Filter Bar ─── */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input className="w-full bg-slate-50 border-none rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Buscar..." value={searchName} onChange={e => setSearchName(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Departamento</label>
            <select className="w-full bg-slate-50 border-none rounded-lg py-2.5 px-4 text-sm outline-none" value={filterDepto} onChange={e => setFilterDepto(e.target.value)}>
              <option value="">Todos</option>
              {departamentos.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Desde</label>
            <input type="date" className="w-full bg-slate-50 border-none rounded-lg py-2.5 px-4 text-sm outline-none" value={filterDesde} onChange={e => setFilterDesde(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hasta</label>
            <input type="date" className="w-full bg-slate-50 border-none rounded-lg py-2.5 px-4 text-sm outline-none" value={filterHasta} onChange={e => setFilterHasta(e.target.value)} />
          </div>
          <button onClick={handleApplyFilters} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center">
            <span className="material-symbols-outlined mr-2 text-lg">filter_alt</span>Aplicar
          </button>
        </div>
      </div>

      {/* ─── Data Table ─── */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 mb-10">
        <div className="px-8 py-5 flex justify-between items-center border-b border-slate-100 print:px-4 print:py-2">
          <h3 className="text-lg font-bold font-headline text-slate-800">Registros Detallados</h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{total} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-8 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-widest print:px-2 print:py-1 print:text-[9px]">Personal</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-widest print:px-2">Fecha</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-widest print:px-2">Entrada</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-widest print:px-2">Salida</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-widest print:px-2">Horas</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-widest print:px-2">Estado</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-widest print:px-2">Justificación</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-widest print:hidden"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="8" className="text-center py-10 text-slate-400">Cargando datos...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-10 text-slate-400">Sin registros.</td></tr>
              ) : filtered.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4 print:px-2 print:py-1">
                    <div className="flex items-center">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold mr-3 font-headline text-xs ${getInitialStyle(a.empleado_nombre)}`}>
                        {(a.empleado_nombre || '??').split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800">{a.empleado_nombre}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{a.empleado_cargo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600 print:px-2 print:text-xs">{a.fecha}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800 print:px-2 print:text-xs">{a.hora_entrada ? a.hora_entrada.substring(0, 5) : '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 print:px-2 print:text-xs">{a.hora_salida ? a.hora_salida.substring(0, 5) : '—'}</td>
                  <td className="px-6 py-4 text-sm font-headline font-bold text-primary print:px-2 print:text-xs">{a.horas_totales ? `${a.horas_totales}h` : '—'}</td>
                  <td className="px-6 py-4 print:px-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${estadoBadge(a.estado)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${estadoDot(a.estado)}`}></span>
                      {a.estado === 'puntual' ? 'Puntual' : a.estado === 'retraso' ? 'Retraso' : a.estado === 'ausente' ? 'Ausente' : a.estado === 'revision' ? 'Auto-Cierre' : a.estado || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 print:px-2">{a.justificacion || '—'}</td>
                  <td className="px-6 py-4 print:hidden">
                    <button onClick={() => openEditModal(a)} title="Editar" className="text-slate-400 hover:text-primary p-1.5 rounded hover:bg-slate-100 transition-colors">
                      <span className="material-symbols-outlined text-lg">edit_note</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-8 py-4 bg-slate-50/50 flex justify-between items-center print:hidden">
          <p className="text-xs font-bold text-slate-400">Página {page} de {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="w-8 h-8 flex items-center justify-center rounded bg-white shadow-sm border border-slate-200 text-slate-500 hover:text-primary disabled:opacity-40">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(totalPages, 5)}, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold ${p === page ? 'bg-primary text-white' : 'bg-white shadow-sm border border-slate-200 text-slate-500 hover:text-primary'}`}>{p}</button>
            ))}
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="w-8 h-8 flex items-center justify-center rounded bg-white shadow-sm border border-slate-200 text-slate-500 hover:text-primary disabled:opacity-40">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Bottom: Chart + Insight ─── */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 print:hidden">
          <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h4 className="text-lg font-bold font-headline text-slate-800">Análisis de Precisión Temporal</h4>
                <p className="text-slate-400 text-sm">Distribución de entradas durante la última semana.</p>
              </div>
              <div className="flex space-x-4">
                <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-primary mr-2"></span><span className="text-xs font-bold text-slate-500">Total</span></div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-200 mr-2"></span><span className="text-xs font-bold text-slate-500">Puntuales</span></div>
              </div>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chart_data} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)' }} />
                  <Bar dataKey="asistencias" fill="#0058bc" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="puntuales" fill="#bfdbfe" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-700 to-blue-900 p-8 rounded-2xl shadow-xl flex flex-col justify-between overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <span className="material-symbols-outlined text-white text-4xl mb-4">auto_awesome</span>
              <h4 className="text-xl font-bold font-headline text-white">Insight Kinetic</h4>
              <p className="text-blue-100 text-sm mt-2 leading-relaxed">
                La puntualidad del equipo es del <strong className="text-white">{stats.puntualidad_promedio}%</strong> este mes.
                {stats.retrasos_mes > 0 ? ` Se han detectado ${stats.retrasos_mes} retrasos acumulados.` : ' Sin retrasos registrados.'}
              </p>
            </div>
            <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Estado del sistema</p>
              <div className="flex items-center mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
                <span className="text-white text-sm font-bold">{stats.puntualidad_promedio >= 80 ? 'Optimizado' : 'Requiere atención'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit Modal ─── */}
      {editModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setEditModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold font-headline mb-1">Editar Asistencia</h3>
            <p className="text-sm text-slate-500 mb-6">{editModal.empleado_nombre} — {editModal.fecha}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Entrada</label>
                <input type="time" value={editForm.hora_entrada} onChange={e => setEditForm({...editForm, hora_entrada: e.target.value})} className="mt-1 w-full border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Salida</label>
                <input type="time" value={editForm.hora_salida} onChange={e => setEditForm({...editForm, hora_salida: e.target.value})} className="mt-1 w-full border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary" />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-slate-500 uppercase">Estado</label>
              <select value={editForm.estado} onChange={e => setEditForm({...editForm, estado: e.target.value})} className="mt-1 w-full border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary">
                <option value="puntual">Puntual</option>
                <option value="retraso">Retraso</option>
                <option value="ausente">Ausente</option>
                <option value="fuera de turno">Fuera de turno</option>
                <option value="revision">Auto-Cierre (Revisión)</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-slate-500 uppercase">Justificación</label>
              <select value={editForm.justificacion} onChange={e => setEditForm({...editForm, justificacion: e.target.value})} className="mt-1 w-full border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary">
                <option value="">Sin justificación</option>
                <option value="permiso">Permiso</option>
                <option value="enfermedad">Enfermedad</option>
                <option value="vacaciones">Vacaciones</option>
                <option value="injustificada">Injustificada</option>
                <option value="auto-cierre generoso">Auto-Cierre</option>
                <option value="olvido_salida">Olvido de Salida</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="text-xs font-bold text-slate-500 uppercase">Observaciones</label>
              <textarea value={editForm.observaciones} onChange={e => setEditForm({...editForm, observaciones: e.target.value})} rows={2} className="mt-1 w-full border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary resize-none" placeholder="Nota adicional..." />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setEditModal(null)} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Cancelar</button>
              <button onClick={handleEditSave} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-container">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
