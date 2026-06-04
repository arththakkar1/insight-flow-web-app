import { useParams, Link } from 'react-router-dom';
import { UploadCloud, FileSpreadsheet, Database, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function Datasets() {
  const { datasetId } = useParams();

  const dummyDatasets = [
    { id: '1', name: 'Sales_Data_2023.csv', rows: '14,500', status: 'Cleaned' },
    { id: '2', name: 'Customer_Demographics.xlsx', rows: '5,200', status: 'Needs Profiling' },
    { id: '3', name: 'Product_Inventory_DB', rows: '1,200', status: 'Connected' },
  ];

  if (datasetId) {
    const dataset = dummyDatasets.find(d => d.id === datasetId) || { name: 'Unknown Dataset' };
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <Link to="/datasets" className="hover:text-foreground transition-colors">Datasets</Link>
          <ChevronRight size={16} />
          <span className="text-foreground">{dataset.name}</span>
        </div>
        
        <div className="bg-background border border-border rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight mb-8">{dataset.name}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="p-6 bg-muted/30 rounded-2xl border border-border">
              <div className="text-sm font-medium text-muted-foreground mb-1">Total Rows</div>
              <div className="text-3xl font-bold">14,500</div>
            </div>
            <div className="p-6 bg-muted/30 rounded-2xl border border-border">
              <div className="text-sm font-medium text-muted-foreground mb-1">Missing Values</div>
              <div className="text-3xl font-bold">243</div>
            </div>
            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20">
              <div className="text-sm font-medium text-primary/80 mb-1">Status</div>
              <div className="text-xl font-bold text-primary flex items-center gap-2">
                <CheckCircle2 size={20} />
                Ready
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-4 tracking-tight">AI Cleaning Recommendations</h3>
          <ul className="space-y-3">
            <li className="flex justify-between items-center p-4 border border-border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
              <span className="text-sm text-muted-foreground">Fill missing <span className="text-foreground font-semibold">'Age'</span> values with median (34)</span>
              <button className="px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg font-medium text-sm transition-colors">Apply</button>
            </li>
            <li className="flex justify-between items-center p-4 border border-border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
              <span className="text-sm text-muted-foreground">Drop 12 duplicate rows found in dataset</span>
              <button className="px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg font-medium text-sm transition-colors">Apply</button>
            </li>
          </ul>
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
        <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition shadow-sm">
          <UploadCloud size={18} />
          Upload Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyDatasets.map((dataset, i) => (
          <Link key={dataset.id} to={`/datasets/${dataset.id}`} className="block group">
            <div className="bg-background p-6 rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg transition-all h-full flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  {dataset.name.includes('DB') ? <Database size={20} /> : <FileSpreadsheet size={20} />}
                </div>
                <span className="px-2.5 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground">
                  {dataset.status}
                </span>
              </div>
              <h3 className="font-semibold text-base tracking-tight mb-1 relative z-10">{dataset.name}</h3>
              <p className="text-sm text-muted-foreground mt-auto relative z-10">{dataset.rows} rows</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
