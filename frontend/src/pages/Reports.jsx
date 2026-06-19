import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import { PieChart, LineChart, BarChart, ChevronRight, FileText, Trash2 } from 'lucide-react';

export default function Reports() {
  const { reportId } = useParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportDetails, setReportDetails] = useState(null);
  const navigate = useNavigate();
  const { openDeleteModal } = useOutletContext() || {};

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
          <h1 className="text-[32px] leading-tight font-medium tracking-tight">{reportDetails.title}</h1>
          <div className="flex gap-2">
            <button 
              onClick={handleDeleteSingle}
              className="flex items-center gap-2 px-4 py-2 bg-background border border-border text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive rounded-[8px] text-sm font-semibold transition-all shadow-sm"
            >
              <Trash2 size={16} />
              Delete
            </button>
            <a 
              href={`http://localhost:8000/api/reports/${reportId}/export/`}
              download
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-[8px] text-sm font-semibold transition-all shadow-sm"
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
            <button onClick={openDeleteModal} className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border text-destructive hover:bg-destructive/10 rounded-lg text-sm font-semibold transition-all shadow-sm">
              <Trash2 size={16} />
              Manage Data
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading reports...</div>
        ) : reports.map((report) => (
          <div key={report.id} onClick={() => navigate(`/reports/${report.id}`)} className="p-6 bg-card rounded-[16px] border border-border shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.04)] hover:border-primary/50 transition-all flex justify-between items-center cursor-pointer group">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-background border border-border text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors rounded-[8px] shadow-sm">
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
