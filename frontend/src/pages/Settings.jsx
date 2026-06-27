import { Settings2, Zap, LayoutTemplate } from 'lucide-react';

export default function Settings() {
  return (
    <div className="max-w-4xl pb-5 space-y-8">
      <div className="border-b border-border/50 pb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your workspace preferences.</p>
      </div>
      
      <div className="space-y-6">
        <section className="p-8 bg-background border border-border rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Zap size={20} />
            </div>
            <h2 className="text-lg font-semibold">AI Configuration</h2>
          </div>
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Model Provider</label>
              <select className="w-full md:w-1/2 px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option>LM Studio (Local)</option>
                <option>OpenAI API</option>
                <option>Azure OpenAI</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">API Base URL</label>
              <input type="text" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" defaultValue="http://localhost:1234/v1" />
            </div>
          </div>
        </section>

        <section className="p-8 bg-background border border-border rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Settings2 size={20} />
            </div>
            <h2 className="text-lg font-semibold">Application Preferences</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5 border border-primary bg-primary rounded-md">
                <svg className="w-3 h-3 text-primary-foreground pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <span className="text-sm font-medium">Auto-generate DAX explanations</span>
            </label>
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5 border border-primary bg-primary rounded-md">
                <svg className="w-3 h-3 text-primary-foreground pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <span className="text-sm font-medium">Cache dataset profiles</span>
            </label>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition shadow-sm">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
} 
