import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import clsx from 'clsx';
import { registrarEntrada, registrarSalida, getReportesAsistencia } from '../services/api';

export default function Kiosk() {
  const [dni, setDni] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [loading, setLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [actionType, setActionType] = useState('in'); // 'in' or 'out'
  const [currentTime, setCurrentTime] = useState('');
  const webcamRef = useRef(null);

  useEffect(() => {
    // Current time
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadActivity = () => {
    getReportesAsistencia(4).then(data => setRecentActivity(data)).catch(console.error);
  };

  useEffect(() => {
    loadActivity();
  }, []);

  const handleAction = async (type) => {
    if (!dni || dni.length < 8) {
      setStatus({ type: 'error', message: 'DNI incompleto' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'idle', message: '' });
    
    const imageSrc = webcamRef.current ? webcamRef.current.getScreenshot() : null;

    try {
      const endpoint = type === 'in' ? registrarEntrada : registrarSalida;
      const res = await endpoint({ dni, foto_url: imageSrc });
      
      setStatus({ 
        type: 'success', 
        message: `${type === 'in' ? 'Entrada' : 'Salida'}: ${res.empleado}` 
      });
      setDni('');
      loadActivity();
      
      setTimeout(() => setStatus({ type: 'idle', message: '' }), 5000);
      
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error de red';
      setStatus({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-[calc(100vh-64px)] overflow-hidden relative">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold text-on-surface tracking-tight">Kiosko de Asistencia</h1>
        <p className="font-body text-on-surface-variant mt-2 text-lg">Por favor, selecciona tu acción e ingresa tu DNI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Lado Izquierdo/Centro: Interfaz principal (8 col) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Selector de Acción */}
          <div className="bg-surface-container-low rounded-full p-2 flex items-center shadow-sm w-full max-w-md mx-auto">
            <button 
              onClick={() => setActionType('in')}
              className={clsx(
                "flex-1 py-3 px-6 rounded-full font-headline font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300",
                actionType === 'in' ? "bg-white text-primary shadow-lg scale-105" : "text-on-surface-variant hover:text-on-surface opacity-70"
              )}
            >
              <span className="material-symbols-outlined">login</span>
              ENTRADA
            </button>
            <button 
              onClick={() => setActionType('out')}
              className={clsx(
                "flex-1 py-3 px-6 rounded-full font-headline font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300",
                actionType === 'out' ? "bg-white text-primary shadow-lg scale-105" : "text-on-surface-variant hover:text-on-surface opacity-70"
              )}
            >
              <span className="material-symbols-outlined">logout</span>
              SALIDA
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
            {/* Input DNI y Status */}
            <div className="bg-surface-container-lowest rounded-[2rem] p-8 flex flex-col justify-center relative overflow-hidden shadow-[0_8px_24px_rgba(25,28,29,0.06)] group border border-outline-variant/30">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-2xl"></div>
              
              <div className="relative z-10 w-full">
                <h3 className="font-headline text-2xl font-bold text-on-surface mb-2">Ingresa tu DNI</h3>
                <p className="font-body text-on-surface-variant mb-6 text-sm">Validación obligatoria para marcar.</p>

                <div className="relative mb-6">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-3xl">badge</span>
                  <input 
                    type="text" 
                    maxLength="8"
                    autoFocus
                    className="w-full text-3xl tracking-widest font-headline font-bold pl-14 pr-4 py-4 bg-surface-container-low rounded-2xl border-2 border-transparent focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all text-slate-800"
                    placeholder="70010010"
                    value={dni}
                    onChange={(e) => setDni(e.target.value.replace(/[^0-9]/g, ''))}
                    onKeyDown={(e) => e.key === 'Enter' && handleAction(actionType)}
                  />
                </div>

                <button 
                  onClick={() => handleAction(actionType)}
                  disabled={loading || !dni}
                  className={clsx("w-full py-4 rounded-2xl font-headline tracking-wide font-bold xl:text-lg text-white shadow-[0_6px_0_rgba(0,0,0,0.15)] active:translate-y-1.5 active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2",
                    actionType === 'in' ? "bg-gradient-to-r from-blue-600 to-blue-500" : "bg-gradient-to-r from-slate-700 to-slate-600"
                  )}
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined">how_to_reg</span>
                  )}
                  {actionType === 'in' ? 'REGISTRAR ENTRADA' : 'REGISTRAR SALIDA'}
                </button>

                {status.type !== 'idle' && (
                  <div className={clsx("mt-4 p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold animate-in zoom-in-95", 
                    status.type === 'success' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  )}>
                    <span className="material-symbols-outlined">{status.type === 'success' ? 'check_circle' : 'error'}</span>
                    {status.message}
                  </div>
                )}
              </div>
            </div>

            {/* Webcam Stream */}
            <div className="bg-slate-900 rounded-[2rem] overflow-hidden relative shadow-[0_8px_24px_rgba(25,28,29,0.06)] border-4 border-white flex flex-col justify-end group">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                videoConstraints={{ facingMode: "user" }}
              />
              {/* Scan Overlay Effect */}
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500">
                <div className="w-full h-1 bg-primary blur-[2px] animate-[scan_2s_ease-in-out_infinite]"></div>
              </div>

              <div className="relative z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pb-4">
                 <div className="flex items-center gap-2 max-w-max bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Cámara Activa
                </div>
              </div>
            </div>
          </div>
          
          {/* Tarjetas Estadisticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/20 hover:border-primary/30 transition-colors">
              <p className="font-label text-xs text-on-surface-variant font-bold mb-1 tracking-widest">ACTIVIDAD HOY</p>
              <div className="flex items-center justify-between">
                <p className="font-headline text-3xl font-bold text-on-surface">{recentActivity.length}</p>
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">monitoring</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/20 hover:border-primary/30 transition-colors">
              <p className="font-label text-xs text-on-surface-variant font-bold mb-1 tracking-widest">HORA ACTUAL</p>
              <div className="flex items-center justify-between">
                <p className="font-headline text-3xl font-bold text-primary">{currentTime}</p>
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/20 hover:border-primary/30 transition-colors">
              <p className="font-label text-xs text-on-surface-variant font-bold mb-1 tracking-widest">ESTADO SENSOR</p>
               <div className="flex items-center justify-between">
                <p className="font-headline text-lg font-bold text-green-600 flex items-center gap-1">
                  En Línea <span className="material-symbols-outlined text-sm">wifi</span>
                </p>
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <span className="material-symbols-outlined">sensors</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Actividad Reciente (4 col) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 shadow-sm border border-outline-variant/20 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline text-xl font-bold text-on-surface">Actividad Reciente</h2>
              <button onClick={loadActivity} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-primary transition-colors">
                <span className="material-symbols-outlined">history</span>
              </button>
            </div>
            
            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
              {recentActivity.length === 0 && (
                 <div className="text-center text-on-surface-variant py-8 text-sm italic">Sin actividad reciente...</div>
              )}
              {recentActivity.map((r, i) => {
                const isEntrada = !r.hora_salida;
                return (
                  <div key={i} className="bg-surface p-4 rounded-xl flex items-center gap-3 border border-outline-variant/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-primary/20 transition-all">
                    <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center text-white overflow-hidden shrink-0", 
                      isEntrada ? "bg-green-500" : "bg-slate-700"
                    )}>
                      {r.foto_entrada_url ? (
                        <img src={r.foto_entrada_url} alt="Foto" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined">{isEntrada ? "login" : "logout"}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-body font-bold text-sm text-on-surface truncate">ID Empleado: {r.empleado_id}</h4>
                      <p className="font-body text-xs text-on-surface-variant">
                        {isEntrada ? 'Entrada registrada' : 'Salida registrada'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={clsx("font-headline text-sm font-bold", isEntrada ? "text-primary" : "text-on-surface")}>
                        {(isEntrada ? r.hora_entrada : r.hora_salida)?.slice(0,5)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
