import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { isAuthenticated } from '../utils/api';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fast synchronous check
  if (isAuthenticated()) {
    return <Navigate to="/datasets" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok) {
        navigate('/datasets');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground font-sans selection:bg-[#0099ff]/30 selection:text-foreground">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2 cursor-pointer select-none">
          <div className="bg-foreground text-background p-1 rounded-full">
            <BarChart2 size={14} strokeWidth={2.5} />
          </div>
          <span className="font-sans text-[15px] font-bold tracking-tight text-foreground">InsightFlow</span>
        </Link>
        <ThemeToggle />
      </nav>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-[400px] w-full p-8 bg-card border border-border rounded-[20px] shadow-sm">
          <div className="flex flex-col items-center mb-6 text-center">
            <h2 className="text-xl font-semibold tracking-tight text-foreground mb-1 font-sans">Welcome back</h2>
            <p className="text-muted-foreground text-xs font-sans">Enter your credentials to continue to your workspace.</p>
          </div>
          
          <form className="space-y-4" onSubmit={handleLogin}>
            {error && <div className="text-[#ff5577] text-xs font-semibold text-center font-sans">{error}</div>}
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-muted-foreground font-sans">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2 bg-background border border-border rounded-md text-sm text-foreground outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/50 font-sans transition-all"
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-muted-foreground font-sans">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-background border border-border rounded-md text-sm text-foreground outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/50 font-sans transition-all"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all rounded-full font-semibold text-sm shadow-sm mt-3"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            
            <div className="text-center text-xs mt-5">
              <Link to="/register" className="text-muted-foreground hover:text-foreground font-sans font-medium transition-colors">
                Don't have an account? Sign up
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
