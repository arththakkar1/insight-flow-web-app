import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BrainCircuit, Trash2, ChevronRight, Loader2, AlertCircle,
  BarChart2, CheckCircle2, TrendingUp, Target, Layers,
  ArrowLeft, FlaskConical
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { PromptModal } from '../components/ui/PromptModal';
import { cn } from '../lib/utils';

/* ── Metric card ─────────────────────────────────────────────────── */
function MetricCard({ label, value, color = 'text-foreground' }) {
  return (
    <div className="p-5 bg-background rounded-[15px] border border-border flex flex-col gap-1">
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className={cn("text-2xl font-bold tracking-tight font-sans", color)}>{value ?? '—'}</span>
    </div>
  );
}

/* ── Feature importance bar ──────────────────────────────────────── */
function ImportanceBar({ feature, importance }) {
  const pct = Math.round(importance * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-foreground font-sans truncate max-w-[60%]">{feature}</span>
        <span className="text-[10px] font-mono text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-[#0099ff] rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function MLModels() {
  const { modelId } = useParams();
  const navigate = useNavigate();

  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modelDetails, setModelDetails] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load all ML reports
  useEffect(() => {
    apiFetch('http://localhost:8000/api/reports/')
      .then(r => r.json())
      .then(data => {
        setModels(data.filter(r => r.report_type === 'ml'));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Load single model details
  useEffect(() => {
    if (!modelId) return;
    apiFetch(`http://localhost:8000/api/reports/${modelId}/`)
      .then(r => r.json())
      .then(setModelDetails);
  }, [modelId]);

  const handleDelete = () => {
    apiFetch(`http://localhost:8000/api/reports/${modelId}/`, { method: 'DELETE' })
      .then(() => {
        setShowDeleteConfirm(false);
        navigate('/ml-models');
      });
  };

  // ── Detail view ──────────────────────────────────────────────────
  if (modelId) {
    if (!modelDetails) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <span className="font-mono text-xs tracking-widest text-muted-foreground animate-pulse">
            LOADING MODEL REPORT...
          </span>
        </div>
      );
    }

    const ml = modelDetails.visuals_data?.[0]?.details;
    const isClassification = ml?.task_type === 'classification';
    const metrics = ml?.metrics ?? {};
    const importances = ml?.feature_importances ?? [];
    const predictions = ml?.predictions_sample ?? [];

    return (
      <div className="min-h-full pb-16 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-border pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono mb-3">
              <Link to="/ml-models" className="hover:text-foreground transition-colors">ML Models</Link>
              <ChevronRight size={12} />
              <span className="text-foreground font-semibold truncate max-w-[200px]">{modelDetails.title}</span>
            </div>
            <h1 className="text-3xl font-medium tracking-tight text-foreground font-sans mb-1">
              {modelDetails.title}
            </h1>
            <p className="text-xs text-muted-foreground font-sans">
              Source dataset: <span className="text-foreground font-semibold">{modelDetails.dataset}</span>
              {' '}· {modelDetails.generated}
            </p>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-accent border border-border text-[#ff5577] hover:border-[#ff5577]/20 rounded-full text-xs font-semibold transition-all shadow-sm"
            >
              <Trash2 size={13} />
              Delete
            </button>
            {ml && (
              <Link
                to={`/ml-builder/${ml.dataset_id || ''}`}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-full text-xs font-semibold transition-all shadow-sm"
              >
                <BrainCircuit size={13} />
                Retrain Model
              </Link>
            )}
          </div>
        </div>

        {/* Model spec badges */}
        {ml && (
          <div className="flex flex-wrap gap-2 mb-8">
            <span className="px-3 py-1.5 bg-[#002a45] border border-[#0099ff]/40 text-[#0099ff] rounded-full text-[11px] font-bold font-mono uppercase tracking-wider">
              {ml.model_type?.replace(/_/g, ' ')}
            </span>
            <span className="px-3 py-1.5 bg-card border border-border text-muted-foreground rounded-full text-[11px] font-bold font-mono uppercase tracking-wider">
              {ml.task_type}
            </span>
            <span className="px-3 py-1.5 bg-card border border-border text-foreground rounded-full text-[11px] font-semibold font-sans">
              Target: <span className="text-[#0099ff]">{ml.target_column}</span>
            </span>
            <span className="px-3 py-1.5 bg-card border border-border text-muted-foreground rounded-full text-[11px] font-semibold font-sans">
              Trained on {ml.total_rows_trained?.toLocaleString()} rows
            </span>
          </div>
        )}

        <div className="space-y-6">
          {/* Metrics */}
          {ml && (
            <div className="bg-card border border-border rounded-[20px] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-background border border-border rounded-xl">
                  <BarChart2 size={15} className="text-muted-foreground" />
                </div>
                <h2 className="text-sm font-bold tracking-tight text-foreground font-sans">
                  {isClassification ? 'Classification Metrics' : 'Regression Metrics'}
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {isClassification ? (
                  <>
                    <MetricCard label="Accuracy" value={`${(metrics.accuracy * 100).toFixed(1)}%`} color="text-[#22c55e]" />
                    <MetricCard label="Precision" value={`${(metrics.precision * 100).toFixed(1)}%`} />
                    <MetricCard label="Recall" value={`${(metrics.recall * 100).toFixed(1)}%`} />
                    <MetricCard label="F1 Score" value={`${(metrics.f1_score * 100).toFixed(1)}%`} />
                  </>
                ) : (
                  <>
                    <MetricCard label="R² Score" value={metrics.r2_score?.toFixed(4)} color={metrics.r2_score > 0.7 ? "text-[#22c55e]" : "text-foreground"} />
                    <MetricCard label="MAE" value={metrics.mae?.toFixed(4)} />
                    <MetricCard label="MSE" value={metrics.mse?.toFixed(4)} />
                    <MetricCard label="RMSE" value={metrics.rmse?.toFixed(4)} />
                  </>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feature Importances */}
            {importances.length > 0 && (
              <div className="bg-card border border-border rounded-[20px] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-background border border-border rounded-xl">
                    <Layers size={15} className="text-muted-foreground" />
                  </div>
                  <h2 className="text-sm font-bold tracking-tight text-foreground font-sans">Feature Importances</h2>
                </div>
                <div className="space-y-3">
                  {importances.map((item, i) => (
                    <ImportanceBar key={i} feature={item.feature} importance={item.importance} />
                  ))}
                </div>
              </div>
            )}

            {/* Predictions Sample */}
            {predictions.length > 0 && (
              <div className="bg-card border border-border rounded-[20px] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-background border border-border rounded-xl">
                    <Target size={15} className="text-muted-foreground" />
                  </div>
                  <h2 className="text-sm font-bold tracking-tight text-foreground font-sans">Predictions Sample</h2>
                  <span className="ml-auto text-[10px] font-mono text-muted-foreground">{predictions.length} rows</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-sans">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">#</th>
                        <th className="pb-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Actual</th>
                        <th className="pb-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Predicted</th>
                        {isClassification && (
                          <th className="pb-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Match</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {predictions.slice(0, 20).map((p, i) => (
                        <tr key={i} className={cn(
                          "transition-colors hover:bg-accent/40",
                          isClassification && !p.correct && "bg-[#3d0d18]"
                        )}>
                          <td className="py-2 font-mono text-[10px] text-muted-foreground">{p.id}</td>
                          <td className="py-2 font-semibold text-foreground font-sans">{String(p.actual)}</td>
                          <td className="py-2 font-semibold text-[#0099ff] font-sans">{String(p.predicted)}</td>
                          {isClassification && (
                            <td className="py-2">
                              {p.correct
                                ? <CheckCircle2 size={12} className="text-[#22c55e]" />
                                : <AlertCircle size={12} className="text-[#ff5577]" />
                              }
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        <PromptModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Delete ML Model Report"
          message="Are you sure you want to delete this ML model report? This action cannot be undone."
          type="destructive"
          confirmText="Delete Report"
        />
      </div>
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────
  return (
    <div className="animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-border pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground font-sans mb-1">ML Models</h1>
          <p className="text-xs text-muted-foreground font-sans">
            All trained machine learning models and their performance reports.
          </p>
        </div>
        <Link
          to="/datasets"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-full text-xs font-semibold transition-all shadow-sm self-start md:self-auto"
        >
          <BrainCircuit size={14} />
          Train New Model
        </Link>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <span className="font-mono text-xs tracking-widest text-muted-foreground animate-pulse">
            LOADING MODELS...
          </span>
        </div>
      ) : models.length === 0 ? (
        <div className="py-20 border border-dashed border-border rounded-[20px] flex flex-col items-center justify-center bg-card text-center px-4">
          <BrainCircuit size={44} className="text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold tracking-tight text-foreground font-sans mb-2">No ML Models Yet</h3>
          <p className="text-xs text-muted-foreground font-sans mb-6 max-w-sm">
            Open a dataset and launch the ML Builder to train your first model.
          </p>
          <Link
            to="/datasets"
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-xs font-semibold hover:opacity-90 transition-all"
          >
            Go to Datasets
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {models.map(model => {
            const ml = model.visuals_data?.[0]?.details ?? {};
            return (
              <div
                key={model.id}
                onClick={() => navigate(`/ml-models/${model.id}`)}
                className="bg-card border border-border hover:border-foreground/40 hover:shadow-2xl rounded-[20px] p-6 cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-start mb-5">
                  <div className="p-2.5 rounded-full bg-background border border-border text-foreground group-hover:bg-foreground group-hover:text-background transition-colors shadow-sm">
                    <BrainCircuit size={16} />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="px-2 py-0.5 bg-[#002a45] text-[#0099ff] border border-[#0099ff]/40 rounded-full text-[9px] font-bold font-mono uppercase tracking-wider">
                      ML Model
                    </span>
                    {ml.task_type && (
                      <span className="px-2 py-0.5 bg-background text-muted-foreground border border-border rounded-full text-[9px] font-mono uppercase tracking-wider">
                        {ml.task_type}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-base tracking-tight text-foreground group-hover:text-[#0099ff] transition-colors font-sans mb-1">
                  {model.title}
                </h3>
                <p className="text-[11px] text-muted-foreground font-sans mb-4 truncate">
                  Source: {model.dataset}
                </p>

                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  {ml.model_type && (
                    <div className="flex flex-col">
                      <span className="text-[9px] font-sans font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Algorithm</span>
                      <span className="text-xs font-semibold text-foreground font-sans">{ml.model_type?.replace(/_/g, ' ')}</span>
                    </div>
                  )}
                  {ml.metrics && (
                    <div className="flex flex-col ml-auto text-right">
                      <span className="text-[9px] font-sans font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                        {ml.task_type === 'classification' ? 'Accuracy' : 'R²'}
                      </span>
                      <span className={cn(
                        "text-xs font-bold font-mono px-2 py-0.5 rounded-full border",
                        ml.task_type === 'classification'
                          ? (ml.metrics.accuracy > 0.8 ? 'bg-[#0a2e18] text-[#22c55e] border-[#22c55e]/40' : 'bg-background text-foreground border-border')
                          : (ml.metrics.r2_score > 0.7 ? 'bg-[#0a2e18] text-[#22c55e] border-[#22c55e]/40' : 'bg-background text-foreground border-border')
                      )}>
                        {ml.task_type === 'classification'
                          ? `${(ml.metrics.accuracy * 100).toFixed(1)}%`
                          : ml.metrics.r2_score?.toFixed(3)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
