import { Link } from 'react-router-dom';
import { ArrowRight, BarChart2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Hero() {
  return (
    <div className="relative w-full">
      {/* Decorative Diagonal Gradient Stripes */}
      <div className="absolute -bottom-64 -right-32 w-[800px] h-[800px] rotate-[35deg] pointer-events-none -z-10 flex opacity-90 blur-[1px]">
        <div className="w-4 h-full bg-gradient-to-b from-yellow-300 to-yellow-500" />
        <div className="w-6 h-full bg-gradient-to-b from-orange-400 to-orange-600" />
        <div className="w-12 h-full bg-gradient-to-b from-pink-500 to-pink-600" />
        <div className="w-64 h-full bg-gradient-to-b from-purple-500 to-indigo-600" />
      </div>

      <div className="max-w-[1400px] mx-auto px-8 pt-5 pb-0 flex flex-col justify-between relative z-10">
        <div className="max-w-3xl pt-2">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 bg-card/30 backdrop-blur-sm text-sm font-medium mb-8 hover:bg-card/50 transition-colors cursor-pointer shadow-sm"
          >
            <span className="text-muted-foreground">InsightFlow 2.0 is now live</span>
            <ArrowRight size={14} className="text-muted-foreground" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-[5.5rem] font-medium tracking-tight leading-[1.05] mb-8 text-foreground"
          >
            Turn complex data into clear action in minutes.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed font-medium"
          >
            Our AI-powered platform automates data cleaning, schema modeling, and DAX generation, so you can focus on driving insights instead of writing scripts.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background rounded-full text-base font-medium hover:opacity-90 transition shadow-md">
              Get Started <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-foreground border border-border/50 rounded-full text-base font-medium hover:bg-card/50 transition backdrop-blur-sm">
              Learn More
            </Link>
          </motion.div>
        </div>

        {/* Floating App Mockup (Bottom Center) */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="mt-24 h-64 md:h-80 bg-background/80 backdrop-blur-xl border-t border-l border-r border-border/50 rounded-t-3xl shadow-2xl overflow-hidden flex flex-col relative z-20 mx-auto w-full max-w-5xl"
        >
          {/* Mockup Header */}
          <div className="h-12 border-b border-border/50 bg-muted/20 flex items-center px-6 gap-2 shrink-0">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <div className="mx-auto px-4 py-1 rounded-md bg-background/50 border border-border/50 text-xs font-mono text-muted-foreground font-medium flex items-center gap-2">
              <BarChart2 size={12} /> app.insightflow.ai
            </div>
          </div>
          {/* Mockup Body */}
          <div className="flex-1 p-6 flex gap-6 overflow-hidden">
            <div className="w-64 h-full bg-card/50 border border-border/50 rounded-2xl hidden md:flex flex-col p-4 gap-4">
              <div className="h-8 w-3/4 bg-muted/50 rounded-lg animate-pulse" />
              <div className="h-4 w-1/2 bg-muted/50 rounded-lg" />
              <div className="h-4 w-full bg-muted/50 rounded-lg" />
              <div className="h-4 w-5/6 bg-muted/50 rounded-lg" />
            </div>
            <div className="flex-1 h-full bg-card/50 border border-border/50 rounded-2xl p-6 flex flex-col gap-6">
               <div className="flex justify-between items-center">
                 <div className="h-8 w-48 bg-muted/50 rounded-lg animate-pulse" />
                 <div className="h-8 w-24 bg-primary/20 rounded-lg" />
               </div>
               <div className="flex-1 flex gap-4">
                 <div className="flex-1 bg-muted/30 rounded-xl border border-border/50" />
                 <div className="flex-1 bg-muted/30 rounded-xl border border-border/50" />
                 <div className="flex-1 bg-muted/30 rounded-xl border border-border/50" />
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
