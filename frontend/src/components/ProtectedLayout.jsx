import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { MessageSquare, Database, BarChart2, Settings, User, LogOut, Trash2 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import DeleteModal from './DeleteModal';
import { isAuthenticated } from '../utils/api';

export default function ProtectedLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const token = isAuthenticated();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await fetch('http://localhost:8000/api/auth/logout/', {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
    // Clear the frontend flag cookie
    document.cookie = 'is_authenticated=; path=/; max-age=0';
    navigate('/login');
  };

  const navItems = [
    { name: 'AI Assistant', path: '/chat', icon: MessageSquare },
    { name: 'Datasets', path: '/datasets', icon: Database },
    { name: 'Reports', path: '/reports', icon: BarChart2 },
  ];

  const bottomNavItems = [
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="flex h-dvh bg-muted text-foreground font-sans overflow-hidden selection:bg-primary selection:text-primary-foreground p-4 gap-4">
      {/* Sidebar - High Contrast Modular Panel */}
      <aside className="w-64 bg-background border border-border rounded-[16px] flex flex-col shrink-0 shadow-sm overflow-hidden">
        <div className="h-20 flex items-center px-6 border-b border-border">
          <div className="bg-primary p-2 rounded-lg text-primary-foreground mr-3">
            <BarChart2 size={20} strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">InsightFlow</h1>
        </div>
        
        <nav className="flex-1 py-6 flex flex-col gap-2 px-4 overflow-y-auto">
          <div className="px-2 mb-2">
            <span className="text-[10px] font-mono font-bold tracking-wider text-muted-foreground uppercase">Platform</span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-md scale-[0.98]' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border bg-card">
          <div className="flex flex-col gap-1">
            <div className="px-2 mb-2 mt-2">
              <span className="text-[10px] font-mono font-bold tracking-wider text-muted-foreground uppercase">System</span>
            </div>
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
            
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive transition-all text-left w-full mt-1"
            >
              <Trash2 size={18} />
              Manage Data
            </button>
            
            <div className="flex items-center justify-between px-3 py-2 mt-4 pt-4 border-t border-border">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut size={18} />
                Log Out
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-0 flex flex-col bg-background border border-border rounded-[16px] shadow-sm overflow-hidden relative">
        {location.pathname.startsWith('/chat') ? (
          <Outlet context={{ openDeleteModal: () => setIsDeleteModalOpen(true) }} />
        ) : (
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6 max-w-[1400px] mx-auto">
              <Outlet context={{ openDeleteModal: () => setIsDeleteModalOpen(true) }} />
            </div>
          </div>
        )}
      </main>

      <DeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} />
    </div>
  );
}
