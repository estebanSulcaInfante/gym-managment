import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [pendientes, setPendientes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [conciliando, setConciliando] = useState(false);
  const { isAdmin } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stats/dashboard');
      setStats(res.data);
      
      if (isAdmin) {
        const pendRes = await api.get('/asistencias/pendientes');
        setPendientes(pendRes.data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAdmin]);

  const handleConciliar = async () => {
    if (!window.confirm('¿Conciliar datos de los últimos 7 días? Esto cerrará sesiones abiertas y marcará ausencias.')) return;
    
    setConciliando(true);
    try {
      await api.post('/asistencias/conciliar');
      await fetchData(); // refrescar
    } catch (err) {
      console.error('Error conciliando', err);
      alert('Hubo un error al conciliar.');
    } finally {
      setConciliando(false);
    }
  };

  if (loading || !stats) return <div className="p-8 text-center text-slate-500">Cargando métricas...</div>;

  const statusColor = (estado) => {
    if (estado === 'puntual') return 'bg-emerald-500';
    if (estado === 'retraso') return 'bg-orange-500';
    return 'bg-slate-400';
  };

  const statusLabel = (estado) => {
    if (estado === 'puntual') return 'text-emerald-700';
    if (estado === 'retraso') return 'text-orange-700';
    return 'text-slate-500';
  };

  const alertIcon = (tipo) => {
    if (tipo === 'ausencia') return 'error';
    if (tipo === 'hito') return 'celebration';
    return 'info';
  };

  const alertBg = (tipo) => {
    if (tipo === 'ausencia') return 'bg-orange-50 text-orange-900 border-orange-200';
    if (tipo === 'hito') return 'bg-blue-50 text-blue-900 border-blue-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="p-8 pb-20">
      {/* Action Banner para Pendientes */}
      {isAdmin && pendientes > 0 && (
        <div className="mb-8 bg-error/10 border border-error/20 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 text-error">
            <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
            <div>
              <p className="font-bold text-sm">Conciliación Pendiente</p>
              <p className="text-xs opacity-90 mt-0.5">
                Existen {pendientes} registros pendientes de días pasados (salidas omitidas o ausencias no marcadas).
              </p>
            </div>
          </div>
          <button
            onClick={handleConciliar}
            disabled={conciliando}
            className="shrink-0 bg-error hover:bg-error/90 text-white text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-lg shadow-md transition-all disabled:opacity-50"
          >
            {conciliando ? 'Conciliando...' : 'Conciliar Ahora'}
          </button>
        </div>
      )}

      {/* Header */}
      <header className="mb-10">
        <h2 className="text-3xl font-extrabold font-headline text-slate-800 tracking-tight">Dashboard de Asistencia</h2>
        <p className="text-slate-500 mt-1">Resumen de actividad operativa en tiempo real.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Presencia Actual */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="relative z-10">
            <span className="text-[11px] font-bold text-slate-500 tracking-[0.15em] uppercase">Presencia Actual</span>
            <p className="text-5xl font-bold font-headline text-primary py-2">{stats.presencia_actual}%</p>
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>{stats.asistencias_hoy}/{stats.total_empleados} presentes</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-[0.04] group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-[120px]">groups</span>
          </div>
        </div>

        {/* Staff Activo */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="relative z-10">
            <span className="text-[11px] font-bold text-slate-500 tracking-[0.15em] uppercase">Staff Activo</span>
            <p className="text-5xl font-bold font-headline text-slate-800 py-2">
              {stats.trabajando_ahora}<span className="text-2xl text-slate-400">/{stats.total_empleados}</span>
            </p>
            <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span>Trabajando ahora</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-[0.04] group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-[120px]">badge</span>
          </div>
        </div>

        {/* Retrasos Hoy */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-b-4 border-b-orange-500 relative overflow-hidden group">
          <div className="relative z-10">
            <span className="text-[11px] font-bold text-orange-600 tracking-[0.15em] uppercase">Retrasos Hoy</span>
            <p className="text-5xl font-bold font-headline text-orange-600 py-2">{String(stats.retrasos_hoy).padStart(2, '0')}</p>
            <div className="flex items-center gap-2 text-orange-600 font-bold text-xs">
              <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
              <span>{stats.retrasos_hoy > 0 ? 'Acción requerida' : 'Todo en orden'}</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-[0.04] group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-[120px] text-orange-600">timer_off</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart + Staff en Turno */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        {/* Chart */}
        <div className="lg:col-span-8 bg-white p-8 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-xl font-bold font-headline text-slate-800">Tendencia Semanal</h3>
              <p className="text-sm text-slate-400">Asistencias de los últimos 7 días</p>
            </div>
            <div className="flex gap-2">
              <span className="w-8 h-1 bg-primary rounded-full"></span>
              <span className="w-4 h-1 bg-slate-300 rounded-full"></span>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chart_data} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)', fontWeight: 600 }}
                />
                <Bar dataKey="asistencias" name="Total" fill="#0058bc" radius={[6, 6, 0, 0]} barSize={28} />
                <Bar dataKey="puntuales" name="Puntuales" fill="#bfdbfe" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Staff en Turno */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline font-bold text-slate-800">Staff en Turno</h3>
            <span className="bg-blue-50 text-primary px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">En vivo</span>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[280px]">
            {stats.staff_en_turno.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Nadie ha marcado entrada hoy.</p>
            ) : (
              stats.staff_en_turno.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm font-headline">
                      {s.nombre.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{s.nombre}</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-tight">{s.cargo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${statusColor(s.estado)} ${s.trabajando ? 'animate-pulse' : ''}`}></span>
                    <span className={`text-[10px] font-bold uppercase ${statusLabel(s.estado)}`}>
                      {s.trabajando ? 'Activo' : s.estado}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Alertas del Día */}
      {stats.alertas && stats.alertas.length > 0 && (
        <section>
          <h3 className="text-xl font-bold font-headline text-slate-800 mb-6">Alertas del Día</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.alertas.map((alerta, idx) => (
              <div key={idx} className={`p-5 rounded-xl flex gap-4 items-start border ${alertBg(alerta.tipo)}`}>
                <span className="material-symbols-outlined mt-0.5" style={{fontVariationSettings: "'FILL' 1"}}>
                  {alertIcon(alerta.tipo)}
                </span>
                <div>
                  <p className="font-bold text-sm">{alerta.titulo}</p>
                  <p className="text-xs opacity-80 mt-1">{alerta.mensaje}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Monthly Summary Bar */}
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Puntualidad Mes</p>
          <p className="text-2xl font-bold font-headline text-primary">{stats.puntualidad_promedio}%</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Retrasos Mes</p>
          <p className="text-2xl font-bold font-headline text-orange-600">{stats.retrasos_mes}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Horas Totales</p>
          <p className="text-2xl font-bold font-headline text-slate-800">{stats.horas_totales_mes}h</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Empleados</p>
          <p className="text-2xl font-bold font-headline text-slate-800">{stats.total_empleados}</p>
        </div>
      </div>
    </div>
  );
}
