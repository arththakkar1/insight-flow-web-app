import { Outlet, Link, useLocation } from 'react-router-dom';
import { MessageSquare, Database, BarChart2, Settings, User, LogOut, LayoutDashboard } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { motion, AnimatePresence } from 'motion/react';

export default function ProtectedLayout() {
  const location = useLocation();

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
    <div className="flex h-[100dvh] bg-muted/30 text-foreground font-sans overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Sidebar - Soft, Premium */}
      <aside className="w-64 border-r border-border flex flex-col shrink-0 bg-background/50 backdrop-blur-xl">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <div className="bg-primary p-1.5 rounded-lg text-primary-foreground mr-3">
            <LayoutDashboard size={18} />
          </div>
          <h1 className="text-lg font-bold tracking-tight">InsightFlow</h1>
        </div>
        
        <nav className="flex-1 py-6 flex flex-col gap-1 px-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4">
          <div className="flex flex-col gap-1">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
            
            <div className="flex items-center justify-between px-3 py-2 mt-4 border-t border-border/50 pt-4">
              <Link
                to="/login"
                className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut size={18} />
                Log Out
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto bg-muted/30">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, filter: 'blur(2px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(2px)' }}
              transition={{ duration: 0.3 }}
              className="p-8 h-full max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
