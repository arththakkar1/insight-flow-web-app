import { Link } from 'react-router-dom';
import { BarChart2, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-6 max-w-[1400px] mx-auto w-full relative z-20">
      <div className="flex items-center gap-2">
        <BarChart2 size={24} className="text-foreground" />
        <span className="text-xl font-bold tracking-tight">InsightFlow</span>
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
        <a href="#product" className="hover:text-foreground transition-colors">Product</a>
        <a href="#resources" className="hover:text-foreground transition-colors flex items-center gap-1">Resources <ChevronDown size={14} /></a>
        <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
      </div>

      <div className="flex items-center gap-6">
        <ThemeToggle />
        <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Login</Link>
        <Link to="/register" className="px-5 py-2.5 bg-foreground text-background rounded-full text-sm font-medium hover:opacity-90 transition shadow-sm">Try for free</Link>
      </div>
    </nav>
  );
}
