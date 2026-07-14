import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ChevronLeft, Check, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { apiFetch } from '../utils/api';

export default function DataEditor() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    fetchRecommendations();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const res = await apiFetch(`http://localhost:8000/api/datasets/${projectId}/data/`);
      if (res.ok) {
        const data = await res.json();
        setRowData(data.data);
        if (data.columns && data.columns.length > 0) {
          setColumnDefs(data.columns.map(col => ({ field: col, sortable: true, filter: true, resizable: true })));
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await apiFetch(`http://localhost:8000/api/datasets/${projectId}/cleaning/`);
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyRecommendation = async (recId) => {
    try {
      const res = await apiFetch(`http://localhost:8000/api/datasets/${projectId}/cleaning/apply/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendation_id: recId })
      });
      if (res.ok) {
        // Refresh data and recommendations
        fetchData();
        fetchRecommendations();
      }
    } catch (error) {
      console.error("Failed to apply recommendation:", error);
    }
  };

  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 100,
  }), []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full bg-background font-sans text-foreground min-h-0"
    >
      <div className="flex items-center p-4 bg-card border-b border-border shrink-0 z-10 shadow-sm relative">
        <Button variant="ghost" onClick={() => navigate(`/datasets/${projectId}`)} className="mr-4 text-foreground hover:bg-accent hover:text-foreground border border-transparent hover:border-border transition-all rounded-full h-9 px-4">
          <ChevronLeft className="w-4 h-4 mr-2" /> Back to Dataset
        </Button>
        <h1 className="text-xl font-bold font-sans tracking-tight">Interactive Data Editor</h1>
      </div>
      
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Main Data Grid */}
        <div className="flex-1 p-0 overflow-hidden flex flex-col bg-background relative z-0">
          <div className="ag-theme-alpine flex-1 w-full h-full" style={{ width: '100%', height: '100%' }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowSelection="multiple"
              animateRows={true}
              pagination={true}
            />
          </div>
        </div>

        {/* Sidebar for Recommendations */}
        <div className="w-80 bg-card border-l border-border overflow-y-auto flex flex-col shrink-0 shadow-[-4px_0_15px_rgba(0,0,0,0.03)] z-10">
          <div className="p-4 border-b border-border shrink-0 bg-card sticky top-0 z-20">
            <h2 className="text-[11px] font-bold flex items-center tracking-wider uppercase text-foreground">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mr-2" />
              AI Recommendations
            </h2>
          </div>
          <div className="flex-1 p-4 space-y-4">
            {loading ? (
              <p className="text-muted-foreground text-[11px] font-mono uppercase tracking-widest animate-pulse">Loading AI Data...</p>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-border rounded-xl bg-background mt-2">
                <Check className="w-10 h-10 text-[#22c55e] mx-auto mb-3 opacity-90" />
                <p className="text-muted-foreground font-sans text-sm font-medium">Dataset is optimal.</p>
                <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">No anomalies detected.</p>
              </div>
            ) : (
              recommendations.map(rec => (
                <div key={rec.recommendation_id} className="bg-background p-4 rounded-xl border border-border shadow-sm hover:border-foreground/30 transition-all group">
                  <h3 className="text-[10px] font-bold mb-2 uppercase tracking-wider text-[#f10303] group-hover:text-[#ff3333] transition-colors">Issue: {rec.issue}</h3>
                  <p className="text-sm text-foreground mb-4 font-sans font-medium">{rec.recommendation}</p>
                  <button onClick={() => applyRecommendation(rec.recommendation_id)} className="w-full bg-primary hover:opacity-90 text-primary-foreground font-semibold rounded-full shadow-sm transition-all active:scale-95 py-2 px-4 text-xs">
                    Execute Fix
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
