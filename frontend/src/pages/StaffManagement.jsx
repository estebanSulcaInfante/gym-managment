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
    if (confirm("Are you sure you want to deactivate this employee?")) {
      deactivateEmpleado(id)
        .then(() => fetchEmpleados())
        .catch(console.error);
    }
  };


  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-headline font-bold text-slate-800 tracking-tight">Staff Management</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage employees, schedules, and permissions.</p>
        </div>
        <button onClick={handleOpenCreate} className="bg-primary text-on-primary py-2.5 px-5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-container transition-colors shadow-md shadow-blue-200">
          <span className="material-symbols-outlined">person_add</span>
          Add Employee
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between mb-6">
        <div className="relative w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="Search by name, DNI, or role..." 
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-lg">filter_alt</span>
            Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">DNI</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-10 text-slate-400">Loading staff...</td></tr>
            ) : empleados.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                      {emp.foto_url ? <img src={emp.foto_url} alt="" className="w-full h-full object-cover" /> : emp.nombre.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{emp.nombre} {emp.apellido}</p>
                      <p className="text-xs text-slate-500">{emp.telefono || 'No phone'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-600">{emp.dni}</td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{emp.cargo}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{emp.departamento}</td>
                <td className="px-6 py-4">
                  <span className={clsx("px-3 py-1 text-xs font-bold rounded-full",
                    emp.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {emp.activo ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => navigate(`/staff/${emp.id}`)}
                    title="Ver perfil"
                    className="text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
                  >
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                  <button 
                    onClick={() => { setSelectedEmployee(emp); setIsModalOpen(true); }}
                    title="Edit"
                    className="text-slate-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-slate-100"
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button 
                    onClick={() => handleDeactivate(emp.id)}
                    title="Deactivate"
                    className="text-slate-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                  >
                    <span className="material-symbols-outlined">person_off</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <EmployeeModal 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleModalSubmit}
          employee={selectedEmployee}
        />
      )}
    </div>
  );
}
