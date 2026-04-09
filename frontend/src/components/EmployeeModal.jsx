import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';

export default function EmployeeModal({ isOpen, onClose, onSubmit, employee }) {
  const isEditing = !!employee;

  const defaultHorarios = Array.from({ length: 7 }, (_, i) => ({
    dia_semana: i,
    hora_entrada: i < 5 ? '08:00' : '',
    hora_salida: i < 5 ? '17:00' : ''
  }));

  // Combinar los horarios existentes si es que existen
  const initHorarios = employee?.horarios?.length === 7 
    ? employee.horarios 
    : defaultHorarios;

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

  const handleHorarioChange = (diaIdx, field, value) => {
    const newHorarios = [...formData.horarios];
    const itemIdx = newHorarios.findIndex(h => h.dia_semana === diaIdx);
    if (itemIdx > -1) {
      newHorarios[itemIdx] = { ...newHorarios[itemIdx], [field]: value };
    }
    setFormData({ ...formData, horarios: newHorarios });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-xl w-full max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-xl font-bold mb-4">
            {isEditing ? 'Edit Employee' : 'Add Employee'}
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">First Name *</label>
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
              <label className="block text-sm font-medium text-slate-700">Last Name</label>
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
                value={formData.dni}
                onChange={handleChange}
                disabled={isEditing}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Role</label>
              <select
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Entrenador">Entrenador</option>
                <option value="Recepción">Recepción</option>
                <option value="Gerente">Gerente</option>
                <option value="Limpieza">Limpieza</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            </div>
            
            <div className="mt-2 border-t border-slate-200 pt-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Horario Semanal</h3>
              <p className="text-xs text-slate-500 mb-4">Deja en blanco si el empleado tiene el día libre.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {diasNombres.map((dia, idx) => {
                  const hInfo = formData.horarios.find(h => h.dia_semana === idx) || {};
                  return (
                    <div key={idx} className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                      <span className="text-sm font-bold text-slate-700 border-b border-slate-50 pb-1">{dia}</span>
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Entrada</label>
                          <input 
                            type="time" 
                            value={hInfo.hora_entrada?.substring(0,5) || ''}
                            onChange={e => handleHorarioChange(idx, 'hora_entrada', e.target.value)}
                            className="w-full text-xs font-medium border border-slate-200 rounded-lg py-1.5 px-2 text-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Salida</label>
                          <input 
                            type="time" 
                            value={hInfo.hora_salida?.substring(0,5) || ''}
                            onChange={e => handleHorarioChange(idx, 'hora_salida', e.target.value)}
                            className="w-full text-xs font-medium border border-slate-200 rounded-lg py-1.5 px-2 text-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-container focus:outline-none"
              >
                {isEditing ? 'Save' : 'Create'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
