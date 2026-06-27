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
  BrainCircuit,
} from "lucide-react";
import { CustomSelect } from "../components/ui/Select";
import { cn } from "../lib/utils";
import { PromptModal } from "../components/ui/PromptModal";

export default function Datasets() {
  const { datasetId } = useParams();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [datasetDetails, setDatasetDetails] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { openDeleteModal } = useOutletContext() || {};

  // ML configuration states
  const [columns, setColumns] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState('');
  const [selectedModel, setSelectedModel] = useState('random_forest');
  const [taskType, setTaskType] = useState('auto');
  const [trainingModel, setTrainingModel] = useState(false);
  const [mlError, setMlError] = useState('');

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

      // Load column profiles for selecting features/target
      apiFetch(`http://localhost:8000/api/datasets/${datasetId}/profile/`, { method: 'POST' })
        .then((res) => res.json())
        .then((data) => {
          if (data.columns) {
            setColumns(data.columns);
            
            // Pre-select targets and features automatically
            const colNames = data.columns.map(c => c.name);
            if (colNames.length > 0) {
              const targetCol = colNames[colNames.length - 1];
              setSelectedTarget(targetCol);
              
              const defaultFeatures = colNames.filter(name => name !== targetCol);
              setSelectedFeatures(defaultFeatures);
            }
          }
        })
        .catch(err => console.error("Failed to load column profiles", err));
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
    apiFetch(`http://localhost:8000/api/datasets/${datasetId}/`, {
      method: "DELETE",
    }).then(() => {
      setShowDeleteConfirm(false);
      navigate("/datasets");
    });
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

  const handleTrainMLModel = (e) => {
    e.preventDefault();
    if (!selectedTarget) {
      setMlError("Please select a predicted target column.");
      return;
    }
    if (selectedFeatures.length === 0) {
      setMlError("Please select at least one feature column.");
      return;
    }
    if (selectedFeatures.includes(selectedTarget)) {
      setMlError("Target column cannot be included in the feature columns.");
      return;
    }
    
    setTrainingModel(true);
    setMlError('');
    
    apiFetch(`http://localhost:8000/api/datasets/${datasetId}/generate-ml-report/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        features: selectedFeatures,
        target: selectedTarget,
        model_type: selectedModel,
        task_type: taskType === 'auto' ? null : taskType
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || "Model training failed"); });
        }
        return res.json();
      })
      .then(data => {
        if (data.report_id) {
          navigate(`/reports/${data.report_id}`);
        } else {
          setTrainingModel(false);
        }
      })
      .catch(err => {
        console.error("ML Report generation error", err);
        setMlError(err.message || "Failed to generate predictive blueprint.");
        setTrainingModel(false);
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
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-sans font-bold uppercase tracking-wider">
          <Link to="/datasets" className="hover:text-foreground transition-colors">
            Datasets
          </Link>
          <ChevronRight size={12} />
          <span className="text-foreground">{datasetDetails.name}</span>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8 border-b border-border pb-6">
          <div>
            <h2 className="text-3xl font-medium tracking-tight text-foreground mb-2 font-sans">
              {datasetDetails.name}
            </h2>
            <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
              <span className="bg-card px-2 py-0.5 rounded border border-border">
                ID: {datasetDetails.id.split("_")[1] || datasetDetails.id}
              </span>
              <span className="flex items-center gap-1.5 text-[#22c55e]">
                <CheckCircle2 size={14} /> {datasetDetails.status}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-accent border border-border text-[#ff5577] hover:border-[#ff5577]/20 rounded-full text-xs font-semibold transition-all shadow-sm"
            >
              <Trash2 size={14} />
              Drop
            </button>
            <a
              href={`http://localhost:8000/api/datasets/${datasetId}/export/`}
              download
              className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-accent border border-border text-foreground rounded-full text-xs font-semibold transition-all shadow-sm"
            >
              <Download size={14} />
              Export
            </a>
            <button
              onClick={handleGenerateReport}
              disabled={generatingReport}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-full text-xs font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingReport ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <PieChart size={14} />
                  Generate Blueprint
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[20px] p-8 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative z-10">
            <div className="p-6 bg-background rounded-[15px] border border-border flex flex-col group hover:border-muted-foreground transition-colors">
              <div className="text-[11px] font-sans font-bold tracking-wider text-muted-foreground uppercase mb-3">
                Volume
              </div>
              <div className="text-3xl font-medium tracking-tight mt-auto text-foreground">
                {datasetDetails.rows_count?.toLocaleString()}{" "}
                <span className="text-base text-muted-foreground ml-1">rows</span>
              </div>
            </div>
            <div className="p-6 bg-background rounded-[15px] border border-border flex flex-col group hover:border-muted-foreground transition-colors">
              <div className="text-[11px] font-sans font-bold tracking-wider text-muted-foreground uppercase mb-3">
                Integrity Issues
              </div>
              <div className="text-3xl font-medium tracking-tight mt-auto text-foreground">
                {datasetDetails.missing_values?.toLocaleString()}{" "}
                <span className="text-base text-muted-foreground ml-1">
                  nulls
                </span>
              </div>
            </div>
            <div className="p-6 bg-primary text-primary-foreground rounded-[15px] shadow-sm flex flex-col">
              <div className="text-[11px] font-sans font-bold tracking-wider text-primary-foreground/70 uppercase mb-3">
                Schema Quality
              </div>
              <div className="text-3xl font-medium tracking-tight mt-auto">
                {datasetDetails.columns_count}{" "}
                <span className="text-base text-primary-foreground/70 ml-1">
                  cols
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mb-12 border-t border-border pt-8">
            <h3 className="text-base font-bold tracking-tight mb-4 flex items-center gap-2 text-foreground font-sans">
              <span className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse"></span>
              Optimization Protocols
            </h3>
            {recommendations.length === 0 ? (
              <div className="p-6 border border-border border-dashed rounded-[15px] bg-background flex items-center justify-center">
                <p className="text-xs font-mono text-muted-foreground">
                  SYSTEM: No anomalies detected. Schema is optimal.
                </p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec) => (
                  <li
                    key={rec.recommendation_id}
                    className="flex flex-col justify-between p-5 border border-border rounded-[15px] bg-background shadow-sm hover:border-muted-foreground transition-all group"
                  >
                    <div className="mb-4">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#ff5577] font-bold mb-2">
                        Issue: {rec.issue}
                      </div>
                      <div className="text-sm text-foreground font-medium font-sans">
                        {rec.recommendation}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleApplyRecommendation(rec.recommendation_id)
                      }
                      className="self-start px-4 py-1.5 bg-primary text-primary-foreground hover:opacity-90 rounded-full font-semibold text-xs transition-transform active:scale-95"
                    >
                      Execute Fix
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Predictive ML Blueprint Builder */}
          <div className="relative z-10 mb-12 border-t border-border/60 pt-10">
            <h3 className="text-base font-bold tracking-tight mb-2 flex items-center gap-2 text-foreground font-sans">
              <span className="w-2 h-2 bg-[#0099ff] rounded-full animate-pulse"></span>
              Predictive ML Blueprint Builder
            </h3>
            <p className="text-xs text-muted-foreground font-sans mb-6">
              Configure parameters to train a machine learning model on your dataset and generate diagnostics reports.
            </p>
            
            <form onSubmit={handleTrainMLModel} className="space-y-6 max-w-4xl">
              {mlError && (
                <div className="p-3 bg-[#ff5577]/10 border border-[#ff5577]/20 text-[#ff5577] rounded-md text-xs font-semibold font-sans">
                  {mlError}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Feature Columns Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-muted-foreground font-sans">
                    Feature Columns (X)
                  </label>
                  <div className="border border-border rounded-md p-3.5 bg-background max-h-48 overflow-y-auto space-y-2">
                    {columns.length === 0 ? (
                      <span className="text-xs text-muted-foreground font-mono font-medium uppercase">No columns profile loaded</span>
                    ) : (
                      columns.map(col => (
                        <label 
                          key={col.name} 
                          className={cn(
                            "flex items-center gap-2.5 cursor-pointer text-xs font-medium text-foreground select-none group",
                            selectedTarget === col.name && "opacity-40 cursor-not-allowed"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={selectedFeatures.includes(col.name)}
                            disabled={selectedTarget === col.name}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFeatures(prev => [...prev, col.name]);
                              } else {
                                setSelectedFeatures(prev => prev.filter(name => name !== col.name));
                              }
                            }}
                            className="hidden"
                          />
                          <div className={cn(
                            "relative flex items-center justify-center w-4 h-4 border rounded-[5px] transition-all shrink-0",
                            selectedFeatures.includes(col.name) 
                              ? 'bg-[#0099ff] border-[#0099ff] text-white' 
                              : 'bg-background border-border text-transparent group-hover:border-foreground/50'
                          )}>
                            <svg className="w-2.5 h-2.5 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className={selectedTarget === col.name ? 'text-muted-foreground/40 line-through font-sans' : 'font-sans'}>
                            {col.name} <span className="text-muted-foreground text-[10px] font-mono">({col.type})</span>
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {/* Target Column, Model & Task Types */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-muted-foreground font-sans">
                      Predicted Target Column (y)
                    </label>
                    <CustomSelect
                      value={selectedTarget}
                      onChange={(val) => {
                        setSelectedTarget(val);
                        setSelectedFeatures(prev => prev.filter(name => name !== val));
                      }}
                      placeholder="Select target column..."
                      options={columns.map(col => ({ value: col.name, label: `${col.name} (${col.type})` }))}
                      triggerClassName="py-2 text-xs rounded-full px-4"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-muted-foreground font-sans">
                        Task Type
                      </label>
                      <CustomSelect
                        value={taskType}
                        onChange={(val) => setTaskType(val)}
                        options={[
                          { value: "auto", label: "Auto-detect" },
                          { value: "classification", label: "Classification" },
                          { value: "regression", label: "Regression" }
                        ]}
                        triggerClassName="py-2 text-xs rounded-full px-4"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-muted-foreground font-sans">
                        Model Type
                      </label>
                      <CustomSelect
                        value={selectedModel}
                        onChange={(val) => setSelectedModel(val)}
                        options={[
                          { value: "random_forest", label: "Random Forest" },
                          { value: "decision_tree", label: "Decision Tree" },
                          ...(taskType === 'regression' || (taskType === 'auto' && columns.find(c => c.name === selectedTarget)?.type !== 'object') ? [
                            { value: "linear_regression", label: "Linear Regression" }
                          ] : [
                            { value: "logistic_regression", label: "Logistic Regression" }
                          ])
                        ]}
                        triggerClassName="py-2 text-xs rounded-full px-4"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={trainingModel}
                    className="w-full py-2.5 bg-primary text-primary-foreground rounded-full font-semibold text-xs hover:opacity-90 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {trainingModel ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Training Model...
                      </>
                    ) : (
                      <>
                        <BrainCircuit size={12} />
                        Train & Generate ML Blueprint
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {datasetDetails.preview_headers &&
            datasetDetails.preview_headers.length > 0 && (
              <div className="relative z-10 border-t border-border pt-10">
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-base font-bold text-foreground font-sans">
                    Data Fragment
                  </h3>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                    Top 5 Records
                  </span>
                </div>
                <div className="overflow-x-auto border border-border rounded-[15px] shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-background text-foreground font-mono text-[11px] border-b border-border">
                      <tr>
                        {datasetDetails.preview_headers.map((header, i) => (
                          <th key={i} className="px-5 py-3 whitespace-nowrap">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-card">
                      {datasetDetails.preview_rows?.map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-border/50 last:border-0 hover:bg-accent transition-colors"
                        >
                          {datasetDetails.preview_headers.map((header, j) => (
                            <td
                              key={j}
                              className="px-5 py-3 max-w-[200px] truncate font-mono text-[12px] text-muted-foreground"
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
        <PromptModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteSingle}
          title="Confirm Dataset Deletion"
          message="Are you sure you want to delete this dataset? This action is permanent and cannot be undone."
          type="destructive"
          confirmText="Execute Drop"
        />
      </div>
    );
  }

  return (
    <div className="overflow-y-auto flex-1 min-h-0 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground mb-1 font-sans">
            Data Matrix
          </h1>
          <p className="text-muted-foreground text-xs font-sans">
            Manage analytical schemas and connected sources.
          </p>
        </div>
        <div className="flex gap-3">
          {datasets.length > 0 && (
            <button
              onClick={openDeleteModal}
              className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-accent border border-border text-[#ff5577] hover:border-[#ff5577]/20 rounded-full text-xs font-semibold transition-all shadow-sm"
            >
              <Trash2 size={14} />
              Manage Data
            </button>
          )}
          <button
            onClick={handleUploadClick}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-full text-xs font-semibold transition-all shadow-sm"
          >
            <UploadCloud size={14} strokeWidth={2.5} />
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
            <div className="font-mono text-xs tracking-widest text-muted-foreground animate-pulse">
              ESTABLISHING CONNECTION...
            </div>
          </div>
        ) : datasets.length === 0 ? (
          <div className="col-span-full py-20 border border-dashed border-border rounded-[20px] flex flex-col items-center justify-center bg-card text-center px-4">
            <Database size={44} className="text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold tracking-tight text-foreground mb-2 font-sans">
              No Datasets Found
            </h3>
            <p className="text-xs text-muted-foreground font-sans mb-6 max-w-sm">
              System awaits data ingestion. Initialize an upload to begin profiling protocols.
            </p>
            <button
              onClick={handleUploadClick}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-xs font-semibold hover:opacity-90 transition-all shadow-sm"
            >
              Upload First Dataset
            </button>
          </div>
        ) : (
          datasets.map((dataset) => (
            <div
              key={dataset.id}
              onClick={() => navigate(`/datasets/${dataset.id}`)}
              className="bg-card p-6 rounded-[20px] border border-border hover:border-foreground/40 hover:shadow-2xl transition-all h-full flex flex-col relative overflow-hidden cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="p-2.5 rounded-full bg-background border border-border text-foreground group-hover:bg-foreground group-hover:text-background transition-colors shadow-sm">
                  {dataset.name.includes("DB") ? (
                    <Database size={16} />
                  ) : (
                    <FileSpreadsheet size={16} />
                  )}
                </div>
                <span className="px-2 py-0.5 bg-background rounded-md font-mono text-[9px] uppercase font-bold tracking-wider text-muted-foreground border border-border transition-colors">
                  {dataset.status}
                </span>
              </div>
              <h3 className="font-semibold text-lg tracking-tight mb-2 text-foreground relative z-10 group-hover:text-[#0099ff] transition-colors pr-4 font-sans">
                {dataset.name}
              </h3>
              <div className="flex items-center gap-6 mt-auto relative z-10 pt-4 border-t border-border">
                <div className="flex flex-col">
                  <span className="text-[9px] font-sans font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                    Rows
                  </span>
                  <span className="text-sm font-semibold text-foreground font-sans">
                    {dataset.rows_count?.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-sans font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                    Cols
                  </span>
                  <span className="text-sm font-semibold text-foreground font-sans">
                    {dataset.columns_count?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <PromptModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteSingle}
        title="Confirm Dataset Deletion"
        message="Are you sure you want to delete this dataset? This action is permanent and cannot be undone."
        type="destructive"
        confirmText="Execute Drop"
      />
    </div>
  );
}
