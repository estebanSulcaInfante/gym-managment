import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getEmpleadoStats } from '../services/api';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmpleadoStats(id)
      .then(res => setData(res))
      .catch(err => {
        console.error(err);
        navigate('/staff');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !data) return <div className="p-8 text-center text-slate-500">Cargando perfil...</div>;

  const statusBadge = (estado) => {
    const styles = {
      puntual: 'bg-emerald-100 text-emerald-700',
      retraso: 'bg-amber-100 text-amber-700',
      ausente: 'bg-red-100 text-red-700',
      'fuera de turno': 'bg-slate-100 text-slate-600',
    };
    return styles[estado] || 'bg-slate-100 text-slate-600';
  };

  // Preparar datos para mini gráfico
  const chartData = (data.historial_semana || []).reverse().map(h => ({
    name: h.fecha.substring(5), // MM-DD
    horas: h.horas || 0
  }));

  return (
    <div className="p-8 pb-20">
      {/* Back button */}
      <button onClick={() => navigate('/staff')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary font-semibold mb-6 transition-colors">
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Volver a Staff
      </button>

      {/* Header */}
      <div className="flex items-center gap-6 mb-10">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center font-headline font-bold text-3xl text-primary">
          {data.nombre.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <h1 className="text-3xl font-extrabold font-headline text-slate-800">{data.nombre}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="bg-blue-50 text-blue-700 px-3 py-0.5 rounded-full text-xs font-bold">{data.cargo}</span>
            <span className="text-slate-400 text-sm font-medium">{data.departamento}</span>
          </div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Días Trabajados</p>
          <p className="text-4xl font-bold font-headline text-slate-800">{data.dias_trabajados_mes}</p>
          <p className="text-xs text-slate-400 mt-1">este mes</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Puntualidad</p>
          <p className={`text-4xl font-bold font-headline ${data.puntualidad >= 80 ? 'text-emerald-600' : 'text-orange-600'}`}>{data.puntualidad}%</p>
          <p className="text-xs text-slate-400 mt-1">del mes</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Retrasos</p>
          <p className="text-4xl font-bold font-headline text-orange-600">{data.retrasos}</p>
          <p className="text-xs text-slate-400 mt-1">este mes</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Horas Promedio</p>
          <p className="text-4xl font-bold font-headline text-primary">{data.horas_promedio}h</p>
          <p className="text-xs text-slate-400 mt-1">por día</p>
        </div>
      </div>

      {/* Grid: Chart + History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Mini chart */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-headline font-bold text-slate-800 mb-4">Horas - Última Semana</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)' }} />
                <Bar dataKey="horas" fill="#0058bc" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* History Table */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-headline font-bold text-slate-800">Historial Reciente</h3>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Entrada</th>
                <th className="px-6 py-3">Salida</th>
                <th className="px-6 py-3">Horas</th>
                <th className="px-6 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data.historial_semana || []).map((h, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 text-sm font-medium text-slate-800">{h.fecha}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{h.hora_entrada || '—'}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{h.hora_salida || '—'}</td>
                  <td className="px-6 py-3 text-sm font-bold text-primary">{h.horas ? `${h.horas}h` : '—'}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusBadge(h.estado)}`}>
                      {h.estado || 'sin estado'}
                    </span>
                  </td>
                </tr>
              ))}
              {(!data.historial_semana || data.historial_semana.length === 0) && (
                <tr><td colSpan="5" className="text-center py-8 text-slate-400">Sin registros recientes</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
