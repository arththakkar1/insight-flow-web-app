import { BarChart2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-card py-16 border-t border-border/50" id="contact">
      <div className="max-w-[1400px] mx-auto px-8 flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="max-w-xs">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
              <BarChart2 size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight">InsightFlow</span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">Turn complex data into clear action with our AI-powered analytics suite.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#product" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-8 mt-16 pt-8 border-t border-border/50 text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© 2026 InsightFlow Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}
