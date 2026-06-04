import { Link, useNavigate } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';
import { motion } from 'motion/react';
import { ThemeToggle } from '../components/ThemeToggle';

export default function Register() {
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    navigate('/datasets');
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
        <motion.div 
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full p-8 md:p-10 bg-background border border-border shadow-xl shadow-black/5 rounded-3xl"
        >
          <div className="flex flex-col items-center mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Create Account</h2>
            <p className="text-muted-foreground text-sm">Start your free trial and set up your workspace.</p>
          </div>
          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Full Name</label>
                <input type="text" required className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Email Address</label>
                <input type="email" required className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Password</label>
                <input type="password" required className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity shadow-md shadow-primary/20 mt-2">
              Get Started
            </button>
            <div className="text-center text-sm mt-6">
              <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
