import { Database, BrainCircuit, LineChart } from 'lucide-react';

export default function Features() {
  return (
    <section className="bg-background py-[96px] border-t border-border relative z-30" id="features">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="max-w-3xl mb-16">
          <h2 className="text-3xl md:text-[50px] font-medium tracking-framer-lg text-foreground mb-4 leading-tight">
            Automate analytical workflows, start to finish.
          </h2>
          <p className="text-base text-muted-foreground max-w-xl font-sans">
            A precise analytical suite designed to accelerate data cleaning, schema modeling, measure generation, and machine learning predictions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 - Charcoal */}
          <div className="p-8 rounded-[20px] bg-card border border-border flex flex-col justify-between min-h-[260px] shadow-sm">
            <div className="text-foreground bg-secondary border border-border w-10 h-10 rounded-full flex items-center justify-center mb-6">
              <Database size={18} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground mb-2 font-sans">Automated Data Profiling</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Instantly profile datasets, check metrics, and run optimization fixes on columns with anomalous values.
              </p>
            </div>
          </div>
          
          {/* Card 2 - Charcoal */}
          <div className="p-8 rounded-[20px] bg-card border border-border flex flex-col justify-between min-h-[260px] shadow-sm">
            <div className="text-foreground bg-secondary border border-border w-10 h-10 rounded-full flex items-center justify-center mb-6">
              <BrainCircuit size={18} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground mb-2 font-sans">DAX Recommendations</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Write formulas using natural language. Generate KPI measures and complex time intelligence expressions in seconds.
              </p>
            </div>
          </div>
          
          {/* Card 3 - Gradient Spotlight Card */}
          <div className="p-8 rounded-[30px] bg-gradient-framer-violet text-white flex flex-col justify-between min-h-[260px] shadow-lg relative overflow-hidden group">
            {/* Subtle glow highlight overlay */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="text-black bg-white w-10 h-10 rounded-full flex items-center justify-center mb-6 shadow-md relative z-10">
              <LineChart size={18} strokeWidth={2.5} />
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-semibold tracking-tight text-white mb-2 font-sans">Predictive ML Models</h3>
              <p className="text-sm text-white/80 leading-relaxed font-sans">
                Build decision trees and classification models directly on your ingested data. Generate diagnostics reports instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
