export default function TopBar({ onMenuToggle }) {
  return (
    <header className="fixed top-0 w-full z-40 bg-surface/90 backdrop-blur-md border-b border-surface-container">
      <div className="flex items-center px-4 h-16 w-full gap-3">

        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-on-surface hover:bg-surface-container transition-colors shrink-0"
          aria-label="Abrir menú"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        {/* Brand — mobile only (because desktop has sidebar branding) */}
        <div className="md:hidden flex items-center justify-center">
          <img src="/logo.svg" alt="Sport Gym" className="h-10 w-auto" />
        </div>

        {/* Context Title — desktop */}
        <div className="hidden md:flex items-center pl-64">
          <span className="font-headline font-bold text-slate-800 text-lg uppercase tracking-wide">
            Administración Central
          </span>
        </div>

        {/* Actions pushed to the right */}
        <div className="flex items-center gap-4 ml-auto">
          <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container text-slate-500 hover:text-primary transition-all">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </div>
    </header>
  );
}
