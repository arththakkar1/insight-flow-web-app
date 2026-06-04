import { Link } from 'react-router-dom';
import { BarChart2, Database, LayoutDashboard, BrainCircuit } from 'lucide-react';
import { motion } from 'motion/react';
import { ThemeToggle } from '../components/ThemeToggle';

export default function Landing() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
            <BarChart2 size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">InsightFlow</span>
        </div>
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <Link to="/login" className="text-sm font-medium hover:text-muted-foreground transition">Login</Link>
          <Link to="/register" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 shadow-sm transition">Get Started</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-24 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm font-medium text-muted-foreground mb-10"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          AI Analytics Engine
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] max-w-4xl mb-8"
        >
          Turn your complex data into <span className="text-primary">clear action.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12"
        >
          Automate data cleaning, schema modeling, and DAX generation with a single prompt. No manual scripting required.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link to="/register" className="px-8 py-4 bg-primary text-primary-foreground rounded-full text-lg font-medium hover:opacity-90 transition shadow-lg shadow-primary/25">Start Free Trial</Link>
          <Link to="/login" className="px-8 py-4 bg-card text-foreground border border-border rounded-full text-lg font-medium hover:bg-muted transition shadow-sm">Go to App</Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 text-left w-full"
        >
          <div className="p-8 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <Database size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Automated Profiling</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">Instantly detect data types, missing values, and anomalies with our AI engine. No manual cleaning required.</p>
          </div>
          <div className="p-8 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <BrainCircuit size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">DAX Generator</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">Generate complex DAX formulas using natural language for your Power BI models instantly.</p>
          </div>
          <div className="p-8 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <LayoutDashboard size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Dashboard Blueprints</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">Get intelligent layout structures and chart recommendations to build visually stunning dashboards.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
