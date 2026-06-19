import { Link } from 'react-router-dom';
import { BarChart2, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-6 max-w-[1400px] mx-auto w-full relative z-20">
      <div className="flex items-center gap-3">
        <div className="bg-primary text-primary-foreground p-1.5 rounded-[8px]">
          <BarChart2 size={20} strokeWidth={2.5} />
        </div>
        <span className="text-xl font-bold tracking-tight">InsightFlow</span>
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-[13px] font-mono uppercase tracking-wider font-bold text-muted-foreground">
        <a href="#product" className="hover:text-foreground transition-colors">Product</a>
        <a href="#resources" className="hover:text-foreground transition-colors flex items-center gap-1">Resources <ChevronDown size={14} /></a>
        <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
      </div>

      <div className="flex items-center gap-6">
        <ThemeToggle />
        <Link to="/login" className="text-[13px] font-mono uppercase tracking-wider font-bold text-muted-foreground hover:text-foreground transition-colors">Login</Link>
        <Link to="/register" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-[8px] text-[13px] font-mono uppercase tracking-wider font-bold hover:opacity-90 transition shadow-sm">Try for free</Link>
      </div>
    </nav>
  );
}
