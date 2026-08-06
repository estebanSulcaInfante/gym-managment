import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const isDemoBuild = import.meta.env.VITE_DEMO_MODE === 'true';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginDemo();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'La demo no esta disponible en este momento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(9, 9, 11, 0.7), rgba(9, 9, 11, 0.95)), url('/gym-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Ambient glow effect (Yellow) */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo / Brand */}
        <div className="text-center mb-10 flex flex-col items-center">
          <img src="/logo.svg" alt="Sport Gym Logo" className="h-40 w-auto mb-2 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
        </div>

        {/* Login Card */}
        <div className="bg-surface-dark/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
          <h2 className="text-2xl font-headline font-black text-white mb-1">Bienvenido</h2>
          <p className="text-sm text-on-surface-dark-variant font-semibold mb-8">Ingresa tus credenciales para continuar</p>

          {error && (
            <div className="flex items-center gap-2 bg-error/10 border border-error/20 text-error rounded-xl px-4 py-3 mb-6 text-sm font-semibold">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs text-on-surface-dark-variant font-black uppercase tracking-widest mb-2">
                Usuario
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-xl font-light">person</span>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-semibold"
                  placeholder="admin"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-on-surface-dark-variant font-black uppercase tracking-widest mb-2">
                Contraseña
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-xl font-light">lock</span>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-semibold"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-container text-on-primary font-black uppercase tracking-wider py-4 rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-on-primary/30 border-t-on-primary"></div>
                  Verificando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl">login</span>
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {isDemoBuild && (
            <div className="mt-6 border-t border-white/10 pt-6">
              <p className="mb-3 text-center text-xs font-semibold text-on-surface-dark-variant">
                Explora un entorno aislado con datos ficticios.
              </p>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full rounded-xl border border-primary/60 bg-primary/10 py-3 font-black uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-on-primary disabled:opacity-50"
              >
                Explorar demo
              </button>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <p className="text-center text-white/30 text-xs mt-10 font-bold uppercase tracking-widest">
          © {new Date().getFullYear()} SPORT GYM — Sistema Integrado
        </p>
      </div>
    </div>
  );
}
