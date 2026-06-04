import { Database, BrainCircuit, LayoutDashboard } from 'lucide-react';

export default function Features() {
  return (
    <section className="bg-card py-32 border-t border-border/50 relative z-30" id="product">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-bold tracking-tight mb-6">Everything you need to master your data</h2>
          <p className="text-lg text-muted-foreground">A complete suite of AI-driven tools designed to accelerate your analytics workflow from raw data to polished dashboards.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-background border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <Database size={28} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Automated Profiling</h3>
            <p className="text-muted-foreground leading-relaxed">Instantly detect data types, missing values, and anomalies with our AI engine. No manual cleaning required.</p>
          </div>
          <div className="p-8 rounded-3xl bg-background border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <BrainCircuit size={28} />
            </div>
            <h3 className="text-xl font-semibold mb-3">DAX Generator</h3>
            <p className="text-muted-foreground leading-relaxed">Generate complex DAX formulas using natural language for your Power BI models instantly.</p>
          </div>
          <div className="p-8 rounded-3xl bg-background border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <LayoutDashboard size={28} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Dashboard Blueprints</h3>
            <p className="text-muted-foreground leading-relaxed">Get intelligent layout structures and chart recommendations to build visually stunning dashboards.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
