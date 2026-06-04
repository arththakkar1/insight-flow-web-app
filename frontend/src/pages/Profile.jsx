import { User, Mail, Building, Edit2 } from 'lucide-react';

export default function Profile() {
  return (
    <div className="max-w-4xl space-y-8">
      <div className="border-b border-border/50 pb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-1">User Profile</h1>
        <p className="text-muted-foreground text-sm">View and manage your personal info.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 bg-background border border-border rounded-3xl p-8 flex flex-col items-center text-center shadow-sm">
          <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
            <User size={40} />
          </div>
          <h2 className="text-lg font-bold tracking-tight mb-1">Alex Analyst</h2>
          <p className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">Admin</p>
        </div>
        
        <div className="col-span-1 md:col-span-2 bg-background border border-border rounded-3xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition">
              <Edit2 size={16} />
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-4 items-center">
              <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                <User size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-0.5">Full Name</p>
                <p className="text-sm font-medium">Alex Analyst</p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-0.5">Email</p>
                <p className="text-sm font-medium">alex@insightflow.app</p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                <Building size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-0.5">Organization</p>
                <p className="text-sm font-medium">Acme Corp Data Team</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
