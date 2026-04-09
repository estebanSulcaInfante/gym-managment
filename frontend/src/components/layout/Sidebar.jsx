import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

const sections = [
  {
    label: 'OVERVIEW',
    items: [
      { name: 'Dashboard', to: '/dashboard', icon: 'space_dashboard' },
    ]
  },
  {
    label: 'ASISTENCIA',
    items: [
      { name: 'Calendario', to: '/calendar', icon: 'calendar_month' },
      { name: 'Reportes', to: '/reports', icon: 'analytics' },
    ]
  },
  {
    label: 'EQUIPO',
    adminOnly: true,
    items: [
      { name: 'Staff', to: '/staff', icon: 'badge' },
    ]
  },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 z-40 bg-white/85 backdrop-blur-xl shadow-2xl flex flex-col pt-20 pb-8 px-4 hidden md:flex">
      {/* Branding */}
      <div className="mb-8 px-2">
        <h2 className="font-headline font-bold text-blue-700 text-lg uppercase tracking-wider">SPORT GYM</h2>
        <p className="text-xs text-slate-500 font-semibold tracking-widest uppercase mt-1">El Templo del Hierro</p>
      </div>

      {/* Nav Sections */}
      <div className="flex-1 space-y-6 overflow-y-auto">
        {sections
          .filter(section => !section.adminOnly || isAdmin)
          .map(section => (
          <div key={section.label}>
            <p className="px-4 mb-2 text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3 px-4 py-2.5 transition-all rounded-lg font-body font-semibold text-sm tracking-wide",
                      isActive
                        ? "text-blue-700 bg-blue-50/60 border-l-[3px] border-blue-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-800 border-l-[3px] border-transparent"
                    )
                  }
                >
                  <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                  {link.name}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User Info + Logout */}
      {user && (
        <div className="mt-auto border-t border-slate-200 pt-4 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white text-sm font-bold uppercase">
              {user.username?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700 truncate">{user.username}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{user.rol}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-error hover:bg-red-50 py-2 rounded-lg transition-all font-semibold"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Cerrar Sesión
          </button>
        </div>
      )}
    </nav>
  );
}

