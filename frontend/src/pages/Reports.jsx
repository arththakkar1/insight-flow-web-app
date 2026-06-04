import { useParams, Link } from 'react-router-dom';
import { PieChart, LineChart, BarChart, ChevronRight, FileText } from 'lucide-react';

export default function Reports() {
  const { reportId } = useParams();

  const dummyReports = [
    { id: '1', title: 'Q3 Sales Dashboard Blueprint', dataset: 'Sales_Data_2023.csv', generated: '2 hours ago' },
    { id: '2', title: 'Customer Churn Analysis', dataset: 'Customer_Demographics.xlsx', generated: '1 day ago' },
  ];

  if (reportId) {
    const report = dummyReports.find(r => r.id === reportId) || { title: 'Report Details' };
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <Link to="/reports" className="hover:text-foreground transition-colors">Reports</Link>
          <ChevronRight size={16} />
          <span className="text-foreground">{report.title}</span>
        </div>
        
        <div className="flex justify-between items-end mb-8">
          <h1 className="text-2xl font-bold tracking-tight">{report.title}</h1>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition shadow-sm">Export PDF</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-8 bg-background rounded-3xl border border-border shadow-sm h-64 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <LineChart size={32} strokeWidth={2} />
            </div>
            <p className="font-semibold mb-1">Revenue Trend</p>
            <p className="text-xs text-muted-foreground">X: Date, Y: Total Sales</p>
          </div>
          <div className="p-8 bg-background rounded-3xl border border-border shadow-sm h-64 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <BarChart size={32} strokeWidth={2} />
            </div>
            <p className="font-semibold mb-1">Sales by Region</p>
            <p className="text-xs text-muted-foreground">X: Region, Y: Total Sales</p>
          </div>
          <div className="p-8 bg-background rounded-3xl border border-border shadow-sm h-64 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <PieChart size={32} strokeWidth={2} />
            </div>
            <p className="font-semibold mb-1">Product Category</p>
            <p className="text-xs text-muted-foreground">Legend: Category, Value: Units</p>
          </div>
        </div>

        <div className="mt-12 p-8 bg-background border border-border rounded-3xl shadow-sm">
          <h3 className="text-lg font-semibold tracking-tight mb-4">Generated DAX Measures</h3>
          <div className="bg-muted p-6 rounded-2xl font-mono text-sm overflow-x-auto text-foreground/80 leading-relaxed border border-border/50">
            <p><span className="text-primary font-bold">Total Sales</span> = SUM('Sales'[Amount])</p>
            <p><span className="text-primary font-bold">YTD Sales</span> = CALCULATE([Total Sales], DATESYTD('Date'[Date]))</p>
            <p><span className="text-primary font-bold">Profit Margin %</span> = DIVIDE(SUM('Sales'[Profit]), [Total Sales], 0)</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-border/50 pb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Saved Reports</h1>
        <p className="text-muted-foreground text-sm">View your generated dashboards and insights.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {dummyReports.map((report, i) => (
          <Link key={report.id} to={`/reports/${report.id}`} className="block group">
            <div className="p-6 bg-background rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex justify-between items-center">
              <div className="flex items-center gap-4">
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
                  <span className="px-2.5 py-1 bg-muted rounded-md text-xs font-medium">4 Visuals</span>
                  <span className="px-2.5 py-1 bg-muted rounded-md text-xs font-medium">12 DAX</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
