import { Link } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 h-14 max-w-[1400px] mx-auto w-full relative z-20 border-b border-border bg-background">
      <Link to="/" className="flex items-center gap-2 cursor-pointer select-none">
        <div className="bg-foreground text-background p-1 rounded-full">
          <BarChart2 size={14} strokeWidth={2.5} />
        </div>
        <span className="font-sans text-[15px] font-bold tracking-tight text-foreground">
          Insight<span className="text-muted-foreground font-normal">Flow</span>
        </span>
      </Link>
      
      <div className="hidden md:flex items-center gap-6 text-[14px] font-medium text-muted-foreground">
        <a href="#features" className="hover:text-foreground transition-colors">Features</a>
        <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
        <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Link to="/login" className="px-3.5 py-1.5 bg-secondary hover:bg-accent text-foreground border border-border rounded-full text-xs font-semibold active:scale-[0.98] transition-all">
          Sign in
        </Link>
        <Link to="/register" className="px-4 py-1.5 bg-primary text-primary-foreground hover:opacity-90 rounded-full text-xs font-semibold active:scale-[0.98] transition-all">
          Get started
        </Link>
      </div>
    </nav>
  );
}
