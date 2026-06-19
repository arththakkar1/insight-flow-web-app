import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PieChart, LineChart, BarChart, ChevronRight, FileText, Trash2 } from 'lucide-react';

export default function Reports() {
  const { reportId } = useParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportDetails, setReportDetails] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/api/reports/')
      .then(res => res.json())
      .then(data => {
        setReports(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch reports", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (reportId) {
      fetch(`http://localhost:8000/api/reports/${reportId}/`)
        .then(res => res.json())
        .then(data => setReportDetails(data));
    }
  }, [reportId]);

  const handleDeleteSingle = () => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    fetch(`http://localhost:8000/api/reports/${reportId}/`, { method: 'DELETE' })
      .then(() => navigate('/reports'));
  };

  const handleDeleteBulk = (deleteAll = false) => {
    if (!confirm(deleteAll ? "Delete ALL reports?" : `Delete ${selectedIds.length} selected reports?`)) return;
    fetch('http://localhost:8000/api/reports/', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delete_all: deleteAll, ids: selectedIds })
    }).then(() => {
      setSelectedIds([]);
      fetch('http://localhost:8000/api/reports/')
        .then(res => res.json())
        .then(data => setReports(data));
    });
  };

  if (reportId) {
    if (!reportDetails) return <div className="p-8">Loading report...</div>;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <Link to="/reports" className="hover:text-foreground transition-colors">Reports</Link>
          <ChevronRight size={16} />
          <span className="text-foreground">{reportDetails.title}</span>
        </div>
        
        <div className="flex justify-between items-end mb-8">
          <h1 className="text-2xl font-bold tracking-tight">{reportDetails.title}</h1>
          <div className="flex gap-2">
            <button 
              onClick={handleDeleteSingle}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-sm font-medium transition shadow-sm"
            >
              <Trash2 size={16} />
              Delete
            </button>
            <a 
              href={`http://localhost:8000/api/reports/${reportId}/export/`}
              download
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition shadow-sm"
            >
              Export CSV
            </a>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportDetails.visuals_data?.map((visual, index) => {
            const Icon = visual.type === 'BarChart' ? BarChart : visual.type === 'LineChart' ? LineChart : PieChart;
            return (
              <div key={index} className="p-8 bg-background rounded-3xl border border-border shadow-sm h-64 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Icon size={32} strokeWidth={2} />
                </div>
                <p className="font-semibold mb-1">{visual.title}</p>
                <p className="text-xs text-muted-foreground">{visual.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 p-8 bg-background border border-border rounded-3xl shadow-sm">
          <h3 className="text-lg font-semibold tracking-tight mb-4">Generated DAX Measures</h3>
          <div className="bg-muted p-6 rounded-2xl font-mono text-sm overflow-x-auto text-foreground/80 leading-relaxed border border-border/50">
            {reportDetails.dax_data?.map((dax, index) => (
              <p key={index}><span className="text-primary font-bold">{dax.name}</span> = {dax.formula}</p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Saved Reports</h1>
          <p className="text-muted-foreground text-sm">View your generated dashboards and insights.</p>
        </div>
        <div className="flex gap-3">
          {reports.length > 0 && (
            <>
              {selectedIds.length > 0 && (
                <button onClick={() => handleDeleteBulk(false)} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-sm font-medium hover:bg-red-500 hover:text-white transition shadow-sm">
                  <Trash2 size={18} />
                  Delete Selected ({selectedIds.length})
                </button>
              )}
              <button onClick={() => handleDeleteBulk(true)} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-sm font-medium hover:bg-red-500 hover:text-white transition shadow-sm">
                <Trash2 size={18} />
                Delete All
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading reports...</div>
        ) : reports.map((report) => (
          <div key={report.id} onClick={() => navigate(`/reports/${report.id}`)} className="p-6 bg-background rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex justify-between items-center cursor-pointer group">
            <div className="flex items-center gap-4">
              <div onClick={(e) => e.stopPropagation()} className="mr-2">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  checked={selectedIds.includes(report.id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds([...selectedIds, report.id]);
                    else setSelectedIds(selectedIds.filter(id => id !== report.id));
                  }}
                />
              </div>
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-base tracking-tight mb-1 group-hover:text-primary transition-colors">{report.title}</h3>
                <p className="text-sm text-muted-foreground">Source: {report.dataset}</p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <span className="text-xs text-muted-foreground">{report.generated}</span>
              <div className="flex gap-2">
                <span className="px-2.5 py-1 bg-muted rounded-md text-xs font-medium">{report.visuals_count} Visuals</span>
                <span className="px-2.5 py-1 bg-muted rounded-md text-xs font-medium">{report.dax_count} DAX</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
