import React, { useState, useEffect } from 'react';
import api from '../services/api';
import clsx from 'clsx';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS_HEADER = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function Calendar() {
  const hoy = new Date();
  const [year, setYear] = useState(hoy.getFullYear());
  const [month, setMonth] = useState(hoy.getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/stats/calendario?year=${year}&month=${month}`)
      .then(res => { setData(res.data); setSelectedDay(null); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year, month]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  // build calendar grid
  const buildGrid = () => {
    if (!data) return [];
    const firstWeekday = data.primer_dia_semana; // 0=Mon
    const totalDays = data.total_dias;
    const cells = [];
    // empty cells before month starts
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) cells.push(d);
    return cells;
  };

  const grid = buildGrid();
  const weeks = [];
  for (let i = 0; i < grid.length; i += 7) weeks.push(grid.slice(i, i + 7));

  const getDayData = (d) => data?.dias?.[String(d)] || null;

  const estadoColor = (estado) => {
    const map = { puntual: 'bg-emerald-500', retraso: 'bg-amber-500', ausente: 'bg-red-500', 'fuera de turno': 'bg-slate-400' };
    return map[estado] || 'bg-slate-300';
  };

  const estadoBadge = (estado) => {
    const map = { puntual: 'bg-emerald-100 text-emerald-700', retraso: 'bg-amber-100 text-amber-700', ausente: 'bg-red-100 text-red-700', 'fuera de turno': 'bg-slate-100 text-slate-600' };
    return map[estado] || 'bg-slate-100 text-slate-600';
  };

  // selected day detail
  const sel = selectedDay ? getDayData(selectedDay) : null;

  return (
    <div className="p-8 pb-20">
      {/* Header */}
      <div className="mb-8">
        <span className="text-primary font-bold text-xs uppercase tracking-widest">Vista Mensual</span>
        <h2 className="text-3xl font-extrabold font-headline text-slate-800 mt-1">Calendario de Asistencia</h2>
        <p className="text-slate-500 mt-2">Panorama visual de la asistencia del equipo día a día.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-8">
          {/* Month Nav */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
              <button onClick={prevMonth} className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <h3 className="text-xl font-bold font-headline text-slate-800">
                {MESES[month - 1]} {year}
              </h3>
              <button onClick={nextMonth} className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 bg-slate-50">
              {DIAS_HEADER.map(d => (
                <div key={d} className="text-center py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{d}</div>
              ))}
            </div>

            {/* Grid */}
            {loading ? (
              <div className="py-20 text-center text-slate-400">Cargando...</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {weeks.map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7 divide-x divide-slate-50">
                    {week.map((day, di) => {
                      if (day === null || day === undefined) {
                        return <div key={di} className="min-h-[90px] bg-slate-50/30"></div>;
                      }
                      const dd = getDayData(day);
                      const isToday = dd?.es_hoy;
                      const isFuture = dd?.es_futuro;
                      const isSelected = selectedDay === day;
                      const hasData = dd && dd.total > 0;

                      return (
                        <button
                          key={di}
                          onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                          className={clsx(
                            "min-h-[90px] p-2 text-left transition-all relative group",
                            isFuture && "opacity-40",
                            isSelected && "ring-2 ring-primary ring-inset bg-primary/5",
                            !isSelected && "hover:bg-slate-50"
                          )}
                        >
                          {/* Day number */}
                          <span className={clsx(
                            "inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mb-1",
                            isToday ? "bg-primary text-white" : "text-slate-700"
                          )}>
                            {day}
                          </span>

                          {hasData && !isFuture && (
                            <div className="space-y-1">
                              {/* Dots for status */}
                              <div className="flex gap-0.5 flex-wrap">
                                {dd.puntuales > 0 && <span className="w-2 h-2 rounded-full bg-emerald-500" title={`${dd.puntuales} puntuales`}></span>}
                                {dd.retrasos > 0 && <span className="w-2 h-2 rounded-full bg-amber-500" title={`${dd.retrasos} retrasos`}></span>}
                                {dd.ausentes > 0 && <span className="w-2 h-2 rounded-full bg-red-500" title={`${dd.ausentes} ausentes`}></span>}
                              </div>
                              <p className="text-[10px] font-bold text-slate-400">{dd.presentes}/{data.total_empleados}</p>
                            </div>
                          )}
                        </button>
                      );
                    })}
                    {/* Fill remaining cells if week is short */}
                    {Array.from({ length: 7 - week.length }).map((_, i) => (
                      <div key={`fill-${i}`} className="min-h-[90px] bg-slate-50/30"></div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-6 px-2">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span><span className="text-xs font-bold text-slate-500">Puntual</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span><span className="text-xs font-bold text-slate-500">Retraso</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span><span className="text-xs font-bold text-slate-500">Ausente</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-primary"></span><span className="text-xs font-bold text-slate-500">Hoy</span></div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Month Summary */}
          {data && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h4 className="font-headline font-bold text-slate-800 mb-4">Resumen del Mes</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold font-headline text-emerald-700">
                    {Object.values(data.dias).reduce((s, d) => s + d.puntuales, 0)}
                  </p>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-1">Puntuales</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold font-headline text-amber-700">
                    {Object.values(data.dias).reduce((s, d) => s + d.retrasos, 0)}
                  </p>
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mt-1">Retrasos</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold font-headline text-red-700">
                    {Object.values(data.dias).reduce((s, d) => s + d.ausentes, 0)}
                  </p>
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mt-1">Ausencias</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold font-headline text-primary">
                    {Object.values(data.dias).reduce((s, d) => s + d.total, 0)}
                  </p>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-1">Total Reg.</p>
                </div>
              </div>
            </div>
          )}

          {/* Day Detail */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h4 className="font-headline font-bold text-slate-800">
                {selectedDay ? `${selectedDay} de ${MESES[month - 1]}` : 'Selecciona un día'}
              </h4>
            </div>
            {sel ? (
              <div className="max-h-[380px] overflow-y-auto">
                {sel.detalle.length === 0 ? (
                  <p className="text-center py-8 text-slate-400 text-sm">Sin registros este día</p>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {sel.detalle.map((emp, i) => (
                      <div key={i} className="px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={clsx("w-2.5 h-2.5 rounded-full", estadoColor(emp.estado))}></span>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{emp.nombre}</p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {emp.entrada || '—'} → {emp.salida || '—'}
                              {emp.justificacion && <span className="ml-1 text-orange-500">({emp.justificacion})</span>}
                            </p>
                          </div>
                        </div>
                        <span className={clsx("px-2 py-0.5 rounded-full text-[10px] font-bold", estadoBadge(emp.estado))}>
                          {emp.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-200">calendar_month</span>
                <p className="text-sm text-slate-400 mt-3">Haz clic en un día para ver el detalle</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
