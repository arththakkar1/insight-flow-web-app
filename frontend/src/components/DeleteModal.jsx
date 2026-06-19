import { useState, useEffect } from 'react';
import { X, Trash2, CheckCircle2, Database, BarChart2, Loader2 } from 'lucide-react';

export default function DeleteModal({ isOpen, onClose }) {
  const [datasets, setDatasets] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedDatasets, setSelectedDatasets] = useState([]);
  const [selectedReports, setSelectedReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Promise.all([
        fetch('http://localhost:8000/api/datasets/').then(res => res.json()),
        fetch('http://localhost:8000/api/reports/').then(res => res.json())
      ]).then(([dsData, repData]) => {
        setDatasets(dsData || []);
        setReports(repData || []);
        setLoading(false);
      }).catch(err => {
        console.error("Error fetching data", err);
        setLoading(false);
      });
    } else {
      setSelectedDatasets([]);
      setSelectedReports([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const toggleDataset = (id) => {
    if (selectedDatasets.includes(id)) setSelectedDatasets(selectedDatasets.filter(i => i !== id));
    else setSelectedDatasets([...selectedDatasets, id]);
  };

  const toggleReport = (id) => {
    if (selectedReports.includes(id)) setSelectedReports(selectedReports.filter(i => i !== id));
    else setSelectedReports([...selectedReports, id]);
  };

  const handleDelete = async () => {
    if (selectedDatasets.length === 0 && selectedReports.length === 0) return;
    setDeleting(true);

    try {
      const promises = [];
      if (selectedDatasets.length > 0) {
        promises.push(fetch('http://localhost:8000/api/datasets/', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ delete_all: false, ids: selectedDatasets })
        }));
      }
      if (selectedReports.length > 0) {
        promises.push(fetch('http://localhost:8000/api/reports/', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ delete_all: false, ids: selectedReports })
        }));
      }

      await Promise.all(promises);
      window.location.reload(); // Refresh to update underlying pages
    } catch (err) {
      console.error("Deletion error", err);
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  const totalSelected = selectedDatasets.length + selectedReports.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-card w-full max-w-3xl max-h-[85vh] border border-border rounded-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-muted/30">
          <div>
            <h2 className="text-xl font-medium tracking-tight flex items-center gap-2">
              <Trash2 size={20} className="text-destructive" />
              Data Manager
            </h2>
            <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest mt-1 font-bold">Select assets to purge</p>
          </div>
          <button onClick={onClose} className="p-2 bg-background border border-border rounded-[8px] hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-background flex flex-col gap-6 relative">
          {/* Subtle background grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none opacity-50 dark:opacity-20 z-0" />
          
          {loading ? (
            <div className="py-20 flex justify-center items-center font-mono text-[12px] text-muted-foreground animate-pulse tracking-widest uppercase z-10 relative">
              Retrieving System Records...
            </div>
          ) : (
            <div className="z-10 relative space-y-8">
              {/* Datasets Section */}
              <div>
                <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
                  <h3 className="text-sm font-bold font-mono tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                    <Database size={16} /> Datasets ({datasets.length})
                  </h3>
                  {datasets.length > 0 && (
                    <button 
                      onClick={() => setSelectedDatasets(datasets.map(d => d.id))}
                      className="text-[10px] font-mono font-bold tracking-widest uppercase text-foreground hover:text-destructive transition-colors bg-muted px-2.5 py-1 rounded-[6px]"
                    >
                      Select All
                    </button>
                  )}
                </div>
                {datasets.length === 0 ? (
                   <div className="p-6 border border-border border-dashed rounded-[12px] bg-muted/50 flex items-center justify-center">
                     <p className="text-[12px] text-muted-foreground font-mono uppercase tracking-widest font-bold">No datasets found.</p>
                   </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {datasets.map(ds => (
                      <div 
                        key={ds.id}
                        onClick={() => toggleDataset(ds.id)}
                        className={`flex items-center gap-4 p-4 rounded-[12px] border cursor-pointer transition-all ${
                          selectedDatasets.includes(ds.id) 
                            ? 'bg-destructive/5 border-destructive/30' 
                            : 'bg-card border-border hover:border-destructive/20 hover:bg-muted'
                        }`}
                      >
                        <div className="shrink-0">
                          {selectedDatasets.includes(ds.id) ? (
                            <CheckCircle2 size={20} className="text-destructive fill-destructive/10 transition-transform scale-110" strokeWidth={2.5} />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-border/70 transition-all bg-background" />
                          )}
                        </div>
                        <div className="truncate">
                          <p className="text-[15px] font-medium tracking-tight truncate group-hover:text-primary transition-colors">{ds.name}</p>
                          <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">{ds.rows_count?.toLocaleString()} rows</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reports Section */}
              <div>
                <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
                  <h3 className="text-sm font-bold font-mono tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                    <BarChart2 size={16} /> Reports ({reports.length})
                  </h3>
                  {reports.length > 0 && (
                    <button 
                      onClick={() => setSelectedReports(reports.map(r => r.id))}
                      className="text-[10px] font-mono font-bold tracking-widest uppercase text-foreground hover:text-destructive transition-colors bg-muted px-2.5 py-1 rounded-[6px]"
                    >
                      Select All
                    </button>
                  )}
                </div>
                {reports.length === 0 ? (
                   <div className="p-6 border border-border border-dashed rounded-[12px] bg-muted/50 flex items-center justify-center">
                     <p className="text-[12px] text-muted-foreground font-mono uppercase tracking-widest font-bold">No reports found.</p>
                   </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {reports.map(rep => (
                      <div 
                        key={rep.id}
                        onClick={() => toggleReport(rep.id)}
                        className={`flex items-center gap-4 p-4 rounded-[12px] border cursor-pointer transition-all ${
                          selectedReports.includes(rep.id) 
                            ? 'bg-destructive/5 border-destructive/30' 
                            : 'bg-card border-border hover:border-destructive/20 hover:bg-muted'
                        }`}
                      >
                        <div className="shrink-0">
                          {selectedReports.includes(rep.id) ? (
                            <CheckCircle2 size={20} className="text-destructive fill-destructive/10 transition-transform scale-110" strokeWidth={2.5} />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-border/70 transition-all bg-background" />
                          )}
                        </div>
                        <div className="truncate">
                          <p className="text-[15px] font-medium tracking-tight truncate group-hover:text-primary transition-colors">{rep.title}</p>
                          <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5 truncate">Source: {rep.dataset}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-between items-center relative z-10">
          <div className="text-[12px] font-mono text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" style={{ opacity: totalSelected > 0 ? 1 : 0.3 }} />
            {totalSelected} Items Marked
          </div>
          <div className="flex gap-3">

            <button 
              onClick={onClose}
              disabled={deleting}
              className="px-5 py-2.5 rounded-[8px] text-[13px] font-mono uppercase tracking-wider font-bold bg-background border border-border text-foreground hover:bg-muted transition-colors shadow-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete}
              disabled={totalSelected === 0 || deleting}
              className="px-5 py-2.5 rounded-[8px] text-[13px] font-mono uppercase tracking-wider font-bold bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <><Loader2 size={16} className="animate-spin" /> Purging...</>
              ) : (
                <><Trash2 size={16} /> Execute Purge</>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
