import { useState } from 'react';
import { Settings2, Zap } from 'lucide-react';
import { CustomSelect } from '../components/ui/Select';
import { PromptModal } from '../components/ui/PromptModal';
import { cn } from '../lib/utils';

export default function Settings() {
  const [provider, setProvider] = useState('lm_studio');
  const [apiUrl, setApiUrl] = useState('http://localhost:1234/v1');
  const [autoExplain, setAutoExplain] = useState(true);
  const [cacheProfiles, setCacheProfiles] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

  const providerOptions = [
    { value: 'lm_studio', label: 'LM Studio (Local)' },
    { value: 'openai', label: 'OpenAI API' },
    { value: 'azure', label: 'Azure OpenAI' }
  ];

  const handleSave = () => {
    setShowAlert(true);
  };

  return (
    <div className="max-w-3xl pb-10 space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-medium tracking-tight mb-1 text-foreground font-sans">Settings</h1>
        <p className="text-muted-foreground text-xs font-sans">Manage your workspace preferences and LLM connection properties.</p>
      </div>
      
      <div className="space-y-6">
        {/* AI Configuration Section */}
        <section className="p-6 bg-card border border-border rounded-[20px] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Zap size={18} />
            </div>
            <h2 className="text-sm font-bold tracking-tight text-foreground font-sans">AI Configuration</h2>
          </div>
          <div className="space-y-5 max-w-xl">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-muted-foreground font-sans">Model Provider</label>
              <CustomSelect
                value={provider}
                onChange={(val) => setProvider(val)}
                options={providerOptions}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-muted-foreground font-sans">API Base URL</label>
              <input 
                type="text" 
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/50 text-xs font-semibold text-foreground transition-all font-mono" 
              />
            </div>
          </div>
        </section>

        {/* Application Preferences Section */}
        <section className="p-6 bg-card border border-border rounded-[20px] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Settings2 size={18} />
            </div>
            <h2 className="text-sm font-bold tracking-tight text-foreground font-sans">Application Preferences</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-3.5 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={autoExplain}
                onChange={(e) => setAutoExplain(e.target.checked)}
                className="hidden"
              />
              <div className={cn(
                "relative flex items-center justify-center w-4 h-4 border rounded-[5px] transition-all",
                autoExplain 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : 'bg-background border-border text-transparent group-hover:border-foreground/50'
              )}>
                <svg className="w-2.5 h-2.5 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-foreground font-sans">Auto-generate DAX explanations</span>
            </label>

            <label className="flex items-center gap-3.5 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={cacheProfiles}
                onChange={(e) => setCacheProfiles(e.target.checked)}
                className="hidden"
              />
              <div className={cn(
                "relative flex items-center justify-center w-4 h-4 border rounded-[5px] transition-all",
                cacheProfiles 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : 'bg-background border-border text-transparent group-hover:border-foreground/50'
              )}>
                <svg className="w-2.5 h-2.5 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-foreground font-sans">Cache dataset profiles</span>
            </label>
          </div>
        </section>

        <div className="flex justify-end pt-2">
          <button 
            onClick={handleSave}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>

      <PromptModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title="System Preference Updated"
        message="Settings saved successfully!"
        type="success"
      />
    </div>
  );
}
