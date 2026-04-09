export default function TopBar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-[0_8px_24px_rgba(25,28,29,0.06)]">
      <div className="flex justify-between items-center px-6 h-16 w-full">
        {/* Empty space for mobile menu toggle or branding if needed when sidebar collapses */}
        <div className="flex items-center space-x-4 pl-64 hidden md:flex">
          <span className="font-headline font-black tracking-tighter text-2xl text-blue-700">SPORT GYM</span>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <span className="material-symbols-outlined text-slate-500 hover:text-blue-600 cursor-pointer transition-colors duration-200">account_circle</span>
          <span className="material-symbols-outlined text-slate-500 hover:text-blue-600 cursor-pointer transition-colors duration-200">settings</span>
        </div>
      </div>
      <div className="bg-slate-100 h-[1px] w-full"></div>
    </header>
  );
}
