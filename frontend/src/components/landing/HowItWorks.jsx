export default function HowItWorks() {
  return (
    <section className="bg-background py-[96px] border-t border-border" id="how-it-works">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="max-w-3xl mb-16">
          <h2 className="text-3xl md:text-[50px] font-medium tracking-framer-lg text-foreground mb-4 leading-tight">
            How it works
          </h2>
          <p className="text-base text-muted-foreground max-w-xl font-sans">
            Three simple steps to unlock the full potential of your database and analytical workspace.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Step 1 */}
          <div className="flex flex-col items-start text-left border-t border-border pt-6 relative">
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#0099ff] mb-4">
              01
            </span>
            <h3 className="text-lg font-semibold tracking-tight text-foreground mb-2 font-sans">Connect data matrix</h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-sans">
              Ingest standard CSV/Excel sheets or interface directly with connected analytical sources.
            </p>
          </div>
  
          {/* Step 2 */}
          <div className="flex flex-col items-start text-left border-t border-border pt-6 relative">
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#0099ff] mb-4">
              02
            </span>
            <h3 className="text-lg font-semibold tracking-tight text-foreground mb-2 font-sans">Select target metrics</h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-sans">
              Choose your feature columns and target variables. Run cleaning protocols and optimize structure.
            </p>
          </div>
  
          {/* Step 3 */}
          <div className="flex flex-col items-start text-left border-t border-border pt-6 relative">
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#0099ff] mb-4">
              03
            </span>
            <h3 className="text-lg font-semibold tracking-tight text-foreground mb-2 font-sans">Get blueprint insights</h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-sans">
              Review model diagnostics, prediction charts, DAX formulas, and schema relationships instantly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
