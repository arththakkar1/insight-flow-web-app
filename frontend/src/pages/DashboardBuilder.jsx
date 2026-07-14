import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { CustomSelect } from '../components/ui/Select';
import { apiFetch } from '../utils/api';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ScatterChart, Scatter 
} from 'recharts';
import { LayoutDashboard, Play, Maximize2, LayoutGrid, Rows3, LayoutTemplate, Monitor, X, Share2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const getThemeColors = (theme) => {
  switch (theme) {
    case 'spotify': return ['#1db954', '#1ed760', '#1aa34a', '#178a3f', '#147234', '#105929', '#0d401e', '#092b13'];
    case 'netflix': return ['#E50914', '#B81D24', '#DB0000', '#831010', '#E50914', '#B81D24', '#DB0000', '#831010'];
    case 'analytical': return ['#10b981', '#3b82f6', '#6366f1', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];
    case 'cyberpunk': return ['#0ff', '#f0f', '#39ff14', '#fff01f', '#00ffcc', '#ff0055', '#bb00ff', '#0055ff'];
    case 'ocean': return ['#0ea5e9', '#0284c7', '#0369a1', '#075985', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe'];
    case 'sunset': return ['#f97316', '#ea580c', '#c2410c', '#9a3412', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];
    default: return ['#f10303', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];
  }
};

const getFontClass = (font) => {
  switch (font) {
    case 'serif': return 'font-serif';
    case 'mono': return 'font-mono';
    case 'geist': return 'font-sans'; // default sans is usually ok
    case 'space': return 'font-mono tracking-tighter'; 
    default: return 'font-sans';
  }
};

export default function DashboardBuilder() {
  const { datasetId } = useParams();
  const navigate = useNavigate();

  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(datasetId || '');
  const [datasetData, setDatasetData] = useState([]);
  const [columns, setColumns] = useState([]);
  
  const [layout, setLayout] = useState('grid-2x2'); // options: 'single', 'grid-2x2', 'split-horizontal', 'spotify-grid'
  const [themeStyle, setThemeStyle] = useState('default');
  const [themeFont, setThemeFont] = useState('sans');
  
  const { isFullScreen, setIsFullScreen } = useOutletContext() || { isFullScreen: false, setIsFullScreen: () => {} };
  
  const [charts, setCharts] = useState([
    { id: '1', type: 'KPI', xAxis: '', yAxis: '' },
    { id: '2', type: 'KPI', xAxis: '', yAxis: '' },
    { id: '3', type: 'KPI', xAxis: '', yAxis: '' },
    { id: '4', type: 'Bar', xAxis: '', yAxis: '' },
    { id: '5', type: 'Line', xAxis: '', yAxis: '' },
    { id: '6', type: 'Pie', xAxis: '', yAxis: '' },
    { id: '7', type: 'Scatter', xAxis: '', yAxis: '' },
  ]);

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('http://localhost:8000/api/datasets/');
      if (res.ok) {
        const data = await res.json();
        setDatasets(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const loadDatasetData = async (dsId) => {
    setDataLoading(true);
    try {
      const res = await apiFetch(`http://localhost:8000/api/datasets/${dsId}/data/`);
      if (res.ok) {
        const data = await res.json();
        setDatasetData(data.data || []);
        setColumns(data.columns || []);
        
        if (data.columns && data.columns.length > 0) {
           const defaultX = data.columns[0];
           const defaultY = data.columns.length > 1 ? data.columns[1] : data.columns[0];
           
           setCharts(prev => prev.map(c => ({
             ...c,
             xAxis: data.columns.includes(c.xAxis) ? c.xAxis : defaultX,
             yAxis: data.columns.includes(c.yAxis) ? c.yAxis : defaultY
           })));
        }
      }
    } catch (err) {
      console.error(err);
    }
    setDataLoading(false);
  };

  useEffect(() => {
    if (datasetId) {
      loadDatasetData(datasetId);
      setSelectedDatasetId(datasetId);
    } else {
      setSelectedDatasetId('');
      setDatasetData([]);
      setColumns([]);
    }
  }, [datasetId]);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const payload = {
        datasetId: selectedDatasetId,
        layout,
        themeStyle,
        themeFont,
        charts
      };
      const res = await apiFetch('http://localhost:8000/api/dashboard/share/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        const url = `${window.location.origin}/shared-custom/${data.share_token}`;
        setShareLink(url);
        setShowShareModal(true);
      }
    } catch (err) {
      console.error(err);
    }
    setIsSharing(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };



  const handleDatasetSelect = (dsId) => {
    if (!dsId) {
      navigate('/dashboard-builder');
    } else {
      navigate(`/dashboard-builder/${dsId}`);
    }
  };

  const updateChart = (index, field, value) => {
    const newCharts = [...charts];
    newCharts[index] = { ...newCharts[index], [field]: value };
    setCharts(newCharts);
  };

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
          else value = sum / validData.length; // default average
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
        return null;
    }
  };

  const getGridClass = () => {
    switch (layout) {
      case 'single': return 'grid-cols-1';
      case 'split-horizontal': return 'grid-cols-1 lg:grid-cols-1'; 
      case 'grid-2x2': return 'grid-cols-1 md:grid-cols-2';
      case 'spotify-grid': return 'grid-cols-1 md:grid-cols-4';
      default: return 'grid-cols-1 md:grid-cols-2';
    }
  };

  const getSlotClass = (index) => {
    if (layout === 'spotify-grid') {
      switch (index) {
        case 0: return 'col-span-1 md:col-span-1 min-h-[120px]'; 
        case 1: return 'col-span-1 md:col-span-2 min-h-[120px]'; 
        case 2: return 'col-span-1 md:col-span-1 min-h-[120px]'; 
        case 3: return 'col-span-1 md:col-span-1 md:row-span-2 min-h-[250px]'; 
        case 4: return 'col-span-1 md:col-span-3 min-h-[250px]';
        case 5: return 'col-span-1 md:col-span-1 min-h-[250px]';
        case 6: return 'col-span-1 md:col-span-2 min-h-[250px]';
        default: return 'col-span-1';
      }
    }
    return layout === 'single' ? 'min-h-[500px]' : 'min-h-[300px]';
  };
  
  const getVisibleCharts = () => {
    switch (layout) {
      case 'single': return charts.slice(0, 1);
      case 'split-horizontal': return charts.slice(0, 2);
      case 'spotify-grid': return charts.slice(0, 7);
      case 'grid-2x2': default: return charts.slice(0, 4);
    }
  };

  const themeColors = getThemeColors(themeStyle);
  
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const getFullscreenBg = () => {
    if (themeStyle === 'spotify') return 'bg-[#121212]';
    if (themeStyle === 'netflix') return 'bg-[#141414]';
    if (themeStyle === 'analytical') return 'bg-[#f8fafc]';
    if (themeStyle === 'cyberpunk') return 'bg-[#0B0C10]';
    if (themeStyle === 'ocean') return 'bg-[#0f172a]';
    return 'bg-background';
  };

  return (
    <div className={`transition-colors duration-500 h-full min-h-0 flex flex-col ${isFullScreen ? `overflow-y-auto ${getFullscreenBg()}` : 'bg-background pb-20 md:pb-0'} text-foreground ${getFontClass(themeFont)}`}>
      
      {isFullScreen && (
        <button 
          onClick={toggleFullScreen}
          className="fixed top-4 right-4 z-[110] bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-all shadow-lg cursor-pointer"
        >
          <X size={24} />
        </button>
      )}

      <div className={`${isFullScreen ? 'p-4 md:p-8 max-w-[1600px]' : 'max-w-7xl p-4 md:p-8'} mx-auto w-full flex flex-col min-h-0 h-full`}>
        
        {/* Header - Hidden in Full Screen */}
        {!isFullScreen && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6 mb-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#f10303] to-[#ff4d4d] flex items-center justify-center text-white shadow-lg">
                <LayoutDashboard size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Interactive Dashboard</h1>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mt-1">Configure & Visualize your Data</p>
              </div>
            </div>
            
            {/* Theming Controls */}
            <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-2 shadow-sm min-w-[300px]">
              <CustomSelect 
                value={themeStyle}
                onChange={setThemeStyle}
                options={[
                  {value: "default", label: "Default Theme"},
                  {value: "spotify", label: "Spotify Dark"},
                  {value: "netflix", label: "Netflix Red"},
                  {value: "analytical", label: "Analytical Light"},
                  {value: "cyberpunk", label: "Neon Cyberpunk"},
                  {value: "ocean", label: "Ocean Blue"},
                  {value: "sunset", label: "Sunset Orange"}
                ]}
                className="w-[140px]"
                triggerClassName="bg-transparent border-none p-1 text-xs shadow-none hover:bg-transparent text-foreground"
              />
              <div className="w-px h-4 bg-border"></div>
              <CustomSelect 
                value={themeFont}
                onChange={setThemeFont}
                options={[
                  {value: "sans", label: "Sans Serif"},
                  {value: "serif", label: "Serif"},
                  {value: "mono", label: "Monospace"},
                  {value: "space", label: "Space Grotesk"}
                ]}
                className="w-[130px]"
                triggerClassName="bg-transparent border-none p-1 text-xs shadow-none hover:bg-transparent text-foreground"
              />
            </div>
          </div>
        )}

        <div className={`grid grid-cols-1 ${!isFullScreen ? 'lg:grid-cols-4' : ''} gap-6 flex-1 min-h-0`}>
          
          {/* Controls Panel - Hidden in Full Screen */}
          {!isFullScreen && (
            <div className="lg:col-span-1 space-y-6">
              
              {/* Dataset Selection */}
              <div className="bg-card border border-border p-5 rounded-[20px] shadow-sm">
                <h2 className="text-sm font-bold mb-4 font-mono uppercase tracking-wider">1. Select Dataset</h2>
                <CustomSelect 
                  value={String(selectedDatasetId)}
                  onChange={handleDatasetSelect}
                  placeholder="-- Choose a Dataset --"
                  options={datasets.map(ds => ({ value: String(ds.id), label: `${ds.name} (${ds.rows_count} rows)` }))}
                  className="w-full"
                />
                {dataLoading && <p className="text-xs text-muted-foreground mt-3 font-mono animate-pulse">Fetching dataset records...</p>}
              </div>

              {/* Layout Selection */}
              <div className="bg-card border border-border p-5 rounded-[20px] shadow-sm">
                <h2 className="text-sm font-bold mb-4 font-mono uppercase tracking-wider">2. Choose Layout</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setLayout('single')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${layout === 'single' ? 'bg-[#f10303]/10 border-[#f10303] text-[#f10303]' : 'bg-background border-border hover:bg-accent hover:border-foreground/30'}`}
                  >
                    <Maximize2 size={16} className="mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Single</span>
                  </button>
                  <button 
                    onClick={() => setLayout('split-horizontal')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${layout === 'split-horizontal' ? 'bg-[#f10303]/10 border-[#f10303] text-[#f10303]' : 'bg-background border-border hover:bg-accent hover:border-foreground/30'}`}
                  >
                    <Rows3 size={16} className="mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Split</span>
                  </button>
                  <button 
                    onClick={() => setLayout('grid-2x2')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${layout === 'grid-2x2' ? 'bg-[#f10303]/10 border-[#f10303] text-[#f10303]' : 'bg-background border-border hover:bg-accent hover:border-foreground/30'}`}
                  >
                    <LayoutGrid size={16} className="mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">2x2</span>
                  </button>
                  <button 
                    onClick={() => setLayout('spotify-grid')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${layout === 'spotify-grid' ? 'bg-[#1db954]/20 border-[#1db954] text-[#1db954]' : 'bg-background border-border hover:bg-accent hover:border-foreground/30'}`}
                  >
                    <LayoutTemplate size={16} className="mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center">Spotify<br/>Template</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Configuration & Preview */}
          <div className={`${!isFullScreen ? 'lg:col-span-3' : 'w-full'} flex flex-col min-h-0 h-full`}>
            
            <div className={`flex-1 flex flex-col min-h-0 overflow-hidden ${!isFullScreen ? 'bg-card border border-border p-5 rounded-[20px] shadow-sm' : ''}`}>
              {!isFullScreen && (
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-bold font-mono uppercase tracking-wider flex items-center gap-2">
                    <Play size={14} className="text-[#f10303]" /> 3. Live Dashboard Render
                  </h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleShare}
                      disabled={!selectedDatasetId || isSharing}
                      className="flex items-center gap-2 bg-card border border-border text-foreground px-4 py-2 rounded-lg text-xs font-bold hover:bg-accent disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                    >
                      <Share2 size={14} /> {isSharing ? 'Generating...' : 'Share'}
                    </button>
                    <button 
                      onClick={toggleFullScreen}
                      disabled={!selectedDatasetId}
                      className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                    >
                      <Monitor size={14} /> Full Screen Mode
                    </button>
                  </div>
                </div>
              )}

              {selectedDatasetId ? (
                <div className={`grid ${getGridClass()} gap-4 flex-1 min-h-0 overflow-y-auto p-1 scrollbar-thin`}>
                  <AnimatePresence mode="popLayout">
                    {getVisibleCharts().map((chart, index) => {
                      const isSpotify = themeStyle === 'spotify';
                      const isNetflix = themeStyle === 'netflix';
                      const isCyberpunk = themeStyle === 'cyberpunk';
                      const isAnalytical = themeStyle === 'analytical';
                      
                      let cardStyle = {};
                      let cardClasses = `flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow ${getSlotClass(index)} `;
                      let headerClasses = `px-3 py-2 border-b flex flex-wrap gap-2 items-center justify-between text-xs `;
                      
                      if (isSpotify) {
                        cardStyle = { backgroundColor: '#181818', borderColor: '#282828' };
                        cardClasses += 'rounded-lg border text-[#b3b3b3]';
                        headerClasses += 'bg-[#282828] border-[#333] text-white';
                      } else if (isNetflix) {
                        cardStyle = { backgroundColor: '#1f1f1f', borderColor: '#333' };
                        cardClasses += 'rounded-md border text-[#d2d2d2] shadow-lg';
                        headerClasses += 'bg-[#141414] border-[#333] text-white';
                      } else if (isCyberpunk) {
                        cardStyle = { backgroundColor: '#1F2833', borderColor: '#45A29E', boxShadow: '0 0 10px rgba(69, 162, 158, 0.2)' };
                        cardClasses += 'rounded-xl border text-[#C5C6C7]';
                        headerClasses += 'bg-[#0B0C10] border-[#45A29E] text-white';
                      } else if (isAnalytical) {
                        cardStyle = { backgroundColor: '#ffffff', borderColor: '#e2e8f0' };
                        cardClasses += 'rounded-xl border text-slate-700 shadow-sm';
                        headerClasses += 'bg-slate-50 border-slate-200 text-slate-800';
                      } else {
                        cardClasses += 'bg-background border border-border rounded-2xl';
                        headerClasses += 'bg-accent/30 border-border';
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
                          {/* Title - Rendered if provided */}
                          {chart.title && chart.type !== 'KPI' && (
                            <div className="px-4 pt-4 pb-0 text-sm font-bold tracking-tight text-inherit">
                              {chart.title}
                            </div>
                          )}

                          {/* Chart Toolbar - Hidden in Full Screen */}
                          {!isFullScreen && (
                            <div className={headerClasses}>
                              <div className="flex items-center gap-2 flex-wrap">
                                <input 
                                  type="text" 
                                  value={chart.title || ''} 
                                  onChange={(e) => updateChart(index, 'title', e.target.value)}
                                  placeholder="Chart Title"
                                  className="bg-transparent border-b border-border/50 focus:border-foreground/50 focus:outline-none w-24 text-[11px] placeholder:opacity-50 text-inherit"
                                />
                                <CustomSelect 
                                  value={chart.type} 
                                  onChange={(val) => updateChart(index, 'type', val)}
                                  options={[
                                    {label: "KPI Card", value: "KPI"},
                                    {label: "Line Chart", value: "Line"},
                                    {label: "Bar Chart", value: "Bar"},
                                    {label: "Area Chart", value: "Area"},
                                    {label: "Scatter Plot", value: "Scatter"},
                                    {label: "Pie Chart", value: "Pie"}
                                  ]}
                                  className="w-[130px]"
                                  triggerClassName="bg-transparent border-none p-1 text-[11px] shadow-none hover:bg-transparent font-bold text-inherit"
                                />
                              </div>
                              
                              <div className="flex items-center gap-2 flex-wrap">
                                {chart.type === 'KPI' ? (
                                  <CustomSelect 
                                    value={chart.aggregation || 'average'}
                                    onChange={(val) => updateChart(index, 'aggregation', val)}
                                    options={[
                                      {label: "Average", value: "average"},
                                      {label: "Sum", value: "sum"},
                                      {label: "Count", value: "count"},
                                      {label: "Maximum", value: "max"},
                                      {label: "Minimum", value: "min"}
                                    ]}
                                    className="w-[100px]"
                                    triggerClassName="bg-transparent border-none p-1 text-[10px] uppercase font-bold shadow-none hover:bg-transparent text-inherit"
                                  />
                                ) : (
                                  <>
                                    <span className="font-mono text-[10px] opacity-70">X:</span>
                                    <CustomSelect 
                                      value={chart.xAxis}
                                      onChange={(val) => updateChart(index, 'xAxis', val)}
                                      options={[{value: "", label: "Axis..."}, ...columns.map(c => ({value: c, label: c}))]}
                                      className="w-[100px]"
                                      triggerClassName="bg-transparent border-none p-1 text-[10px] truncate shadow-none hover:bg-transparent text-inherit font-mono"
                                    />
                                  </>
                                )}
                                <span className="font-mono text-[10px] opacity-70 ml-1">{chart.type === 'KPI' ? 'Metric:' : 'Y:'}</span>
                                <CustomSelect 
                                  value={chart.yAxis}
                                  onChange={(val) => updateChart(index, 'yAxis', val)}
                                  options={[{value: "", label: "Metric..."}, ...columns.map(c => ({value: c, label: c}))]}
                                  className="w-[100px]"
                                  triggerClassName="bg-transparent border-none p-1 text-[10px] truncate shadow-none hover:bg-transparent text-inherit font-mono"
                                />
                              </div>
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
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-accent/20">
                  <LayoutDashboard size={40} className="text-muted-foreground mb-4 opacity-50" />
                  <p className="text-sm text-muted-foreground font-mono">Select a dataset to begin rendering</p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-[20px] shadow-lg w-full max-w-md p-6 relative">
            <button 
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
            <h3 className="text-xl font-bold tracking-tight mb-2 text-foreground font-sans">Share Dashboard</h3>
            <p className="text-xs text-muted-foreground font-sans mb-6">
              Anyone with this link will be able to view this interactive dashboard.
            </p>
            
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-xs font-mono text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">
                {shareLink}
              </div>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-md text-xs font-semibold transition-all shadow-sm flex items-center gap-2"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
