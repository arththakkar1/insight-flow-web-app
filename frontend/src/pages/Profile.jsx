import { User, Mail, Building, Edit2 } from 'lucide-react';

export default function Profile() {
  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-medium tracking-tight mb-1 text-foreground font-sans">User Profile</h1>
        <p className="text-muted-foreground text-xs font-sans">View and manage your personal profile settings.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Meta Card */}
        <div className="col-span-1 bg-card border border-border rounded-[20px] p-6 flex flex-col items-center text-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-background border border-border text-foreground flex items-center justify-center mb-5 shadow-sm">
            <User size={32} className="text-muted-foreground" />
          </div>
          <h2 className="text-lg font-bold tracking-tight mb-1.5 text-foreground font-sans">Alex Analyst</h2>
          <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-[9px] font-bold uppercase tracking-wider">
            Admin
          </span>
        </div>
        
        {/* Right Column: User Details Card */}
        <div className="col-span-1 md:col-span-2 bg-card border border-border rounded-[20px] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-foreground font-sans">Personal Information</h3>
            <button className="p-2 text-muted-foreground hover:text-foreground bg-background hover:bg-accent border border-border rounded-[10px] transition-all">
              <Edit2 size={14} />
            </button>
          </div>
          
          <div className="space-y-5">
            <div className="flex gap-4 items-center p-3 rounded-[12px] bg-background/50 border border-border/40">
              <div className="p-2.5 bg-background border border-border rounded-lg text-muted-foreground">
                <User size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground font-sans font-bold uppercase tracking-wider mb-0.5">Full Name</p>
                <p className="text-xs font-semibold text-foreground font-sans truncate">Alex Analyst</p>
              </div>
            </div>

            <div className="flex gap-4 items-center p-3 rounded-[12px] bg-background/50 border border-border/40">
              <div className="p-2.5 bg-background border border-border rounded-lg text-muted-foreground">
                <Mail size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground font-sans font-bold uppercase tracking-wider mb-0.5">Email Address</p>
                <p className="text-xs font-semibold text-foreground font-sans truncate">alex@insightflow.app</p>
              </div>
            </div>

            <div className="flex gap-4 items-center p-3 rounded-[12px] bg-background/50 border border-border/40">
              <div className="p-2.5 bg-background border border-border rounded-lg text-muted-foreground">
                <Building size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground font-sans font-bold uppercase tracking-wider mb-0.5">Organization</p>
                <p className="text-xs font-semibold text-foreground font-sans truncate">Acme Corp Data Team</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
