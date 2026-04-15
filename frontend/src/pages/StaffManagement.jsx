import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmpleados, createEmpleado, updateEmpleado, deactivateEmpleado } from '../services/api';
import clsx from 'clsx';
import EmployeeModal from '../components/EmployeeModal';


export default function StaffManagement() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const navigate = useNavigate();

  const fetchEmpleados = () => {
    setLoading(true);
    getEmpleados()
      .then(data => {
        setEmpleados(data);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const handleOpenCreate = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleModalSubmit = (formData) => {
    if (selectedEmployee) {
      updateEmpleado(selectedEmployee.id, formData)
        .then(() => {
          fetchEmpleados();
          handleCloseModal();
        })
        .catch(err => alert(err.response?.data?.error || 'Error al actualizar empleado'));
    } else {
      createEmpleado(formData)
        .then(() => {
          fetchEmpleados();
          handleCloseModal();
        })
        .catch(err => alert(err.response?.data?.error || 'Error creando empleado'));
    }
  };

  const handleDeactivate = (id) => {
    if (confirm("¿Estás seguro de que deseas desactivar a este empleado?")) {
      deactivateEmpleado(id)
        .then(() => fetchEmpleados())
        .catch(console.error);
    }
  };


  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-headline font-black text-slate-800 tracking-tight">Gestión de Personal</h1>
          <p className="text-slate-500 mt-1 md:mt-2 font-medium">Administra empleados, horarios y permisos.</p>
        </div>
        <button onClick={handleOpenCreate} className="shrink-0 bg-primary text-on-primary py-2.5 px-5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-container transition-all active:scale-[0.98] shadow-[0_4px_14px_rgba(250,204,21,0.3)]">
          <span className="material-symbols-outlined">person_add</span>
          Añadir Empleado
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 sm:max-w-sm group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
          <input 
            type="text" 
            placeholder="Buscar por nombre, DNI o cargo..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-semibold text-slate-700"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-100 hover:text-slate-800 transition-all active:scale-[0.98]">
            <span className="material-symbols-outlined text-lg">filter_alt</span>
            Filtros
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                <th className="px-6 py-4">Empleado</th>
                <th className="px-6 py-4">DNI</th>
                <th className="px-6 py-4">Cargo</th>
                <th className="px-6 py-4">Departamento</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-10 text-slate-400 font-bold">Cargando personal...</td></tr>
              ) : empleados.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-dark flex-shrink-0 flex items-center justify-center font-black text-primary overflow-hidden shadow-sm">
                        {emp.foto_url ? <img src={emp.foto_url} alt="" className="w-full h-full object-cover" /> : emp.nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 tracking-tight group-hover:text-primary transition-colors">{emp.nombre} {emp.apellido}</p>
                        <p className="text-[10px] text-slate-400 font-semibold tracking-wider">{emp.telefono || 'Sin teléfono'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-600">{emp.dni}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <span className="bg-surface-dark text-primary px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">{emp.cargo}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-semibold">{emp.departamento}</td>
                  <td className="px-6 py-4">
                    <span className={clsx("px-3 py-1 text-[10px] font-black rounded-md uppercase tracking-wider",
                      emp.activo ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    )}>
                      {emp.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => navigate(`/staff/${emp.id}`)}
                        title="Ver perfil"
                        className="text-slate-400 hover:text-slate-800 transition-colors p-2 rounded-lg hover:bg-slate-100"
                      >
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                      <button 
                        onClick={() => { setSelectedEmployee(emp); setIsModalOpen(true); }}
                        title="Editar"
                        className="text-slate-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDeactivate(emp.id)}
                        title="Desactivar"
                        className="text-slate-400 hover:text-error transition-colors p-2 rounded-lg hover:bg-error/10"
                      >
                        <span className="material-symbols-outlined">person_off</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EmployeeModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        employee={selectedEmployee}
      />
    </div>
  );
}
