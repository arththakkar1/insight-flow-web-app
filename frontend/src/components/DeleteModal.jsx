import { apiFetch } from '../utils/api';
import { useState, useEffect } from 'react';
import { X, Trash2, CheckCircle2, Database, BarChart2, Loader2, FileText } from 'lucide-react';

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
        apiFetch('http://localhost:8000/api/datasets/').then(res => res.json()),
        apiFetch('http://localhost:8000/api/reports/').then(res => res.json())
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
        promises.push(apiFetch('http://localhost:8000/api/datasets/', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ delete_all: false, ids: selectedDatasets })
        }));
      }
      if (selectedReports.length > 0) {
        promises.push(apiFetch('http://localhost:8000/api/reports/', {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm animate-in fade-in duration-150 p-4">
      <div className="bg-card w-full max-w-3xl max-h-[85vh] border border-border rounded-[20px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2 text-foreground font-sans">
              <Trash2 size={18} className="text-[#f10303]" />
              Data Manager
            </h2>
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mt-1 font-bold">Select analytical assets to purge</p>
          </div>
          <button onClick={onClose} className="p-2 bg-background border border-border rounded-lg hover:bg-accent transition-all text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-background flex flex-col gap-6 relative">
          {loading ? (
            <div className="py-20 flex justify-center items-center font-mono text-[11px] text-muted-foreground animate-pulse tracking-widest uppercase">
              Retrieving System Records...
            </div>
          ) : (
            <div className="space-y-8">
              {/* Datasets Section */}
              <div>
                <div className="flex justify-between items-center border-b border-border pb-2.5 mb-4">
                  <h3 className="text-xs font-bold font-sans tracking-tight text-foreground flex items-center gap-2">
                    <Database size={14} className="text-muted-foreground" /> Datasets ({datasets.length})
                  </h3>
                  {datasets.length > 0 && (
                    <button 
                      onClick={() => setSelectedDatasets(datasets.map(d => d.id))}
                      className="text-[9px] font-mono font-bold tracking-wider uppercase text-foreground hover:text-[#f10303] transition-all bg-card hover:bg-accent px-2.5 py-1 rounded-md border border-border"
                    >
                      Select All
                    </button>
                  )}
                </div>
                {datasets.length === 0 ? (
                   <div className="p-6 border border-border border-dashed rounded-[15px] bg-card flex items-center justify-center">
                     <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">No datasets found</p>
                   </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {datasets.map(ds => (
                      <div 
                        key={ds.id}
                        onClick={() => toggleDataset(ds.id)}
                        className={`flex items-center gap-4 p-4 rounded-[15px] border cursor-pointer transition-all ${
                          selectedDatasets.includes(ds.id) 
                            ? 'bg-[#3d0000] border-[#f10303] shadow-[0_0_0_1px_#f10303]' 
                            : 'bg-card border-border hover:border-foreground/30 hover:bg-accent/40'
                        }`}
                      >
                        <div className="shrink-0">
                          {selectedDatasets.includes(ds.id) ? (
                            <div className="w-5 h-5 rounded-[5px] bg-[#f10303] text-white flex items-center justify-center scale-105 transition-all">
                              <CheckCircle2 size={14} className="stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-[5px] border border-border transition-all bg-background" />
                          )}
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-semibold tracking-tight text-foreground font-sans truncate">{ds.name}</p>
                          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-0.5">{ds.rows_count?.toLocaleString()} rows</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reports Section */}
              <div>
                <div className="flex justify-between items-center border-b border-border pb-2.5 mb-4">
                  <h3 className="text-xs font-bold font-sans tracking-tight text-foreground flex items-center gap-2">
                    <BarChart2 size={14} className="text-muted-foreground" /> Reports ({reports.length})
                  </h3>
                  {reports.length > 0 && (
                    <button 
                      onClick={() => setSelectedReports(reports.map(r => r.id))}
                      className="text-[9px] font-mono font-bold tracking-wider uppercase text-foreground hover:text-[#f10303] transition-all bg-card hover:bg-accent px-2.5 py-1 rounded-md border border-border"
                    >
                      Select All
                    </button>
                  )}
                </div>
                {reports.length === 0 ? (
                   <div className="p-6 border border-border border-dashed rounded-[15px] bg-card flex items-center justify-center">
                     <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">No reports found</p>
                   </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {reports.map(rep => (
                      <div 
                        key={rep.id}
                        onClick={() => toggleReport(rep.id)}
                        className={`flex items-center gap-4 p-4 rounded-[15px] border cursor-pointer transition-all ${
                          selectedReports.includes(rep.id) 
                            ? 'bg-[#3d0000] border-[#f10303] shadow-[0_0_0_1px_#f10303]' 
                            : 'bg-card border-border hover:border-foreground/30 hover:bg-accent/40'
                        }`}
                      >
                        <div className="shrink-0">
                          {selectedReports.includes(rep.id) ? (
                            <div className="w-5 h-5 rounded-[5px] bg-[#f10303] text-white flex items-center justify-center scale-105 transition-all">
                              <CheckCircle2 size={14} className="stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-[5px] border border-border transition-all bg-background" />
                          )}
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-semibold tracking-tight text-foreground font-sans truncate">{rep.title}</p>
                          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-0.5 truncate">Source: {rep.dataset}</p>
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
        <div className="px-6 py-4 border-t border-border bg-card flex justify-between items-center relative z-10">
          <div className="text-[10px] font-sans text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f10303] animate-pulse" style={{ opacity: totalSelected > 0 ? 1 : 0.3 }} />
            {totalSelected} Items Selected
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              disabled={deleting}
              className="px-5 py-2 rounded-full text-xs font-semibold bg-background hover:bg-accent border border-border text-foreground transition-all shadow-sm disabled:opacity-50 active:scale-95"
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete}
              disabled={totalSelected === 0 || deleting}
              className="px-5 py-2 rounded-full text-xs font-semibold bg-[#f10303] hover:opacity-90 text-white transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {deleting ? (
                <><Loader2 size={12} className="animate-spin" /> Purging...</>
              ) : (
                <><Trash2 size={12} /> Execute Purge</>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
