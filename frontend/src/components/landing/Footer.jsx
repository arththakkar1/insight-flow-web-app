import { BarChart2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-background py-16 border-t border-border" id="contact">
      <div className="max-w-[1400px] mx-auto px-8 flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="max-w-xs">
          <div className="flex items-center gap-2 mb-6 select-none">
            <div className="bg-foreground text-background p-1 rounded-full">
              <BarChart2 size={14} strokeWidth={2.5} />
            </div>
            <span className="font-sans text-[15px] font-bold tracking-tight text-foreground">
              Insight<span className="text-muted-foreground font-normal">Flow</span>
            </span>
          </div>
          <p className="text-muted-foreground text-[13px] leading-relaxed font-sans">
            Clean anomalies, model schemas, and build ML diagnostics visualizers in minutes.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
          <div>
            <h4 className="text-[13px] font-bold text-foreground mb-4 font-sans uppercase tracking-wider">Product</h4>
            <ul className="space-y-3 text-[13px] text-muted-foreground font-sans">
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-foreground mb-4 font-sans uppercase tracking-wider">Resources</h4>
            <ul className="space-y-3 text-[13px] text-muted-foreground font-sans">
              <li><a href="#" className="hover:text-foreground transition-colors">Docs</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Guides</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-foreground mb-4 font-sans uppercase tracking-wider">Company</h4>
            <ul className="space-y-3 text-[13px] text-muted-foreground font-sans">
              <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-8 mt-16 pt-8 border-t border-border text-[13px] text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4 font-sans">
        <p>© 2026 InsightFlow Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}
