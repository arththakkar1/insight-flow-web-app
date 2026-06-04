export default function HowItWorks() {
  return (
    <section className="bg-background py-32 border-t border-border/50">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-bold tracking-tight mb-6">How it works</h2>
          <p className="text-lg text-muted-foreground">Three simple steps to unlock the full potential of your data warehouse.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-card border border-border/50 shadow-sm flex items-center justify-center text-3xl font-bold text-primary mb-8 relative">
              1
            </div>
            <h3 className="text-xl font-semibold mb-3">Connect your data</h3>
            <p className="text-muted-foreground leading-relaxed">Upload CSV/Excel files or connect directly to SQL, Snowflake, or BigQuery.</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-card border border-border/50 shadow-sm flex items-center justify-center text-3xl font-bold text-primary mb-8 relative">
              2
            </div>
            <h3 className="text-xl font-semibold mb-3">Ask in plain English</h3>
            <p className="text-muted-foreground leading-relaxed">Request specific metrics, calculations, or cleaning tasks using natural language.</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-card border border-border/50 shadow-sm flex items-center justify-center text-3xl font-bold text-primary mb-8 relative">
              3
            </div>
            <h3 className="text-xl font-semibold mb-3">Get actionable insights</h3>
            <p className="text-muted-foreground leading-relaxed">Receive optimized DAX measures, cleansed datasets, and ready-to-use visual blueprints.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
