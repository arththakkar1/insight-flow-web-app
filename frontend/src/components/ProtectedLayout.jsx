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
    <div className="flex h-dvh bg-background text-foreground font-sans overflow-hidden selection:bg-[#0099ff]/30 selection:text-foreground p-4 gap-4">
      {/* Sidebar - Clean Modular Panel */}
      <aside className="w-64 bg-card border border-border rounded-xl flex flex-col shrink-0 shadow-sm overflow-hidden">
        <div className="h-14 flex items-center px-5 border-b border-border">
          <div className="bg-foreground text-background p-1 rounded-full mr-2.5">
            <BarChart2 size={14} strokeWidth={2.5} />
          </div>
          <span className="font-sans text-[15px] font-bold tracking-tight text-foreground">
            Insight<span className="text-muted-foreground font-normal">Flow</span>
          </span>
        </div>
        
        <nav className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto">
          <div className="px-2 mb-2">
            <span className="text-[10px] font-sans font-semibold tracking-wider text-muted-foreground/60 uppercase">Platform</span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-foreground text-background shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border bg-card">
          <div className="flex flex-col gap-1">
            <div className="px-2 mb-2 mt-1">
              <span className="text-[10px] font-sans font-semibold tracking-wider text-muted-foreground/60 uppercase">System</span>
            </div>
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-foreground text-background shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon size={16} />
                  {item.name}
                </Link>
              );
            })}
            
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-[#ff5577] hover:bg-[#ff5577]/10 transition-all text-left w-full mt-0.5"
            >
              <Trash2 size={16} />
              Manage Data
            </button>
            
            <div className="flex items-center justify-between px-3 py-2 mt-3 pt-3 border-t border-border">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground hover:text-[#ff5577] transition-colors"
              >
                <LogOut size={16} />
                Log out
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-0 flex flex-col bg-background border border-border rounded-xl shadow-sm overflow-hidden relative">
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
