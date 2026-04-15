import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

export default function EmployeeModal({ isOpen, onClose, onSubmit, employee }) {
  const isEditing = !!employee;

  // Generar bloques por defecto: 1 bloque Lun-Vie 08:00-17:00, vacío Sáb-Dom
  const buildDefaultHorarios = () => {
    const horarios = [];
    for (let i = 0; i < 7; i++) {
      if (i < 5) {
        horarios.push({ dia_semana: i, hora_entrada: '08:00', hora_salida: '17:00', cruza_medianoche: false });
      }
      // Sáb y Dom sin bloque por defecto
    }
    return horarios;
  };

  // Adaptar horarios existentes (pueden tener N bloques por día)
  const initHorarios = employee?.horarios?.length > 0
    ? employee.horarios.map(h => ({
        dia_semana: h.dia_semana,
        hora_entrada: h.hora_entrada?.substring(0, 5) || '',
        hora_salida: h.hora_salida?.substring(0, 5) || '',
        cruza_medianoche: h.cruza_medianoche || false
      }))
    : buildDefaultHorarios();

  const [formData, setFormData] = useState({
    nombre: employee?.nombre || '',
    apellido: employee?.apellido || '',
    dni: employee?.dni || '',
    cargo: employee?.cargo || 'Entrenador',
    departamento: employee?.departamento || 'General',
    telefono: employee?.telefono || '',
    horarios: initHorarios
  });

  const diasNombres = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const getBloquesPorDia = (diaIdx) => {
    return formData.horarios
      .map((h, idx) => ({ ...h, _idx: idx }))
      .filter(h => h.dia_semana === diaIdx);
  };

  const handleHorarioChange = (globalIdx, field, value) => {
    const newHorarios = [...formData.horarios];
    newHorarios[globalIdx] = { ...newHorarios[globalIdx], [field]: value };
    
    // Auto-detect cruza_medianoche
    const h = newHorarios[globalIdx];
    if (field === 'hora_entrada' || field === 'hora_salida') {
      if (h.hora_entrada && h.hora_salida && h.hora_salida < h.hora_entrada) {
        newHorarios[globalIdx].cruza_medianoche = true;
      } else if (h.hora_entrada && h.hora_salida) {
        newHorarios[globalIdx].cruza_medianoche = false;
      }
    }
    
    setFormData({ ...formData, horarios: newHorarios });
  };

  const addBloque = (diaIdx) => {
    setFormData({
      ...formData,
      horarios: [...formData.horarios, { dia_semana: diaIdx, hora_entrada: '', hora_salida: '', cruza_medianoche: false }]
    });
  };

  const removeBloque = (globalIdx) => {
    const newHorarios = formData.horarios.filter((_, i) => i !== globalIdx);
    setFormData({ ...formData, horarios: newHorarios });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Filtrar bloques vacíos (sin hora_entrada ni hora_salida)
    const horariosLimpios = formData.horarios.filter(h => h.hora_entrada || h.hora_salida);
    onSubmit({ ...formData, horarios: horariosLimpios });
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95 translate-y-4"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-4"
          >
            <Dialog.Panel className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-xl w-full max-h-[90vh] overflow-y-auto">
              <Dialog.Title className="text-xl font-black text-slate-800 mb-4 tracking-tight">
                {isEditing ? 'Editar Empleado' : 'Agregar Empleado'}
              </Dialog.Title>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Nombre *</label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Apellido</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">DNI / ID *</label>
              <input
                type="text"
                name="dni"
                required
                maxLength="8"
                value={formData.dni}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Cargo</label>
              <select name="cargo" value={formData.cargo} onChange={handleChange} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="Entrenador">Entrenador</option>
                <option value="Recepción">Recepción</option>
                <option value="Administrador">Administrador</option>
                <option value="Limpieza">Limpieza</option>
                <option value="Gerente">Gerente</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Departamento</label>
              <select name="departamento" value={formData.departamento} onChange={handleChange} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="Fitness">Fitness</option>
                <option value="Recepción">Recepción</option>
                <option value="Administración">Administración</option>
                <option value="Limpieza">Limpieza</option>
                <option value="Gerente">Gerente</option>
                <option value="General">General</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            </div>
            
            {/* Horario Semanal - Multi-bloque */}
            <div className="mt-2 border-t border-slate-200 pt-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-1">Horario Semanal</h3>
              <p className="text-xs text-slate-500 mb-4">Configura uno o más bloques de trabajo por día. Los turnos nocturnos se detectan automáticamente.</p>
              
              <div className="space-y-3">
                {diasNombres.map((dia, diaIdx) => {
                  const bloques = getBloquesPorDia(diaIdx);
                  return (
                    <div key={diaIdx} className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-700">{dia}</span>
                        {bloques.length === 0 && (
                          <span className="text-xs text-slate-400 italic">Día libre</span>
                        )}
                      </div>

                      {bloques.map((bloque) => (
                        <div key={bloque._idx} className="flex items-center gap-2 mb-2 bg-white rounded-lg border border-slate-100 p-2 shadow-sm">
                          <div className="flex flex-col flex-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Entrada</label>
                            <input 
                              type="time" 
                              value={bloque.hora_entrada || ''}
                              onChange={e => handleHorarioChange(bloque._idx, 'hora_entrada', e.target.value)}
                              className="text-xs font-medium border border-slate-200 rounded-lg py-1.5 px-2 text-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <div className="flex flex-col flex-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Salida</label>
                            <input 
                              type="time" 
                              value={bloque.hora_salida || ''}
                              onChange={e => handleHorarioChange(bloque._idx, 'hora_salida', e.target.value)}
                              className="text-xs font-medium border border-slate-200 rounded-lg py-1.5 px-2 text-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          {bloque.cruza_medianoche && (
                            <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-1 rounded-full whitespace-nowrap" title="La salida es del día siguiente">
                              🌙 Nocturno
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeBloque(bloque._idx)}
                            className="text-red-400 hover:text-red-600 transition-colors p-1"
                            title="Eliminar bloque"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addBloque(diaIdx)}
                        className="flex items-center gap-1 text-xs text-primary hover:text-primary-container font-semibold mt-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Agregar bloque
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors active:scale-[0.98] outline-none"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-black text-on-primary shadow-sm hover:bg-primary-container transition-all active:scale-[0.98] outline-none"
                >
                  {isEditing ? 'Guardar Cambios' : 'Crear Empleado'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
