import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ScatterChart, Scatter 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard } from 'lucide-react';

const getThemeColors = (theme) => {
  switch (theme) {
    case 'spotify': return ['#1db954', '#1ed760', '#1aa34a', '#178a3f', '#147234', '#105929', '#0d401e', '#092b13'];
    case 'netflix': return ['#E50914', '#B81D24', '#DB0000', '#831010', '#E50914', '#B81D24', '#DB0000', '#831010'];
    case 'analytical': return ['#10b981', '#3b82f6', '#6366f1', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];
    case 'cyberpunk': return ['#0ff', '#f0f', '#39ff14', '#fff01f', '#00ffcc', '#ff0055', '#bb00ff', '#0055ff'];
    case 'ocean': return ['#0ea5e9', '#0284c7', '#0369a1', '#075985', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe'];
    case 'sunset': return ['#f97316', '#ea580c', '#c2410c', '#9a3412', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];
    default: return ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];
  }
};

const getFontClass = (font) => {
  switch (font) {
    case 'serif': return 'font-serif';
    case 'mono': return 'font-mono';
    case 'geist': return 'font-sans'; 
    case 'space': return 'font-mono tracking-tighter'; 
    default: return 'font-sans';
  }
};

export default function SharedCustomDashboard() {
  const { token } = useParams();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [datasetData, setDatasetData] = useState([]);
  const [layout, setLayout] = useState('grid-2x2');
  const [themeStyle, setThemeStyle] = useState('default');
  const [themeFont, setThemeFont] = useState('sans');
  const [charts, setCharts] = useState([]);

  useEffect(() => {
    if (token) {
      // standard fetch since it's a public API
      fetch(`http://localhost:8000/api/shared/dashboard/${token}/`)
        .then(res => {
          if (!res.ok) throw new Error("Dashboard not found or not public");
          return res.json();
        })
        .then(data => {
          setLayout(data.layout);
          setThemeStyle(data.theme_style);
          setThemeFont(data.theme_font);
          setCharts(data.charts);
          setDatasetData(data.data || []);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [token]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="p-8 bg-card border border-border rounded-[20px] shadow-sm max-w-md w-full text-center">
          <LayoutDashboard size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-bold tracking-tight mb-2 text-foreground font-sans">Dashboard Unavailable</h2>
          <p className="text-sm text-muted-foreground mb-6 font-sans">This dashboard might have been deleted, or its sharing permissions were revoked.</p>
          <Link to="/" className="text-sm font-semibold text-primary hover:underline">Go to Homepage</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-sm font-mono text-muted-foreground text-center">Loading dashboard...</div>;
  }

  const renderChart = (chartConfig, index, currentColors) => {
    if (!datasetData || datasetData.length === 0) {
      return <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm font-mono">No Data</div>;
    }
    if (!chartConfig.xAxis || !chartConfig.yAxis) {
       return <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm font-mono">Configure Axes</div>;
    }

    const { type, xAxis, yAxis } = chartConfig;
    const color = currentColors[index % currentColors.length];
    
    const CustomTooltipStyle = {
      backgroundColor: themeStyle === 'spotify' ? '#121212' : (themeStyle === 'netflix' || themeStyle === 'cyberpunk') ? '#000' : themeStyle === 'analytical' ? '#fff' : 'hsl(var(--card))', 
      borderColor: themeStyle === 'spotify' ? '#282828' : (themeStyle === 'netflix' || themeStyle === 'cyberpunk') ? '#333' : 'hsl(var(--border))', 
      borderRadius: '8px',
      color: themeStyle === 'spotify' ? '#fff' : (themeStyle === 'netflix' || themeStyle === 'cyberpunk') ? '#fff' : 'inherit',
      boxShadow: themeStyle === 'cyberpunk' ? '0 0 10px rgba(0, 255, 255, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    };

    switch (type) {
      case 'KPI': {
        let value = 0;
        const validData = datasetData.filter(d => d[yAxis] !== null && d[yAxis] !== undefined && d[yAxis] !== '');
        if (validData.length > 0) {
          const sum = validData.reduce((acc, curr) => acc + (Number(curr[yAxis]) || 0), 0);
          if (chartConfig.aggregation === 'sum') value = sum;
          else if (chartConfig.aggregation === 'count') value = validData.length;
          else if (chartConfig.aggregation === 'max') value = Math.max(...validData.map(d => Number(d[yAxis]) || 0));
          else if (chartConfig.aggregation === 'min') value = Math.min(...validData.map(d => Number(d[yAxis]) || 0));
          else value = sum / validData.length; 
        }
        
        return (
          <div className="flex flex-col items-center justify-center h-full w-full p-4 text-center">
            <span className="text-4xl md:text-5xl font-bold tracking-tighter drop-shadow-sm" style={{ color: color, textShadow: themeStyle === 'cyberpunk' ? `0 0 10px ${color}` : 'none' }}>
              {value % 1 !== 0 ? value.toFixed(2) : value}
            </span>
            <span className="text-[10px] md:text-xs uppercase tracking-widest opacity-60 mt-3 font-semibold text-inherit">
              {chartConfig.title ? chartConfig.title : `${chartConfig.aggregation || 'average'} ${yAxis}`}
            </span>
          </div>
        );
      }
      case 'Line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datasetData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
              <XAxis dataKey={xAxis} tick={{fontSize: 10}} />
              <YAxis tick={{fontSize: 10}} />
              <RechartsTooltip contentStyle={CustomTooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey={yAxis} stroke={color} strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'Bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datasetData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
              <XAxis dataKey={xAxis} tick={{fontSize: 10}} />
              <YAxis tick={{fontSize: 10}} />
              <RechartsTooltip contentStyle={CustomTooltipStyle} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
              <Legend />
              <Bar dataKey={yAxis} fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'Area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={datasetData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
              <XAxis dataKey={xAxis} tick={{fontSize: 10}} />
              <YAxis tick={{fontSize: 10}} />
              <RechartsTooltip contentStyle={CustomTooltipStyle} />
              <Legend />
              <Area type="monotone" dataKey={yAxis} fill={color} stroke={color} fillOpacity={0.4} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'Scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
              <XAxis dataKey={xAxis} tick={{fontSize: 10}} name={xAxis} />
              <YAxis dataKey={yAxis} tick={{fontSize: 10}} name={yAxis} />
              <RechartsTooltip cursor={{strokeDasharray: '3 3'}} contentStyle={CustomTooltipStyle} />
              <Legend />
              <Scatter name={`${xAxis} vs ${yAxis}`} data={datasetData} fill={color} />
            </ScatterChart>
          </ResponsiveContainer>
        );
      case 'Pie': {
        const aggs = {};
        datasetData.forEach(d => {
          const k = d[xAxis];
          const v = Number(d[yAxis]) || 0;
          if (k) aggs[k] = (aggs[k] || 0) + v;
        });
        const pieData = Object.keys(aggs).map(k => ({ name: k, value: aggs[k] })).sort((a,b) => b.value - a.value).slice(0, 10);
        
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <RechartsTooltip contentStyle={CustomTooltipStyle} />
              <Legend />
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={80} stroke="none">
                {pieData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={currentColors[idx % currentColors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        );
      }
      default:
        return <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm font-mono">Select Type</div>;
    }
  };

  const themeColors = getThemeColors(themeStyle);
  const fontClass = getFontClass(themeFont);

  const getGridClass = () => {
    switch(layout) {
      case 'single': return 'grid-cols-1 grid-rows-1';
      case 'split-horizontal': return 'grid-cols-1 grid-rows-2';
      case 'grid-2x2': return 'grid-cols-2 grid-rows-2';
      case 'spotify-grid': return 'grid-cols-4 grid-rows-4';
      default: return 'grid-cols-2 grid-rows-2';
    }
  };

  const getVisibleCharts = () => {
    switch(layout) {
      case 'single': return charts.slice(0, 1);
      case 'split-horizontal': return charts.slice(0, 2);
      case 'grid-2x2': return charts.slice(0, 4);
      case 'spotify-grid': return charts.slice(0, 7);
      default: return charts.slice(0, 4);
    }
  };

  const getSlotClass = (index) => {
    if (layout === 'spotify-grid') {
      if (index === 0) return 'col-span-2 row-span-2';
      if (index === 1) return 'col-span-2 row-span-1';
      if (index === 2) return 'col-span-1 row-span-1';
      if (index === 3) return 'col-span-1 row-span-1';
      if (index === 4) return 'col-span-4 row-span-2';
      if (index === 5) return 'col-span-2 row-span-2';
      if (index === 6) return 'col-span-2 row-span-2';
    }
    return '';
  };

  let themeBg = 'bg-background';
  let isDarkBase = false;
  
  if (themeStyle === 'spotify') { themeBg = 'bg-[#121212]'; isDarkBase = true; }
  else if (themeStyle === 'netflix') { themeBg = 'bg-[#000000]'; isDarkBase = true; }
  else if (themeStyle === 'cyberpunk') { themeBg = 'bg-[#0B0C10]'; isDarkBase = true; }
  else if (themeStyle === 'analytical') { themeBg = 'bg-slate-50'; }

  return (
    <div className={`min-h-screen ${themeBg} ${fontClass} ${isDarkBase ? 'dark' : ''} flex flex-col`}>
      {/* Read-Only Top Banner */}
      <div className="w-full bg-card border-b border-border py-3 px-6 flex justify-between items-center text-xs font-semibold shadow-sm z-50">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-gradient-to-br from-destructive to-destructive flex items-center justify-center text-destructive-foreground text-[10px]">if</span>
          <span className="text-foreground tracking-tight font-sans">InsightFlow <span className="text-muted-foreground/50 mx-1">|</span> Shared Dashboard</span>
        </div>
        <div className="text-muted-foreground hidden sm:block">Interactive View</div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 flex-1 h-full max-h-screen overflow-hidden">
        <div className={`grid ${getGridClass()} gap-4 h-[calc(100vh-100px)] overflow-y-auto p-1`}>
          <AnimatePresence mode="popLayout">
            {getVisibleCharts().map((chart, index) => {
              const isSpotify = themeStyle === 'spotify';
              const isNetflix = themeStyle === 'netflix';
              const isCyberpunk = themeStyle === 'cyberpunk';
              const isAnalytical = themeStyle === 'analytical';
              
              let cardStyle = {};
              let cardClasses = `flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow ${getSlotClass(index)} `;
              
              if (isSpotify) {
                cardStyle = { backgroundColor: '#181818', borderColor: '#282828' };
                cardClasses += 'rounded-lg border text-[#b3b3b3]';
              } else if (isNetflix) {
                cardStyle = { backgroundColor: '#1f1f1f', borderColor: '#333' };
                cardClasses += 'rounded-md border text-[#d2d2d2] shadow-lg';
              } else if (isCyberpunk) {
                cardStyle = { backgroundColor: '#1F2833', borderColor: '#45A29E', boxShadow: '0 0 10px rgba(69, 162, 158, 0.2)' };
                cardClasses += 'rounded-xl border text-[#C5C6C7]';
              } else if (isAnalytical) {
                cardStyle = { backgroundColor: '#ffffff', borderColor: '#e2e8f0' };
                cardClasses += 'rounded-xl border text-slate-700 shadow-sm';
              } else {
                cardClasses += 'bg-background border border-border rounded-2xl text-foreground';
              }
                
              return (
                <motion.div 
                  key={chart.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className={cardClasses}
                  style={cardStyle}
                >
                  {/* Title */}
                  {chart.title && chart.type !== 'KPI' && (
                    <div className="px-4 pt-4 pb-0 text-sm font-bold tracking-tight text-inherit">
                      {chart.title}
                    </div>
                  )}
                  
                  {/* Chart Render Area */}
                  <div className={`flex-1 ${chart.type !== 'KPI' ? 'p-4 pb-6' : 'p-0'} min-h-0 relative`}>
                    {renderChart(chart, index, themeColors)}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
