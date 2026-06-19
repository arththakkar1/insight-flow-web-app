import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { UploadCloud, FileSpreadsheet, Database, ChevronRight, CheckCircle2, Download, Trash2, PieChart } from 'lucide-react';

export default function Datasets() {
  const { datasetId } = useParams();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [datasetDetails, setDatasetDetails] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/api/datasets/')
      .then(res => res.json())
      .then(data => {
        setDatasets(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch datasets", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (datasetId) {
      // Fetch details
      fetch(`http://localhost:8000/api/datasets/${datasetId}/`)
        .then(res => res.json())
        .then(data => setDatasetDetails(data));

      // Fetch recommendations
      fetch(`http://localhost:8000/api/datasets/${datasetId}/cleaning/`)
        .then(res => res.json())
        .then(data => {
          if (data.recommendations) {
            setRecommendations(data.recommendations);
          }
        });
    }
  }, [datasetId]);

  const handleApplyRecommendation = (recId) => {
    fetch(`http://localhost:8000/api/datasets/${datasetId}/cleaning/apply/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ recommendation_id: recId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Remove the applied recommendation from UI
          setRecommendations(prev => prev.filter(r => r.recommendation_id !== recId));
          // Refresh details to get new row/missing values counts
          fetch(`http://localhost:8000/api/datasets/${datasetId}/`)
            .then(res => res.json())
            .then(data => setDatasetDetails(data));
        }
      });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    fetch('http://localhost:8000/api/datasets/', {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      // Refresh the dataset list
      fetch('http://localhost:8000/api/datasets/')
        .then(res => res.json())
        .then(data => setDatasets(data));
    })
    .catch(err => console.error("Upload error", err));
  };

  const handleDeleteSingle = () => {
    if (!confirm("Are you sure you want to delete this dataset?")) return;
    fetch(`http://localhost:8000/api/datasets/${datasetId}/`, { method: 'DELETE' })
      .then(() => navigate('/datasets'));
  };

  const handleDeleteBulk = (deleteAll = false) => {
    if (!confirm(deleteAll ? "Are you sure you want to delete ALL datasets?" : `Delete ${selectedIds.length} selected datasets?`)) return;
    fetch('http://localhost:8000/api/datasets/', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delete_all: deleteAll, ids: selectedIds })
    }).then(() => {
      setSelectedIds([]);
      fetch('http://localhost:8000/api/datasets/')
        .then(res => res.json())
        .then(data => setDatasets(data));
    });
  };

  const handleGenerateReport = () => {
    fetch(`http://localhost:8000/api/datasets/${datasetId}/generate-report/`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.report_id) {
          navigate(`/reports/${data.report_id}`);
        }
      })
      .catch(err => console.error("Report generation error", err));
  };

  if (datasetId) {
    if (!datasetDetails) return <div className="p-8">Loading dataset...</div>;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <Link to="/datasets" className="hover:text-foreground transition-colors">Datasets</Link>
          <ChevronRight size={16} />
          <span className="text-foreground">{datasetDetails.name}</span>
        </div>

        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-bold tracking-tight">{datasetDetails.name}</h2>
          <div className="flex gap-2">
            <button 
              onClick={handleDeleteSingle}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-sm font-medium transition shadow-sm"
            >
              <Trash2 size={16} />
              Delete
            </button>
            <a 
              href={`http://localhost:8000/api/datasets/${datasetId}/export/`}
              download
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl text-sm font-medium transition shadow-sm"
            >
              <Download size={16} />
              Export CSV
            </a>
            <button 
              onClick={handleGenerateReport}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-xl text-sm font-medium transition shadow-sm"
            >
              <PieChart size={16} />
              Generate Report
            </button>
          </div>
        </div>
        
        <div className="bg-background border border-border rounded-3xl p-8 shadow-sm">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="p-6 bg-muted/30 rounded-2xl border border-border">
              <div className="text-sm font-medium text-muted-foreground mb-1">Total Rows</div>
              <div className="text-3xl font-bold">{datasetDetails.rows_count?.toLocaleString()}</div>
            </div>
            <div className="p-6 bg-muted/30 rounded-2xl border border-border">
              <div className="text-sm font-medium text-muted-foreground mb-1">Missing Values</div>
              <div className="text-3xl font-bold">{datasetDetails.missing_values?.toLocaleString()}</div>
            </div>
            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20">
              <div className="text-sm font-medium text-primary/80 mb-1">Status</div>
              <div className="text-xl font-bold text-primary flex items-center gap-2">
                <CheckCircle2 size={20} />
                {datasetDetails.status}
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-4 tracking-tight">AI Cleaning Recommendations</h3>
          {recommendations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No cleaning recommendations found. Your data looks good!</p>
          ) : (
            <ul className="space-y-3">
              {recommendations.map(rec => (
                <li key={rec.recommendation_id} className="flex justify-between items-center p-4 border border-border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-sm text-muted-foreground">
                    {rec.recommendation} <span className="font-semibold">({rec.issue})</span>
                  </span>
                  <button
                    onClick={() => handleApplyRecommendation(rec.recommendation_id)}
                    className="px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg font-medium text-sm transition-colors"
                  >
                    Apply
                  </button>
                </li>
              ))}
            </ul>
          )}
          
          {datasetDetails.preview_headers && datasetDetails.preview_headers.length > 0 && (
            <div className="mt-10">
              <h3 className="text-lg font-semibold mb-4 tracking-tight">Data Preview</h3>
              <div className="overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
                    <tr>
                      {datasetDetails.preview_headers.map((header, i) => (
                        <th key={i} className="px-4 py-3">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {datasetDetails.preview_rows?.map((row, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors">
                        {datasetDetails.preview_headers.map((header, j) => (
                          <td key={j} className="px-4 py-3 max-w-xs truncate" title={String(row[header])}>{row[header]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Datasets</h1>
          <p className="text-muted-foreground text-sm">Manage your connected data sources.</p>
        </div>
        <div className="flex gap-3">
          {datasets.length > 0 && (
            <>
              {selectedIds.length > 0 && (
                <button onClick={() => handleDeleteBulk(false)} className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-500 rounded-xl text-sm font-medium hover:bg-red-500 hover:text-white transition shadow-sm">
                  <Trash2 size={18} />
                  Delete Selected ({selectedIds.length})
                </button>
              )}
              <button onClick={() => handleDeleteBulk(true)} className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-500 rounded-xl text-sm font-medium hover:bg-red-500 hover:text-white transition shadow-sm">
                <Trash2 size={18} />
                Delete All
              </button>
            </>
          )}
          <button onClick={handleUploadClick} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition shadow-sm">
            <UploadCloud size={18} />
            Upload Data
          </button>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept=".csv,.xlsx,.xls" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading datasets...</div>
        ) : datasets.map((dataset) => (
          <div key={dataset.id} onClick={() => navigate(`/datasets/${dataset.id}`)} className="bg-background p-6 rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg transition-all h-full flex flex-col relative overflow-hidden cursor-pointer group">
            <div className="absolute top-4 right-4 z-20" onClick={(e) => e.stopPropagation()}>
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                checked={selectedIds.includes(dataset.id)}
                onChange={(e) => {
                  if (e.target.checked) setSelectedIds([...selectedIds, dataset.id]);
                  else setSelectedIds(selectedIds.filter(id => id !== dataset.id));
                }}
              />
            </div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                {dataset.name.includes('DB') ? <Database size={20} /> : <FileSpreadsheet size={20} />}
              </div>
              <span className="px-2.5 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground mr-8">
                {dataset.status}
              </span>
            </div>
            <h3 className="font-semibold text-base tracking-tight mb-1 relative z-10 group-hover:text-primary transition-colors">{dataset.name}</h3>
            <p className="text-sm text-muted-foreground mt-auto relative z-10">{dataset.rows_count?.toLocaleString()} rows</p>
          </div>
        ))}
      </div>
    </div>
  );
}
