import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BrainCircuit, ChevronRight, Loader2, Zap, FlaskConical,
  CheckCircle2, AlertCircle, ArrowLeft, Sparkles, BarChart2
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { CustomSelect } from '../components/ui/Select';
import { cn } from '../lib/utils';

export default function MLBuilder() {
  const { datasetId } = useParams();
  const navigate = useNavigate();

  // Dataset state
  const [dataset, setDataset] = useState(null);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Model config
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState('');
  const [taskType, setTaskType] = useState('auto');
  const [modelType, setModelType] = useState('random_forest');

  // Training state
  const [training, setTraining] = useState(false);
  const [trainError, setTrainError] = useState('');
  const [trainedReportId, setTrainedReportId] = useState(null);

  // Existing model (already trained)
  const [existingMeta, setExistingMeta] = useState(null);

  // Prediction state
  const [predInputs, setPredInputs] = useState({});
  const [predicting, setPredicting] = useState(false);
  const [predResult, setPredResult] = useState(null);
  const [predError, setPredError] = useState('');

  // ── Fetch dataset info + profile ──────────────────────────────────────────
  useEffect(() => {
    if (!datasetId) return;

    apiFetch(`http://localhost:8000/api/datasets/${datasetId}/`)
      .then(r => r.json())
      .then(data => {
        setDataset(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    apiFetch(`http://localhost:8000/api/datasets/${datasetId}/profile/`, { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (data.columns) {
          setColumns(data.columns);
          const colNames = data.columns.map(c => c.name);
          if (colNames.length > 0) {
            const targetCol = colNames[colNames.length - 1];
            setSelectedTarget(targetCol);
            setSelectedFeatures(colNames.filter(n => n !== targetCol));
          }
        }
      })
      .catch(() => {});

    // Check if a model was previously trained
    apiFetch(`http://localhost:8000/api/datasets/${datasetId}/predict/`)
      .then(r => r.json())
      .then(data => {
        if (data.model_exists) {
          setExistingMeta(data.meta);
          const initInputs = {};
          data.meta.feature_columns.forEach(col => { initInputs[col] = ''; });
          setPredInputs(initInputs);
        }
      })
      .catch(() => {});
  }, [datasetId]);

  // ── Train model ───────────────────────────────────────────────────────────
  const handleTrain = async (e) => {
    e.preventDefault();
    if (!selectedTarget) { setTrainError('Please select a target column.'); return; }
    if (selectedFeatures.length === 0) { setTrainError('Please select at least one feature column.'); return; }

    setTraining(true);
    setTrainError('');
    setPredResult(null);
    setExistingMeta(null);

    try {
      const res = await apiFetch(`http://localhost:8000/api/datasets/${datasetId}/generate-ml-report/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features: selectedFeatures,
          target: selectedTarget,
          model_type: modelType,
          task_type: taskType === 'auto' ? null : taskType,
        }),
      });
      const data = await res.json();
      if (data.report_id) {
        setTrainedReportId(data.report_id);
        // Reload model meta
        const metaRes = await apiFetch(`http://localhost:8000/api/datasets/${datasetId}/predict/`);
        const metaData = await metaRes.json();
        if (metaData.model_exists) {
          setExistingMeta(metaData.meta);
          const initInputs = {};
          metaData.meta.feature_columns.forEach(col => { initInputs[col] = ''; });
          setPredInputs(initInputs);
        }
      } else {
        setTrainError(data.error || 'Training failed. Please try again.');
      }
    } catch {
      setTrainError('Network error. Please check the backend is running.');
    } finally {
      setTraining(false);
    }
  };

  // ── Run prediction ────────────────────────────────────────────────────────
  const handlePredict = async (e) => {
    e.preventDefault();
    setPredicting(true);
    setPredError('');
    setPredResult(null);

    try {
      const res = await apiFetch(`http://localhost:8000/api/datasets/${datasetId}/predict/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: predInputs }),
      });
      const data = await res.json();
      if (data.prediction !== undefined) {
        setPredResult(data);
      } else {
        setPredError(data.error || 'Prediction failed.');
      }
    } catch {
      setPredError('Network error during prediction.');
    } finally {
      setPredicting(false);
    }
  };

  // ── Active model metadata (just trained or previously trained) ────────────
  const activeMeta = existingMeta;
  const isPlaygroundReady = !!activeMeta;

  // ── Helper: column type label ─────────────────────────────────────────────
  const colTypeOf = (name) => columns.find(c => c.name === name)?.type ?? 'unknown';
  const isNumeric = (name) => {
    const t = colTypeOf(name);
    return t === 'int64' || t === 'float64' || t === 'integer' || t === 'float' || t === 'number';
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
        <span className="font-mono text-xs tracking-widest text-muted-foreground animate-pulse">
          INITIALIZING ML ENVIRONMENT...
        </span>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-3">
          <AlertCircle size={36} className="text-[#ff5577] mx-auto" />
          <p className="text-sm font-semibold text-foreground font-sans">Dataset not found.</p>
          <Link to="/datasets" className="text-xs text-[#0099ff] hover:underline font-sans">← Back to Datasets</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full pb-16 animate-in fade-in duration-200">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-border pb-6 mb-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono mb-4">
          <Link to="/datasets" className="hover:text-foreground transition-colors">Datasets</Link>
          <ChevronRight size={12} />
          <Link to={`/datasets/${datasetId}`} className="hover:text-foreground transition-colors truncate max-w-[140px]">
            {dataset.name}
          </Link>
          <ChevronRight size={12} />
          <span className="text-foreground font-semibold">ML Builder</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-[#002a45] border border-[#0099ff]/40 rounded-xl">
                <BrainCircuit size={20} className="text-[#0099ff]" />
              </div>
              <h1 className="text-3xl font-medium tracking-tight text-foreground font-sans">
                ML Model Builder
              </h1>
            </div>
            <p className="text-xs text-muted-foreground font-sans ml-[52px]">
              Train a machine learning model on <span className="text-foreground font-semibold">{dataset.name}</span> and run live predictions.
            </p>
          </div>

          <div className="flex gap-2.5 ml-[52px] md:ml-0">
            <Link
              to={`/datasets/${datasetId}`}
              className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground hover:bg-accent rounded-full text-xs font-semibold transition-all shadow-sm"
            >
              <ArrowLeft size={13} />
              Back to Dataset
            </Link>
            {trainedReportId && (
              <button
                onClick={() => navigate(`/reports/${trainedReportId}`)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-full text-xs font-semibold transition-all shadow-sm"
              >
                <BarChart2 size={13} />
                View Report
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Two-panel layout ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ── Left: Model Configuration ──────────────────────────────────── */}
        <div className="space-y-5">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-1.5 bg-card border border-border rounded-lg">
              <Zap size={14} className="text-muted-foreground" />
            </div>
            <h2 className="text-sm font-bold tracking-tight text-foreground font-sans">Model Configuration</h2>
          </div>

          <form onSubmit={handleTrain} className="space-y-5">
            {/* Feature Columns */}
            <div className="bg-card border border-border rounded-[20px] p-5 shadow-sm">
              <label className="block text-xs font-bold text-muted-foreground font-sans uppercase tracking-wider mb-3">
                Feature Columns (X)
              </label>
              <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                {columns.length === 0 ? (
                  <span className="text-xs text-muted-foreground font-mono">No columns loaded</span>
                ) : (
                  columns.map(col => (
                    <label
                      key={col.name}
                      className={cn(
                        "flex items-center gap-2.5 cursor-pointer text-xs font-medium text-foreground select-none group py-1 px-2 rounded-lg hover:bg-accent/60 transition-colors",
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
                            setSelectedFeatures(prev => prev.filter(n => n !== col.name));
                          }
                        }}
                        className="hidden"
                      />
                      <div className={cn(
                        "flex items-center justify-center w-4 h-4 border rounded-[5px] transition-all shrink-0",
                        selectedFeatures.includes(col.name)
                          ? 'bg-[#0099ff] border-[#0099ff] text-white'
                          : 'bg-background border-border text-transparent group-hover:border-foreground/50'
                      )}>
                        <svg className="w-2.5 h-2.5 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className={selectedTarget === col.name ? 'line-through font-sans' : 'font-sans'}>
                        {col.name}
                      </span>
                      <span className="ml-auto font-mono text-[10px] text-muted-foreground shrink-0">{col.type}</span>
                    </label>
                  ))
                )}
              </div>
              {columns.length > 0 && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setSelectedFeatures(columns.map(c => c.name).filter(n => n !== selectedTarget))}
                    className="text-[10px] font-semibold text-[#0099ff] hover:underline font-sans"
                  >
                    Select All
                  </button>
                  <span className="text-muted-foreground text-[10px]">·</span>
                  <button
                    type="button"
                    onClick={() => setSelectedFeatures([])}
                    className="text-[10px] font-semibold text-muted-foreground hover:text-foreground font-sans"
                  >
                    Clear
                  </button>
                  <span className="ml-auto text-[10px] text-muted-foreground font-mono">
                    {selectedFeatures.length} / {columns.length} selected
                  </span>
                </div>
              )}
            </div>

            {/* Target + Task + Model */}
            <div className="bg-card border border-border rounded-[20px] p-5 shadow-sm space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground font-sans uppercase tracking-wider">
                  Predicted Target Column (y)
                </label>
                <CustomSelect
                  value={selectedTarget}
                  onChange={(val) => {
                    setSelectedTarget(val);
                    setSelectedFeatures(prev => prev.filter(n => n !== val));
                  }}
                  placeholder="Select target column..."
                  options={columns.map(col => ({ value: col.name, label: `${col.name} (${col.type})` }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground font-sans uppercase tracking-wider">
                    Task Type
                  </label>
                  <CustomSelect
                    value={taskType}
                    onChange={setTaskType}
                    options={[
                      { value: 'auto', label: 'Auto-detect' },
                      { value: 'classification', label: 'Classification' },
                      { value: 'regression', label: 'Regression' },
                    ]}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground font-sans uppercase tracking-wider">
                    Model Type
                  </label>
                  <CustomSelect
                    value={modelType}
                    onChange={setModelType}
                    options={[
                      { value: 'random_forest', label: 'Random Forest' },
                      { value: 'decision_tree', label: 'Decision Tree' },
                      ...(taskType === 'regression'
                        ? [{ value: 'linear_regression', label: 'Linear Regression' }]
                        : [{ value: 'logistic_regression', label: 'Logistic Regression' }]
                      ),
                    ]}
                  />
                </div>
              </div>
            </div>

            {trainError && (
              <div className="flex items-start gap-2.5 p-3.5 bg-[#3d0d18] border border-[#ff5577]/40 rounded-xl">
                <AlertCircle size={14} className="text-[#ff5577] shrink-0 mt-0.5" />
                <p className="text-xs text-[#ff5577] font-sans">{trainError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={training}
              className="w-full py-3 bg-primary text-primary-foreground rounded-full font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {training ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Training Model...
                </>
              ) : (
                <>
                  <BrainCircuit size={14} />
                  Train & Generate Blueprint
                </>
              )}
            </button>

            {trainedReportId && (
              <div className="flex items-center gap-2 p-3.5 bg-[#0a2e18] border border-[#22c55e]/40 rounded-xl">
                <CheckCircle2 size={14} className="text-[#22c55e] shrink-0" />
                <p className="text-xs text-[#22c55e] font-sans font-semibold">
                  Model trained successfully! Prediction Playground is now unlocked.
                </p>
              </div>
            )}
          </form>
        </div>

        {/* ── Right: Prediction Playground ─────────────────────────────────── */}
        <div className="space-y-5">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-1.5 bg-card border border-border rounded-lg">
              <FlaskConical size={14} className="text-muted-foreground" />
            </div>
            <h2 className="text-sm font-bold tracking-tight text-foreground font-sans">Prediction Playground</h2>
            {isPlaygroundReady && (
              <span className="ml-auto px-2 py-0.5 bg-[#0a2e18] text-[#22c55e] border border-[#22c55e]/40 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider">
                Live
              </span>
            )}
          </div>

          {!isPlaygroundReady ? (
            /* Locked state */
            <div className="bg-card border border-dashed border-border rounded-[20px] p-10 flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="w-14 h-14 rounded-full bg-background border border-border flex items-center justify-center mb-4">
                <FlaskConical size={24} className="text-muted-foreground/40" />
              </div>
              <h3 className="text-sm font-bold tracking-tight text-foreground font-sans mb-2">
                Playground Locked
              </h3>
              <p className="text-xs text-muted-foreground font-sans max-w-xs leading-relaxed">
                Configure your model on the left and click <strong className="text-foreground">Train & Generate Blueprint</strong> to unlock live predictions.
              </p>
            </div>
          ) : (
            /* Unlocked playground */
            <form onSubmit={handlePredict} className="space-y-5">

              {/* Model metadata badge */}
              <div className="bg-card border border-border rounded-[20px] p-5 shadow-sm">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 bg-background border border-border rounded-full text-[10px] font-bold font-mono uppercase tracking-wider text-muted-foreground">
                    {activeMeta.model_type?.replace(/_/g, ' ')}
                  </span>
                  <span className="px-2.5 py-1 bg-background border border-border rounded-full text-[10px] font-bold font-mono uppercase tracking-wider text-muted-foreground">
                    {activeMeta.task_type}
                  </span>
                  <span className="px-2.5 py-1 bg-[#002a45] border border-[#0099ff]/40 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider text-[#0099ff]">
                    Target: {activeMeta.target_column}
                  </span>
                </div>

                <label className="block text-xs font-bold text-muted-foreground font-sans uppercase tracking-wider mb-3">
                  Enter Feature Values
                </label>

                <div className="space-y-2.5">
                  {activeMeta.feature_columns.map(col => (
                    <div key={col} className="flex items-center gap-3">
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-foreground font-sans">{col}</label>
                          <span className="font-mono text-[9px] text-muted-foreground uppercase">{colTypeOf(col)}</span>
                        </div>
                        <input
                          type={isNumeric(col) ? 'number' : 'text'}
                          step={isNumeric(col) ? 'any' : undefined}
                          value={predInputs[col] ?? ''}
                          onChange={(e) => setPredInputs(prev => ({ ...prev, [col]: e.target.value }))}
                          placeholder={isNumeric(col) ? '0.0' : 'Enter value...'}
                          className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/40 text-xs font-semibold text-foreground transition-all font-mono placeholder:text-muted-foreground/50 placeholder:font-sans placeholder:font-normal"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {predError && (
                <div className="flex items-start gap-2.5 p-3.5 bg-[#3d0d18] border border-[#ff5577]/40 rounded-xl">
                  <AlertCircle size={14} className="text-[#ff5577] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#ff5577] font-sans">{predError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={predicting}
                className="w-full py-3 bg-[#0099ff] text-white rounded-full font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {predicting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Running Prediction...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Run Prediction
                  </>
                )}
              </button>

              {/* Prediction Result Card */}
              {predResult && (
                <div className={cn(
                  "rounded-[20px] p-6 border shadow-lg animate-in fade-in duration-200",
                  predResult.task_type === 'classification'
                    ? "bg-gradient-to-br from-[#6a4cf5] to-[#d44df0] border-[#6a4cf5]/30 text-white"
                    : "bg-gradient-to-br from-[#ff7a3d] to-[#ff5577] border-[#ff7a3d]/30 text-white"
                )}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 font-mono mb-2">
                        Predicted {predResult.target_column}
                      </p>
                      <p className="text-4xl font-bold tracking-tight font-sans break-all">
                        {predResult.prediction}
                      </p>
                      {predResult.confidence !== null && predResult.confidence !== undefined && (
                        <p className="text-sm opacity-80 font-sans mt-2 font-medium">
                          {predResult.confidence}% confidence
                        </p>
                      )}
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl shrink-0">
                      <Sparkles size={20} />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider opacity-60 font-mono">
                      {predResult.task_type} · {activeMeta.model_type?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
