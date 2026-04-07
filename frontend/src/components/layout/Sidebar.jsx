import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

export default function Sidebar() {
  const links = [
    { name: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
    { name: 'Attendance Kiosk', to: '/kiosk', icon: 'qr_code_scanner' },
    { name: 'Reports', to: '/reports', icon: 'analytics' },
    { name: 'Staff Management', to: '/staff', icon: 'badge' },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 z-40 bg-white/85 backdrop-blur-xl shadow-2xl flex flex-col pt-20 pb-8 px-4 hidden md:flex">
      <div className="mb-8 px-2">
        <h2 className="font-headline font-bold text-blue-700 text-lg uppercase tracking-wider">KINETIC PRECISION</h2>
        <p className="text-xs text-slate-500 font-semibold tracking-widest uppercase mt-1">Elite Performance</p>
      </div>

      <div className="space-y-2 flex-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-4 py-3 transition-all rounded-lg font-body font-semibold text-sm tracking-wide",
                isActive
                  ? "text-blue-700 border-l-4 border-blue-600 bg-blue-50/50"
                  : "text-slate-600 hover:bg-slate-50"
              )
            }
          >
            <span className="material-symbols-outlined">{link.icon}</span>
            {link.name}
          </NavLink>
        ))}
      </div>

      <button className="mt-auto bg-kinetic-gradient text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 duration-150 shadow-lg shadow-blue-200">
        <span className="material-symbols-outlined">person_add</span>
        Check In Member
      </button>
    </nav>
  );
}
