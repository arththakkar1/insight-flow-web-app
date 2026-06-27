import { apiFetch } from "../utils/api";
import { useState, useEffect, useRef } from "react";
import {
  useParams,
  Link,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import {
  UploadCloud,
  FileSpreadsheet,
  Database,
  ChevronRight,
  CheckCircle2,
  Download,
  Trash2,
  PieChart,
  Loader2,
} from "lucide-react";

export default function Datasets() {
  const { datasetId } = useParams();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [datasetDetails, setDatasetDetails] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [generatingReport, setGeneratingReport] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { openDeleteModal } = useOutletContext() || {};

  useEffect(() => {
    apiFetch("http://localhost:8000/api/datasets/")
      .then((res) => res.json())
      .then((data) => {
        setDatasets(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch datasets", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (datasetId) {
      apiFetch(`http://localhost:8000/api/datasets/${datasetId}/`)
        .then((res) => res.json())
        .then((data) => setDatasetDetails(data));

      apiFetch(`http://localhost:8000/api/datasets/${datasetId}/cleaning/`)
        .then((res) => res.json())
        .then((data) => {
          if (data.recommendations) {
            setRecommendations(data.recommendations);
          }
        });
    }
  }, [datasetId]);

  const handleApplyRecommendation = (recId) => {
    apiFetch(
      `http://localhost:8000/api/datasets/${datasetId}/cleaning/apply/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recommendation_id: recId }),
      },
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRecommendations((prev) =>
            prev.filter((r) => r.recommendation_id !== recId),
          );
          apiFetch(`http://localhost:8000/api/datasets/${datasetId}/`)
            .then((res) => res.json())
            .then((data) => setDatasetDetails(data));
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
    formData.append("file", file);

    apiFetch("http://localhost:8000/api/datasets/", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        apiFetch("http://localhost:8000/api/datasets/")
          .then((res) => res.json())
          .then((data) => setDatasets(data));
      })
      .catch((err) => console.error("Upload error", err));
  };

  const handleDeleteSingle = () => {
    if (!confirm("Are you sure you want to delete this dataset?")) return;
    apiFetch(`http://localhost:8000/api/datasets/${datasetId}/`, {
      method: "DELETE",
    }).then(() => navigate("/datasets"));
  };

  const handleGenerateReport = () => {
    setGeneratingReport(true);
    apiFetch(
      `http://localhost:8000/api/datasets/${datasetId}/generate-report/`,
      { method: "POST" },
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.report_id) {
          navigate(`/reports/${data.report_id}`);
        } else {
          setGeneratingReport(false);
        }
      })
      .catch((err) => {
        console.error("Report generation error", err);
        setGeneratingReport(false);
      });
  };

  if (datasetId) {
    if (!datasetDetails)
      return (
        <div className="p-8 font-mono text-sm tracking-tight text-muted-foreground">
          INITIALIZING DATASET STREAM...
        </div>
      );

    return (
      <div className="overflow-y-auto flex-1 min-h-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground font-mono font-semibold uppercase tracking-wider">
          <Link to="/datasets" className="hover:text-primary transition-colors">
            Datasets
          </Link>
          <ChevronRight size={14} />
          <span className="text-foreground">{datasetDetails.name}</span>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8 border-b border-border pb-6">
          <div>
            <h2 className="text-[40px] leading-tight font-medium tracking-tight mb-2">
              {datasetDetails.name}
            </h2>
            <div className="flex items-center gap-3 font-mono text-sm text-muted-foreground">
              <span className="bg-muted px-2 py-0.5 rounded border border-border">
                ID: {datasetDetails.id.split("_")[1] || datasetDetails.id}
              </span>
              <span className="flex items-center gap-1.5 text-primary">
                <CheckCircle2 size={16} /> {datasetDetails.status}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDeleteSingle}
              className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border text-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive rounded-lg text-sm font-semibold transition-all shadow-sm"
            >
              <Trash2 size={16} />
              Drop
            </button>
            <a
              href={`http://localhost:8000/api/datasets/${datasetId}/export/`}
              download
              className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border text-foreground hover:bg-muted rounded-lg text-sm font-semibold transition-all shadow-sm"
            >
              <Download size={16} />
              Export
            </a>
            <button
              onClick={handleGenerateReport}
              disabled={generatingReport}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground hover:opacity-90 rounded-lg text-sm font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingReport ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <PieChart size={16} />
                  Generate Blueprint
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[16px] p-8 shadow-sm relative overflow-hidden">
          {/* Subtle background grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none opacity-50 dark:opacity-20" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative z-10">
            <div className="p-6 bg-background rounded-[12px] border border-border shadow-sm flex flex-col group hover:border-primary/50 transition-colors">
              <div className="text-[12px] font-mono font-semibold tracking-wider text-muted-foreground uppercase mb-3">
                Volume
              </div>
              <div className="text-4xl font-medium tracking-tight mt-auto">
                {datasetDetails.rows_count?.toLocaleString()}{" "}
                <span className="text-xl text-muted-foreground ml-1">rows</span>
              </div>
            </div>
            <div className="p-6 bg-background rounded-[12px] border border-border shadow-sm flex flex-col group hover:border-primary/50 transition-colors">
              <div className="text-[12px] font-mono font-semibold tracking-wider text-muted-foreground uppercase mb-3">
                Integrity Issues
              </div>
              <div className="text-4xl font-medium tracking-tight mt-auto">
                {datasetDetails.missing_values?.toLocaleString()}{" "}
                <span className="text-xl text-muted-foreground ml-1">
                  nulls
                </span>
              </div>
            </div>
            <div className="p-6 bg-primary text-primary-foreground rounded-[12px] shadow-sm flex flex-col">
              <div className="text-[12px] font-mono font-semibold tracking-wider text-primary-foreground/70 uppercase mb-3">
                Schema Quality
              </div>
              <div className="text-4xl font-medium tracking-tight mt-auto">
                {datasetDetails.columns_count}{" "}
                <span className="text-xl text-primary-foreground/70 ml-1">
                  cols
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mb-12">
            <h3 className="text-lg font-medium tracking-tight mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              Optimization Protocols
            </h3>
            {recommendations.length === 0 ? (
              <div className="p-6 border border-border border-dashed rounded-[12px] bg-muted/50 flex items-center justify-center">
                <p className="text-sm font-mono text-muted-foreground">
                  SYSTEM: No anomalies detected. Schema is optimal.
                </p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec) => (
                  <li
                    key={rec.recommendation_id}
                    className="flex flex-col justify-between p-5 border border-border rounded-[12px] bg-background shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="mb-4">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-destructive font-bold mb-2">
                        Issue: {rec.issue}
                      </div>
                      <div className="text-sm text-foreground font-medium">
                        {rec.recommendation}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleApplyRecommendation(rec.recommendation_id)
                      }
                      className="self-start px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-xs transition-transform active:scale-95"
                    >
                      Execute Fix
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {datasetDetails.preview_headers &&
            datasetDetails.preview_headers.length > 0 && (
              <div className="relative z-10">
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-lg font-medium tracking-tight">
                    Data Fragment
                  </h3>
                  <span className="text-[11px] font-mono text-muted-foreground uppercase">
                    Top 5 Records
                  </span>
                </div>
                <div className="overflow-x-auto border border-border rounded-[12px] shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-foreground font-mono text-[12px] border-b border-border">
                      <tr>
                        {datasetDetails.preview_headers.map((header, i) => (
                          <th key={i} className="px-5 py-3.5 whitespace-nowrap">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-background">
                      {datasetDetails.preview_rows?.map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors"
                        >
                          {datasetDetails.preview_headers.map((header, j) => (
                            <td
                              key={j}
                              className="px-5 py-3 max-w-[200px] truncate font-mono text-[13px] text-muted-foreground"
                              title={String(row[header])}
                            >
                              {row[header]}
                            </td>
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
    <div className="overflow-y-auto flex-1 min-h-0 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-border pb-8 gap-4">
        <div>
          <h1 className="text-[48px] leading-[1.1] font-medium tracking-tight mb-2">
            Data Matrix
          </h1>
          <p className="text-muted-foreground font-mono text-sm tracking-wide">
            Manage analytical schemas and connected sources.
          </p>
        </div>
        <div className="flex gap-3">
          {datasets.length > 0 && (
            <button
              onClick={openDeleteModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border text-destructive hover:bg-destructive/10 rounded-lg text-sm font-semibold transition-all shadow-sm"
            >
              <Trash2 size={16} />
              Manage Data
            </button>
          )}
          <button
            onClick={handleUploadClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
          >
            <UploadCloud size={16} strokeWidth={2.5} />
            Initialize Upload
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center items-center">
            <div className="font-mono text-sm tracking-widest text-muted-foreground animate-pulse">
              ESTABLISHING CONNECTION...
            </div>
          </div>
        ) : datasets.length === 0 ? (
          <div className="col-span-full py-20 border border-dashed border-border rounded-[16px] flex flex-col items-center justify-center bg-card text-center px-4">
            <Database size={48} className="text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium tracking-tight mb-2">
              No Datasets Found
            </h3>
            <p className="text-sm text-muted-foreground font-mono mb-6 max-w-sm">
              System awaits data ingestion. Initialize an upload to begin
              profiling protocols.
            </p>
            <button
              onClick={handleUploadClick}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
            >
              Upload First Dataset
            </button>
          </div>
        ) : (
          datasets.map((dataset) => (
            <div
              key={dataset.id}
              onClick={() => navigate(`/datasets/${dataset.id}`)}
              className="bg-card p-6 rounded-[16px] border border-border hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.04)] transition-all h-full flex flex-col relative overflow-hidden cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div className="p-3 rounded-[8px] bg-background border border-border text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-sm">
                  {dataset.name.includes("DB") ? (
                    <Database size={20} />
                  ) : (
                    <FileSpreadsheet size={20} />
                  )}
                </div>
                <span className="px-2.5 py-1 bg-muted rounded-[4px] font-mono text-[10px] uppercase font-bold tracking-wider text-muted-foreground mr-6 border border-border group-hover:border-primary/30 transition-colors">
                  {dataset.status}
                </span>
              </div>
              <h3 className="font-medium text-xl tracking-tight mb-2 relative z-10 group-hover:text-primary transition-colors pr-4">
                {dataset.name}
              </h3>
              <div className="flex items-center gap-4 mt-auto relative z-10 pt-4 border-t border-border/50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-0.5">
                    Rows
                  </span>
                  <span className="text-sm font-semibold">
                    {dataset.rows_count?.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-0.5">
                    Cols
                  </span>
                  <span className="text-sm font-semibold">
                    {dataset.columns_count?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
