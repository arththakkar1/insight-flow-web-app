import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, AlertTriangle, ChevronRight, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { apiFetch } from '../utils/api';

export default function DataEditor() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [rowData, setRowData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

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
          setColumns(data.columns);
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
        fetchData();
        fetchRecommendations();
      }
    } catch (error) {
      console.error("Failed to apply recommendation:", error);
    }
  };

  const totalPages = Math.ceil(rowData.length / pageSize) || 1;
  const currentData = rowData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
        {/* Main Custom Data Table */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col bg-background relative z-0">
          <div className="flex-1 overflow-hidden bg-card border border-border rounded-xl flex flex-col">
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full caption-bottom text-sm text-left">
                <thead className="[&_tr]:border-b sticky top-0 z-10 bg-card">
                  <tr className="border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    {columns.map(col => (
                      <th key={col} className="h-10 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length || 1} className="p-4 align-middle text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center py-10">
                          <p className="font-medium text-sm">No Data to Show</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentData.map((row, i) => (
                      <tr key={i} className="border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        {columns.map(col => (
                          <td key={col} className="p-4 align-middle whitespace-nowrap text-foreground max-w-[250px] truncate">
                            {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-muted-foreground/40 italic">null</span>}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Custom Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-3 border-t border-border bg-card flex items-center justify-between shrink-0 rounded-b-xl">
                <div className="text-xs text-muted-foreground font-medium px-2">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, rowData.length)} of {rowData.length} rows
                </div>
                <div className="flex items-center gap-1.5 pr-2">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-md" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-md" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="px-4 py-1 text-xs font-medium text-foreground bg-muted rounded-md min-w-[3rem] text-center border border-transparent">
                    {currentPage} / {totalPages}
                  </div>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-md" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-md" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
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
                <div key={rec.recommendation_id} className="bg-card p-4 rounded-lg border border-border shadow-sm hover:border-primary/50 transition-all group flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-destructive">Issue: {rec.issue}</h3>
                  </div>
                  <p className="text-sm text-foreground mb-4 font-sans leading-relaxed">{rec.recommendation}</p>
                  <Button 
                    size="sm" 
                    onClick={() => applyRecommendation(rec.recommendation_id)} 
                    className="w-full font-medium shadow-none mt-auto"
                  >
                    Execute Fix
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
