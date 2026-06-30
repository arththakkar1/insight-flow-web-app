import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { MessageSquare, Database, BarChart2, Settings, User, LogOut, Trash2, BrainCircuit, Menu, X } from 'lucide-react';
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
    { name: 'ML Models', path: '/ml-models', icon: BrainCircuit },
    { name: 'Reports', path: '/reports', icon: BarChart2 },
  ];

  const bottomNavItems = [
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-dvh bg-background text-foreground font-sans overflow-hidden selection:bg-[#0099ff]/30 selection:text-foreground md:p-4 gap-4 relative">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex relative z-30 h-auto w-64 bg-card border border-border rounded-xl flex-col shrink-0 shadow-sm overflow-hidden transition-all">
        <div className="hidden md:flex h-14 items-center px-5 border-b border-border shrink-0">
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
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
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

        <div className="p-3 border-t border-border bg-card shrink-0">
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
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
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-[#f10303] hover:bg-[#000000] transition-all text-left w-full mt-0.5 cursor-pointer"
            >
              <Trash2 size={16} />
              Manage Data
            </button>
            
            <div className="flex items-center justify-between px-3 py-2 mt-3 pt-3 border-t border-border">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground hover:text-[#ff5577] transition-colors cursor-pointer"
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
      <main className="flex-1 min-h-0 flex flex-col bg-background md:border border-border md:rounded-xl shadow-sm overflow-hidden relative z-10 pb-16 md:pb-0">
        {location.pathname.startsWith('/chat') ? (
          <Outlet context={{ openDeleteModal: () => setIsDeleteModalOpen(true) }} />
        ) : (
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
              <Outlet context={{ openDeleteModal: () => setIsDeleteModalOpen(true) }} />
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-background/85 backdrop-blur-xl border-t border-border z-40 flex items-center justify-around pb-[env(safe-area-inset-bottom)] px-2 pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`relative flex flex-col items-center justify-center p-2 w-16 gap-1 rounded-xl transition-all cursor-pointer ${
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'
              }`}
            >
              <div className={`flex items-center justify-center transition-all ${isActive ? 'scale-110' : 'scale-100'}`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[9px] font-medium font-sans mt-0.5 mb-1">{item.name.split(' ')[0]}</span>
              {isActive && (
                <motion.div layoutId="bottomNavIndicator" className="absolute bottom-0.5 w-1 h-1 bg-foreground rounded-full" />
              )}
            </Link>
          );
        })}
        <button
          onClick={() => setIsMobileMoreOpen(!isMobileMoreOpen)}
          className={`flex flex-col items-center justify-center p-2 w-16 gap-1 rounded-xl transition-all cursor-pointer ${
            isMobileMoreOpen ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'
          }`}
        >
          <div className={`relative flex items-center justify-center transition-all ${isMobileMoreOpen ? 'scale-110' : 'scale-100'}`}>
            <Menu size={20} strokeWidth={isMobileMoreOpen ? 2.5 : 2} />
          </div>
          <span className="text-[9px] font-medium font-sans mt-0.5">More</span>
        </button>
      </nav>

      {/* Mobile 'More' Bottom Sheet */}
      <AnimatePresence>
        {isMobileMoreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden fixed inset-0 z-40 bg-background/60 backdrop-blur-md cursor-pointer"
              onClick={() => setIsMobileMoreOpen(false)}
            />
            <motion.div
              initial={{ y: "100%", opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "100%", opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden fixed bottom-[90px] inset-x-3 z-50 bg-card/90 backdrop-blur-2xl border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-2 border-b border-border flex items-center justify-between">
                <span className="px-3 text-xs font-bold tracking-wider uppercase text-muted-foreground">Settings & More</span>
                <button onClick={() => setIsMobileMoreOpen(false)} className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors cursor-pointer"><X size={16} /></button>
              </div>
              <div className="p-2 flex flex-col gap-1">
                {bottomNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMoreOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-foreground hover:bg-secondary cursor-pointer"
                    >
                      <Icon size={18} />
                      {item.name}
                    </Link>
                  );
                })}
                <button
                  onClick={() => { setIsDeleteModalOpen(true); setIsMobileMoreOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#f10303] hover:bg-[#ff5577]/10 transition-all text-left cursor-pointer"
                >
                  <Trash2 size={18} />
                  Manage Data
                </button>
                <div className="flex items-center justify-between px-4 py-3 border-t border-border mt-1">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-[#ff5577] transition-colors cursor-pointer"
                  >
                    <LogOut size={18} />
                    Log out
                  </button>
                  <ThemeToggle />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <DeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} />
    </div>
  );
}
