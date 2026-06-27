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

  // Fast synchronous check — no network request needed
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
    <div className="min-h-[100dvh] flex flex-col bg-muted/30 text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
            <BarChart2 size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight">InsightFlow</span>
        </Link>
        <ThemeToggle />
      </nav>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 md:p-10 bg-background border border-border shadow-xl shadow-black/5 rounded-3xl">
          <div className="flex flex-col items-center mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Welcome back</h2>
            <p className="text-muted-foreground text-sm">Enter your credentials to continue to your workspace.</p>
          </div>
          <form className="space-y-5" onSubmit={handleLogin}>
            {error && <div className="text-destructive text-sm text-center">{error}</div>}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity shadow-md shadow-primary/20 mt-2 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <div className="text-center text-sm mt-6">
              <Link to="/register" className="text-muted-foreground hover:text-primary transition-colors">
                Don't have an account? Sign up
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
