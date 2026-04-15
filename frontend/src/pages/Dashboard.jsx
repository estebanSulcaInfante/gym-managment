import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [pendientes, setPendientes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [conciliando, setConciliando] = useState(false);
  const { user, isAdmin } = useAuth();

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
    if (estado === 'puntual') return 'text-emerald-500 border-emerald-500 bg-emerald-500';
    if (estado === 'retraso') return 'text-warning border-warning bg-warning';
    return 'text-slate-400 border-slate-400 bg-slate-400';
  };

  const alertIcon = (tipo) => {
    if (tipo === 'ausencia') return 'error';
    if (tipo === 'hito') return 'celebration';
    return 'info';
  };

  const alertBg = (tipo) => {
    if (tipo === 'ausencia') return 'bg-white border-l-4 border-l-warning text-on-surface shadow-sm';
    if (tipo === 'hito') return 'bg-white border-l-4 border-l-success text-on-surface shadow-sm';
    return 'bg-white border-l-4 border-l-slate-400 text-on-surface shadow-sm';
  };

  // Determine current time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="p-4 md:p-8 pb-20 pt-24 md:pt-8 min-h-screen">
      
      {/* Header Empeático */}
      <header className="mb-8 border-b border-outline-variant pb-6">
        <h2 className="text-3xl font-black font-headline text-on-surface tracking-tighter">
          {getGreeting()}, {user?.username?.split(' ')[0] || 'Responsable'}
        </h2>
        <p className="text-on-surface-variant mt-1 font-semibold">El Templo del Hierro está operando con normalidad.</p>
      </header>

      {/* Action Banner para Pendientes - Rediseñado para no generar ansiedad visual */}
      {isAdmin && pendientes > 0 && (
        <div className="mb-8 bg-surface-dark border border-surface-dark rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          <div className="flex items-center gap-4 text-white z-10">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-3xl text-primary" style={{fontVariationSettings: "'FILL' 1"}}>task_alt</span>
            </div>
            <div>
              <p className="font-bold text-lg">Conciliación Pendiente</p>
              <p className="text-sm text-on-surface-dark-variant mt-0.5">
                Existen {pendientes} registros pendientes de actualización.
              </p>
            </div>
          </div>
          <button
            onClick={handleConciliar}
            disabled={conciliando}
            className="shrink-0 z-10 bg-primary hover:bg-primary-container text-on-primary text-sm font-black uppercase tracking-wider py-3 px-6 rounded-xl shadow-[0_4px_14px_rgba(250,204,21,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 w-full sm:w-auto flex items-center justify-center gap-2"
          >
            {conciliando && (
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {conciliando ? 'Procesando...' : 'Completar Tarea'}
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-10">
        {/* Presencia Actual */}
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline-variant relative overflow-hidden group transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 cursor-default">
          <div className="relative z-10">
            <span className="text-[10px] items-center gap-1 flex font-black text-on-surface-variant tracking-[0.2em] uppercase">
              <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
              Presencia Actual
            </span>
            <p className="text-6xl font-black font-headline text-on-surface py-2 tracking-tighter">{stats.presencia_actual}%</p>
            <div className="flex items-center gap-2 text-on-surface-variant font-bold text-xs uppercase tracking-wider">
              <span>{stats.asistencias_hoy}/{stats.total_empleados} presentes</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.06] transition-all duration-500">
            <span className="material-symbols-outlined text-[130px]">groups</span>
          </div>
        </div>

        {/* Staff Activo */}
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline-variant relative overflow-hidden group transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 cursor-default">
          <div className="relative z-10">
            <span className="text-[10px] font-black items-center gap-1 flex text-on-surface-variant tracking-[0.2em] uppercase">
             <span className="w-2 h-2 rounded-full bg-surface-dark inline-block"></span>
             Staff Activo
            </span>
            <p className="text-6xl font-black font-headline text-on-surface py-2 tracking-tighter">
              {stats.trabajando_ahora}
            </p>
            <div className="flex items-center gap-1.5 text-on-surface-variant font-bold text-xs uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span>Trabajando ahora</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.06] transition-all duration-500">
            <span className="material-symbols-outlined text-[130px]">badge</span>
          </div>
        </div>

        {/* Retrasos Hoy */}
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline-variant relative overflow-hidden group transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 cursor-default">
          <div className="absolute top-0 left-0 w-full h-1 bg-warning"></div>
          <div className="relative z-10">
            <span className="text-[10px] items-center gap-1 flex font-black text-warning tracking-[0.2em] uppercase">
              <span className="material-symbols-outlined text-[12px]" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
              Retrasos Hoy
            </span>
            <p className="text-6xl font-black font-headline text-on-surface py-2 tracking-tighter">
              {String(stats.retrasos_hoy).padStart(2, '0')}
            </p>
            <div className="flex items-center gap-1.5 text-on-surface-variant font-bold text-xs uppercase tracking-wider">
              <span>{stats.retrasos_hoy > 0 ? 'Acción requerida' : 'Todo en orden'}</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.06] transition-all duration-500">
            <span className="material-symbols-outlined text-[130px]">timer_off</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart + Staff en Turno */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        
        {/* Chart */}
        <div className="lg:col-span-8 bg-surface p-8 rounded-2xl shadow-sm border border-outline-variant relative overflow-hidden">
          <div className="flex justify-between items-end mb-8 relative z-10">
            <div>
              <h3 className="text-2xl font-black font-headline text-on-surface tracking-tight">Tendencia Semanal</h3>
              <p className="text-sm text-on-surface-variant font-semibold">Resumen de asistencias los últimos 7 días</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-surface-dark rounded-sm"></span>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-primary rounded-sm"></span>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Puntuales</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chart_data} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} dx={-10} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgb(0 0 0 / 0.08)', fontWeight: 600 }}
                />
                <Bar dataKey="asistencias" name="Total" fill="#09090b" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="puntuales" name="Puntuales" fill="#facc15" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Staff en Turno (Insight Widget) */}
        <div className="lg:col-span-4 bg-kinetic-gradient p-1 rounded-2xl shadow-xl flex flex-col relative overflow-hidden">
          {/* Inner content wrapper to allow gradient border effect if wanted, or just dark background */}
          <div className="bg-surface-dark w-full h-full rounded-[14px] p-6 flex flex-col relative z-10">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] pointer-events-none"></div>

            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="font-headline font-black text-white text-xl tracking-tight">Staff en Turno</h3>
              <span className="bg-primary text-on-primary px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(250,204,21,0.3)] animate-pulse">
                 En vivo
              </span>
            </div>
            
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar pr-2 relative z-10">
              {stats.staff_en_turno.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-50 py-10">
                  <span className="material-symbols-outlined text-4xl text-on-surface-dark-variant mb-2">hotel</span>
                  <p className="text-sm font-bold text-on-surface-dark-variant text-center">Sin staff activo ahora mismo.</p>
                </div>
              ) : (
                stats.staff_en_turno.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      {/* Status Ring Avatar */}
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-on-primary text-sm font-headline shrink-0 border-2 ${statusColor(s.estado)} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
                        {s.nombre.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{s.nombre}</p>
                        <p className="text-[10px] text-on-surface-dark-variant font-bold uppercase tracking-wider truncate">{s.cargo}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 pl-2">
                       <span className={`text-[10px] font-black uppercase tracking-wider ${s.estado === 'retraso'? 'text-warning' : 'text-emerald-400'}`}>
                        {s.estado}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alertas del Día */}
      {stats.alertas && stats.alertas.length > 0 && (
        <section>
          <h3 className="text-xl font-black font-headline text-on-surface mb-6 tracking-tight">Alertas del Día</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.alertas.map((alerta, idx) => (
              <div key={idx} className={`p-5 rounded-xl flex gap-4 items-start ${alertBg(alerta.tipo)}`}>
                <span className="material-symbols-outlined mt-0.5" style={{fontVariationSettings: "'FILL' 1"}}>
                  {alertIcon(alerta.tipo)}
                </span>
                <div>
                  <p className="font-bold text-sm">{alerta.titulo}</p>
                  <p className="text-xs text-on-surface-variant font-medium mt-1">{alerta.mensaje}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Monthly Summary Bar */}
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Puntualidad Mes", value: `${stats.puntualidad_promedio}%`, color: "text-on-surface" },
          { label: "Retrasos Mes", value: stats.retrasos_mes, color: "text-warning" },
          { label: "Horas Totales", value: `${stats.horas_totales_mes}h`, color: "text-on-surface" },
          { label: "Empleados", value: stats.total_empleados, color: "text-on-surface" }
        ].map((item, idx) => (
          <div key={idx} className="bg-surface rounded-xl p-5 text-center border border-outline-variant shadow-sm hover:border-outline transition-colors">
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.15em] mb-1">{item.label}</p>
            <p className={`text-3xl font-black font-headline ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
