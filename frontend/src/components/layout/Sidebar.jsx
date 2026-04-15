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

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose?.();
    navigate('/login', { replace: true });
  };

  const handleNavClick = () => {
    onClose?.();
  };

  return (
    <nav
      className={clsx(
        // Base styles — fixed, full height
        'fixed left-0 top-0 h-screen w-64 z-50',
        'shadow-[4px_0_24px_rgba(0,0,0,0.5)] flex flex-col pt-16 pb-8 px-4',
        'transition-transform duration-300 ease-in-out',
        // Mobile: slide in/out; Desktop: always visible
        'md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(9, 9, 11, 0.85), rgba(9, 9, 11, 0.98)), url('/gym-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRight: '1px solid rgba(250, 204, 21, 0.1)' // Faint gold border
      }}
    >
      {/* Close button — mobile only */}
      <button
        onClick={onClose}
        className="md:hidden absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
        aria-label="Cerrar menú"
      >
        <span className="material-symbols-outlined text-xl">close</span>
      </button>

      {/* Branding */}
      <div className="mb-4 px-2 mt-4 md:mt-0 flex justify-center">
        <img src="/logo.svg" alt="Sport Gym Logo" className="w-[120px] h-auto drop-shadow-md" />
      </div>

      {/* Nav Sections */}
      <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar">
        {sections
          .filter(section => !section.adminOnly || isAdmin)
          .map(section => (
          <div key={section.label}>
            <p className="px-4 mb-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3 px-4 py-2.5 transition-all rounded-lg font-body font-semibold text-sm tracking-wide",
                      isActive
                        ? "text-white bg-white/10 border-l-[3px] border-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white border-l-[3px] border-transparent"
                    )
                  }
                >
                  <span className={clsx("material-symbols-outlined text-[20px]", link.to === location.pathname ? "text-primary" : "")}>
                    {link.icon}
                  </span>
                  {link.name}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User Info + Logout */}
      {user && (
        <div className="mt-auto border-t border-white/10 pt-4 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary text-base font-black uppercase shadow-[0_0_15px_rgba(250,204,21,0.3)] border-2 border-primary/50">
              {user.username?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user.username}</p>
              <p className="text-[10px] text-primary uppercase tracking-wider font-bold">{user.rol}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-sm text-zinc-400 hover:text-primary hover:bg-white/5 border border-transparent hover:border-primary/20 py-2 rounded-lg transition-all font-semibold"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Cerrar Sesión
          </button>
        </div>
      )}
    </nav>
  );
}
