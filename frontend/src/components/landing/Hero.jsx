import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function Hero() {
  return (
    <div className="relative w-full overflow-hidden bg-background">
      {/* Framer atmosphere overlay */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#6a4cf5]/15 to-transparent rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-[1400px] mx-auto px-8 pt-20 pb-0 flex flex-col items-center relative z-10">
        <div className="max-w-4xl text-center flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-6"
          >
            <Sparkles size={12} className="text-foreground" />
            <span>InsightFlow 2.0 with ML Report Builder</span>
            <ArrowRight size={10} />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-[85px] font-medium tracking-framer-xl text-foreground mb-6"
          >
            Turn raw data into <br />
            <span className="text-muted-foreground">predictive models.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-lg text-muted-foreground max-w-xl mb-8 leading-normal font-sans"
          >
            Clean anomalies, optimize data schemas, and generate predictive ML models in minutes. Run analytics seamlessly.
          </motion.p>
 
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-4"
          >
            <Link to="/register" className="px-6 py-2.5 bg-primary text-primary-foreground hover:opacity-90 rounded-full text-sm font-semibold active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-sm">
              Get started <ArrowRight size={14} />
            </Link>
            <Link to="/login" className="px-6 py-2.5 bg-secondary hover:bg-accent text-foreground border border-border rounded-full text-sm font-semibold active:scale-[0.98] transition-all">
              Explore demo
            </Link>
          </motion.div>
        </div>
 
        {/* Framer Product Mockup Card */}
        <motion.div 
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 w-full max-w-5xl bg-card border border-border rounded-t-xl shadow-2xl overflow-hidden flex flex-col shrink-0"
        >
          {/* Mockup Header - Framer style */}
          <div className="h-11 border-b border-border bg-background/60 backdrop-blur flex items-center px-5 gap-1.5 shrink-0 justify-between">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-border" />
              <div className="w-2.5 h-2.5 rounded-full bg-border" />
              <div className="w-2.5 h-2.5 rounded-full bg-border" />
            </div>
            <div className="px-3 py-0.5 rounded-md bg-card border border-border text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-semibold">
              app.insightflow.ai/workspace
            </div>
            <div className="w-12"></div>
          </div>
          
          {/* Mockup Body */}
          <div className="flex-1 p-5 grid grid-cols-1 md:grid-cols-4 gap-5 min-h-[360px] bg-background">
            {/* Sidebar element */}
            <div className="border border-border rounded-lg p-4 bg-card flex flex-col gap-3.5">
              <div className="h-4 w-3/4 bg-border rounded" />
              <div className="h-6 w-full bg-secondary border border-border rounded shadow-sm" />
              <div className="h-6 w-full bg-secondary/40 border border-border/50 rounded" />
              <div className="h-6 w-full bg-secondary/40 border border-border/50 rounded" />
              <div className="mt-auto h-8 w-full bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[11px] font-semibold">
                Generate Report
              </div>
            </div>
            
            {/* Main view element */}
            <div className="md:col-span-3 border border-border rounded-lg p-5 bg-card flex flex-col gap-5">
               <div className="flex justify-between items-center border-b border-border pb-3">
                 <div>
                    <div className="h-4 w-32 bg-border rounded mb-1.5" />
                    <div className="h-2.5 w-48 bg-border/60 rounded" />
                 </div>
                 <div className="h-7 w-24 bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20 rounded-full text-[10px] font-semibold flex items-center justify-center">
                   Ready to Train
                 </div>
               </div>
               
               {/* ML report columns selector demo */}
               <div className="grid grid-cols-3 gap-4">
                 <div className="border border-border rounded-md p-3.5 bg-background">
                    <div className="h-3 w-16 bg-border rounded mb-2.5" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-foreground" /><div className="h-2 w-12 bg-border" /></div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-foreground" /><div className="h-2 w-10 bg-border" /></div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-border/40" /><div className="h-2 w-14 bg-border/40 rounded" /></div>
                    </div>
                 </div>
                 <div className="border border-border rounded-md p-3.5 bg-background">
                    <div className="h-3 w-12 bg-border rounded mb-2.5" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full border border-border" /><div className="h-2 w-12 bg-border" /></div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full border border-[#0099ff] bg-[#0099ff]/20" /><div className="h-2 w-14 bg-border" /></div>
                    </div>
                 </div>
                 <div className="border border-border rounded-md p-3.5 bg-background flex flex-col justify-between">
                    <div>
                      <div className="h-3 w-16 bg-border rounded mb-1.5" />
                      <div className="h-2.5 w-20 bg-border/40 rounded" />
                    </div>
                    <div className="h-6 w-full bg-primary text-primary-foreground rounded-full text-[9px] font-semibold flex items-center justify-center">
                      Train Model
                    </div>
                 </div>
               </div>
               
               <div className="flex-1 bg-background rounded-md border border-border/60 p-4 flex flex-col justify-between">
                 <div className="flex justify-between items-center">
                    <div className="h-3.5 w-36 bg-border" />
                    <div className="h-3 w-16 bg-border/40 rounded" />
                 </div>
                 <div className="flex items-end gap-2.5 pt-6">
                    <div className="bg-border/60 w-full h-8 rounded-t" />
                    <div className="bg-border/60 w-full h-14 rounded-t" />
                    <div className="bg-foreground w-full h-24 rounded-t" />
                    <div className="bg-border/60 w-full h-16 rounded-t" />
                    <div className="bg-border/60 w-full h-10 rounded-t" />
                 </div>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
