import { apiFetch } from '../utils/api';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import { PieChart, LineChart, BarChart, ChevronRight, FileText, Trash2, BrainCircuit, ArrowLeft } from 'lucide-react';
import { PromptModal } from '../components/ui/PromptModal';

function MLScatterPlot({ data }) {
  if (!data || data.length === 0) return null;
  
  const actuals = data.map(d => d.actual);
  const predicteds = data.map(d => d.predicted);
  const minVal = Math.min(...actuals, ...predicteds) * 0.95;
  const maxVal = Math.max(...actuals, ...predicteds) * 1.05;
  const range = maxVal - minVal;
  
  const width = 500;
  const height = 320;
  const padding = 45;
  
  const getX = (val) => padding + ((val - minVal) / range) * (width - 2 * padding);
  const getY = (val) => height - padding - ((val - minVal) / range) * (height - 2 * padding);
  
  return (
    <div className="w-full bg-card border border-border rounded-[20px] p-5">
      <h4 className="text-sm font-semibold tracking-tight mb-4 text-foreground font-sans">Actual vs. Predicted Fit</h4>
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-foreground">
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="currentColor" className="stroke-border" strokeWidth={1} />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" className="stroke-border" strokeWidth={1} />
          
          {/* Perfect prediction line (y = x) */}
          <line 
            x1={getX(minVal)} 
            y1={getY(minVal)} 
            x2={getX(maxVal)} 
            y2={getY(maxVal)} 
            stroke="currentColor" 
            className="stroke-muted-foreground opacity-30"
            strokeWidth={1.5} 
            strokeDasharray="4 4" 
          />
          
          {/* Data points (Framer Blue Spotlight!) */}
          {data.map((pt, idx) => (
            <circle
              key={idx}
              cx={getX(pt.actual)}
              cy={getY(pt.predicted)}
              r={4}
              className="fill-[#0099ff] cursor-pointer transition-all opacity-85 hover:opacity-100 hover:r-6"
            />
          ))}
          
          {/* Labels */}
          <text x={width / 2} y={height - 8} textAnchor="middle" fill="currentColor" className="text-[10px] font-sans fill-muted-foreground font-semibold">Actual Value</text>
          <text x={12} y={height / 2} textAnchor="middle" transform={`rotate(-90 12 ${height / 2})`} fill="currentColor" className="text-[10px] font-sans fill-muted-foreground font-semibold">Predicted Value</text>
          
          {/* Min/Max value tags */}
          <text x={padding} y={height - padding + 15} textAnchor="middle" fill="currentColor" className="text-[9px] font-mono fill-muted-foreground">{minVal.toFixed(1)}</text>
          <text x={width - padding} y={height - padding + 15} textAnchor="middle" fill="currentColor" className="text-[9px] font-mono fill-muted-foreground">{maxVal.toFixed(1)}</text>
          <text x={padding - 15} y={getY(minVal)} textAnchor="end" fill="currentColor" className="text-[9px] font-mono fill-muted-foreground align-middle">{minVal.toFixed(1)}</text>
          <text x={padding - 15} y={getY(maxVal)} textAnchor="end" fill="currentColor" className="text-[9px] font-mono fill-muted-foreground align-middle">{maxVal.toFixed(1)}</text>
        </svg>
      </div>
      <div className="flex justify-center gap-4 mt-3 text-[10px] font-sans text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0099ff] inline-block"></span> Test predictions
        </div>
        <div className="flex items-center gap-1.5">
          <span className="border-t border-dashed border-muted-foreground/50 w-6 inline-block"></span> Fit line (y=x)
        </div>
      </div>
    </div>
  );
}

function FeatureImportanceChart({ data }) {
  if (!data || data.length === 0) return null;
  const maxImp = Math.max(...data.map(d => d.importance)) || 1.0;
  
  return (
    <div className="w-full bg-card border border-border rounded-[20px] p-5">
      <h4 className="text-sm font-semibold tracking-tight mb-4 text-foreground font-sans">Feature Importance</h4>
      <div className="space-y-4">
        {data.map((item, idx) => {
          const percent = (item.importance / maxImp) * 100;
          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium font-sans">
                <span className="truncate max-w-[75%] font-mono text-[11px] text-foreground">{item.feature}</span>
                <span className="font-mono text-muted-foreground text-[11px]">{(item.importance * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-background h-2 rounded-full overflow-hidden border border-border">
                <div 
                  className="bg-foreground h-full rounded-full transition-all duration-500" 
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Reports() {
  const { reportId } = useParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportDetails, setReportDetails] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();
  const { openDeleteModal } = useOutletContext() || {};

  useEffect(() => {
    apiFetch('http://localhost:8000/api/reports/')
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
      apiFetch(`http://localhost:8000/api/reports/${reportId}/`)
        .then(res => res.json())
        .then(data => setReportDetails(data));
    }
  }, [reportId]);

  const handleDeleteSingle = () => {
    apiFetch(`http://localhost:8000/api/reports/${reportId}/`, { method: 'DELETE' })
      .then(() => {
        setShowDeleteConfirm(false);
        navigate('/reports');
      });
  };

  if (reportId) {
    if (!reportDetails) return <div className="p-8 text-sm font-mono text-muted-foreground">Loading report details...</div>;

    const isML = reportDetails.report_type === 'ml';
    const mlSummary = isML ? reportDetails.visuals_data[0]?.details : null;

    return (
      <div className="space-y-6">
        <div className="flex items-center pb-4 gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-sans">
          <Link to="/reports" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft size={12} /> Reports
          </Link>
          <ChevronRight size={12} />
          <span className="text-foreground">{reportDetails.title}</span>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-border pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-foreground mb-1 font-sans">
              {reportDetails.title}
            </h1>
            <p className="text-xs text-muted-foreground font-sans">
              Generated for dataset <span className="font-semibold text-foreground">{reportDetails.dataset}</span> • {reportDetails.generated}
            </p>
          </div>
          <div className="flex gap-2.5">
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-accent border border-border text-[#ff5577] hover:border-[#ff5577]/20 rounded-full text-xs font-semibold transition-all shadow-sm"
            >
              <Trash2 size={14} />
              Delete Report
            </button>
            <a 
              href={`http://localhost:8000/api/reports/${reportId}/export/`}
              download
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-full text-xs font-semibold transition-all shadow-sm"
            >
              Export PDF
            </a>
          </div>
        </div>

        {isML && mlSummary ? (
          /* ML Report Dashboard */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Metadata and Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-[15px] border border-border bg-card flex flex-col justify-between">
                <span className="text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-wider">Model Algorithm</span>
                <span className="text-lg font-bold tracking-tight mt-3 text-foreground font-sans">
                  {mlSummary.model_type?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="p-5 rounded-[15px] border border-border bg-card flex flex-col justify-between">
                <span className="text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-wider">Task Type</span>
                <span className="text-lg font-bold tracking-tight mt-3 text-[#0099ff] font-sans">
                  {mlSummary.task_type?.toUpperCase()}
                </span>
              </div>
              <div className="p-5 rounded-[15px] border border-border bg-card flex flex-col justify-between">
                <span className="text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-wider">Trained Rows</span>
                <span className="text-lg font-bold tracking-tight mt-3 text-foreground font-sans">
                  {mlSummary.total_rows_trained?.toLocaleString()}
                </span>
              </div>
              <div className="p-5 rounded-[15px] border border-border bg-card flex flex-col justify-between">
                <span className="text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-wider">Target Column</span>
                <span className="font-mono text-sm font-semibold truncate mt-3 text-foreground" title={mlSummary.target_column}>
                  {mlSummary.target_column}
                </span>
              </div>
            </div>

            {/* Performance Diagnostics Grid */}
            <div>
              <h3 className="text-base font-bold tracking-tight mb-4 text-foreground font-sans">Diagnostics Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(mlSummary.metrics).map(([key, val]) => (
                  <div key={key} className="p-5 rounded-[15px] border border-border bg-card shadow-sm">
                    <span className="text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      {key.replace('_', ' ')}
                    </span>
                    <span className="text-3xl font-bold tracking-tight text-foreground font-sans">
                      {key.includes('score') || key.includes('accuracy') || key.includes('precision') || key.includes('recall') || key.includes('r2')
                        ? `${(val * 100).toFixed(1)}%` 
                        : val.toFixed(4)
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FeatureImportanceChart data={mlSummary.feature_importances} />
              
              {mlSummary.task_type === 'regression' ? (
                <MLScatterPlot data={mlSummary.predictions_sample} />
              ) : (
                /* Classification Sample Predictions Table */
                <div className="w-full bg-card border border-border rounded-[20px] p-5 flex flex-col justify-between min-h-[300px]">
                  <div>
                    <h4 className="text-sm font-semibold tracking-tight mb-4 text-foreground font-sans">Classification Predictions Sample</h4>
                    <div className="overflow-x-auto border border-border rounded-[15px] max-h-60 overflow-y-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-background text-foreground font-sans border-b border-border">
                          <tr>
                            <th className="px-4 py-2 font-sans font-semibold text-[11px]">ID</th>
                            <th className="px-4 py-2 font-sans font-semibold text-[11px]">Actual</th>
                            <th className="px-4 py-2 font-sans font-semibold text-[11px]">Predicted</th>
                            <th className="px-4 py-2 font-sans font-semibold text-[11px] text-right">Match</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 font-mono text-muted-foreground">
                          {mlSummary.predictions_sample?.map((pt, i) => (
                            <tr key={i} className="hover:bg-accent transition-colors">
                              <td className="px-4 py-2 text-muted-foreground/60">#{pt.id}</td>
                              <td className="px-4 py-2 text-foreground font-semibold">{pt.actual}</td>
                              <td className="px-4 py-2 text-foreground">{pt.predicted}</td>
                              <td className="px-4 py-2 text-right">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-sans font-semibold border ${
                                  pt.correct ? 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20' : 'bg-[#ff5577]/10 text-[#ff5577] border-[#ff5577]/20'
                                }`}>
                                  {pt.correct ? 'Correct' : 'Mismatch'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Model Suggestions / Details */}
            <div className="p-6 bg-card border border-border rounded-[20px]">
              <h3 className="text-sm font-semibold tracking-tight mb-3 text-foreground font-sans">Model Insights & Next Steps</h3>
              <div className="text-xs space-y-2 text-muted-foreground font-sans leading-relaxed max-w-3xl">
                <p>
                  1. <strong>Feature Selection:</strong> The feature importance chart highlights which metrics influence predictions the most. Features contributing less than 2% can likely be removed to avoid model overfitting.
                </p>
                <p>
                  2. <strong>Task Diagnostics:</strong> For classification, the weighted F1-Score takes both precision and recall into account, helping assess performance on unbalanced categories. For regression, check the R-Squared; an R-Squared above 70% indicates a strong correlation fitting.
                </p>
                <p>
                  3. <strong>Standardization:</strong> Imputing missing values with the median was completed for features. Consider applying outlier filtering to numerical inputs if the error values are high.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Standard BI Report Dashboard */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportDetails.visuals_data?.map((visual, index) => {
                const Icon = visual.type === 'BarChart' ? BarChart : visual.type === 'LineChart' ? LineChart : PieChart;
                return (
                  <div key={index} className="p-8 bg-card rounded-[20px] border border-border shadow-sm h-64 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-background text-foreground flex items-center justify-center mb-4 border border-border">
                      <Icon size={20} strokeWidth={2} />
                    </div>
                    <p className="text-base font-semibold tracking-tight mb-1 text-foreground font-sans">{visual.title}</p>
                    <p className="text-xs text-muted-foreground font-sans">{visual.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 p-6 bg-card border border-border rounded-[20px] shadow-sm">
              <h3 className="text-sm font-semibold tracking-tight mb-4 text-foreground font-sans">Generated DAX Measures</h3>
              <div className="bg-background p-5 rounded-md font-mono text-xs overflow-x-auto text-muted-foreground leading-relaxed border border-border/50">
                {reportDetails.dax_data?.map((dax, index) => (
                  <p key={index} className="mb-2 last:mb-0">
                    <span className="text-foreground font-semibold font-sans block md:inline-block md:w-36">{dax.name}</span> = <span className="opacity-80">{dax.formula}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
        <PromptModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteSingle}
          title="Confirm Report Deletion"
          message="Are you sure you want to delete this report? This action is permanent and cannot be undone."
          type="destructive"
          confirmText="Execute Purge"
        />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground mb-1 font-sans">
            Saved Reports
          </h1>
          <p className="text-muted-foreground text-xs font-sans">
            View your generated analytical blueprints, data profiles, and ML models.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-xs font-mono text-muted-foreground animate-pulse">ESTABLISHING REPORT STREAM...</div>
        ) : reports.length === 0 ? (
          <div className="p-12 border border-dashed border-border rounded-[20px] text-center bg-card">
            <FileText size={32} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-sans font-medium text-foreground mb-1">No reports created yet</p>
            <p className="text-xs text-muted-foreground font-sans">Navigate to datasets and generate a report or model blueprint.</p>
          </div>
        ) : (
          reports.map((report) => (
            <div 
              key={report.id} 
              onClick={() => navigate(`/reports/${report.id}`)} 
              className="p-5 bg-card rounded-[15px] border border-border hover:border-foreground/40 transition-all flex justify-between items-center cursor-pointer group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="p-2.5 bg-background border border-border text-foreground rounded-full group-hover:bg-foreground group-hover:text-background transition-colors">
                  {report.report_type === 'ml' ? <BrainCircuit size={16} /> : <FileText size={16} />}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold tracking-tight text-foreground font-sans truncate">
                    {report.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-sans truncate">Source: {report.dataset}</p>
                </div>
              </div>
              <div className="flex gap-4 items-center shrink-0">
                <span className="text-[10px] font-sans text-muted-foreground hidden sm:inline">{report.generated}</span>
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-sans font-semibold border ${
                  report.report_type === 'ml' 
                    ? 'bg-[#0099ff]/10 text-[#0099ff] border-[#0099ff]/20' 
                    : 'bg-background text-foreground border-border'
                }`}>
                  {report.report_type === 'ml' ? 'ML Model' : 'Analytics'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      <PromptModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteSingle}
        title="Confirm Report Deletion"
        message="Are you sure you want to delete this report? This action is permanent and cannot be undone."
        type="destructive"
        confirmText="Execute Purge"
      />
    </div>
  );
}
