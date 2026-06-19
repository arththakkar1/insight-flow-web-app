import { Link } from 'react-router-dom';
import { ArrowRight, Terminal } from 'lucide-react';
import { motion } from 'motion/react';

export default function Hero() {
  return (
    <div className="relative w-full">
      {/* Brutalist/Grid background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none -z-10 opacity-100 dark:opacity-20" />

      <div className="max-w-[1400px] mx-auto px-8 pt-10 pb-0 flex flex-col justify-between relative z-10">
        <div className="max-w-4xl pt-2 text-center mx-auto flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[4px] border border-border bg-card font-mono text-[11px] uppercase tracking-wider font-bold mb-8 hover:bg-muted transition-colors cursor-pointer shadow-sm text-muted-foreground"
          >
            <span>InsightFlow 2.0 // Active</span>
            <ArrowRight size={12} className="text-muted-foreground" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-[6rem] font-medium tracking-tight leading-[1.02] mb-8 text-foreground"
          >
            Turn complex data into clear action.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed"
          >
            The analytical system that automates data cleaning, schema modeling, and DAX generation. Optimize your infrastructure.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-[8px] text-[14px] font-mono font-bold tracking-widest uppercase hover:opacity-90 transition shadow-md">
              Initialize <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center px-8 py-4 bg-background text-foreground border border-border rounded-[8px] text-[14px] font-mono font-bold tracking-widest uppercase hover:bg-muted transition">
              Documentation
            </Link>
          </motion.div>
        </div>

        {/* Floating App Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="mt-24 h-64 md:h-80 bg-background border-t border-l border-r border-border rounded-t-[16px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(255,255,255,0.05)] overflow-hidden flex flex-col relative z-20 mx-auto w-full max-w-5xl"
        >
          {/* Mockup Header */}
          <div className="h-12 border-b border-border bg-muted/50 flex items-center px-6 gap-2 shrink-0 justify-between">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full border border-border bg-background" />
              <div className="w-3 h-3 rounded-full border border-border bg-background" />
              <div className="w-3 h-3 rounded-full border border-border bg-background" />
            </div>
            <div className="px-4 py-1 rounded-[4px] bg-background border border-border text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-2">
              <Terminal size={12} /> app.insightflow.ai
            </div>
            <div className="w-12"></div>
          </div>
          {/* Mockup Body */}
          <div className="flex-1 p-6 flex gap-6 overflow-hidden">
            <div className="w-64 h-full bg-card border border-border rounded-[12px] hidden md:flex flex-col p-4 gap-4">
              <div className="h-8 w-3/4 bg-muted rounded-[4px] animate-pulse" />
              <div className="h-4 w-1/2 bg-muted rounded-[4px]" />
              <div className="h-4 w-full bg-muted rounded-[4px]" />
              <div className="h-4 w-5/6 bg-muted rounded-[4px]" />
            </div>
            <div className="flex-1 h-full bg-card border border-border rounded-[12px] p-6 flex flex-col gap-6">
               <div className="flex justify-between items-center border-b border-border pb-4">
                 <div className="h-8 w-48 bg-muted rounded-[4px] animate-pulse" />
                 <div className="h-8 w-24 bg-primary rounded-[4px]" />
               </div>
               <div className="flex-1 flex gap-4">
                 <div className="flex-1 bg-background rounded-[8px] border border-border" />
                 <div className="flex-1 bg-background rounded-[8px] border border-border" />
                 <div className="flex-1 bg-background rounded-[8px] border border-border" />
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
