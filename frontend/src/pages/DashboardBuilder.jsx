import React, { useState, useEffect } from "react";
import { useOutletContext, useParams, useNavigate } from "react-router-dom";
import { CustomSelect } from "../components/ui/Select";
import { apiFetch } from "../utils/api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import {
  LayoutDashboard,
  Play,
  Maximize2,
  LayoutGrid,
  Rows3,
  LayoutTemplate,
  Monitor,
  X,
  Share2,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Calculator,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const getThemeColors = (theme) => {
  switch (theme) {
    case "spotify":
      return [
        "#1db954",
        "#1ed760",
        "#1aa34a",
        "#178a3f",
        "#147234",
        "#105929",
        "#0d401e",
        "#092b13",
      ];
    case "netflix":
      return [
        "#E50914",
        "#B81D24",
        "#DB0000",
        "#831010",
        "#E50914",
        "#B81D24",
        "#DB0000",
        "#831010",
      ];
    case "analytical":
      return [
        "#10b981",
        "#3b82f6",
        "#6366f1",
        "#06b6d4",
        "#f59e0b",
        "#ec4899",
        "#8b5cf6",
        "#14b8a6",
      ];
    case "cyberpunk":
      return [
        "#0ff",
        "#f0f",
        "#39ff14",
        "#fff01f",
        "#00ffcc",
        "#ff0055",
        "#bb00ff",
        "#0055ff",
      ];
    case "ocean":
      return [
        "#0ea5e9",
        "#0284c7",
        "#0369a1",
        "#075985",
        "#38bdf8",
        "#7dd3fc",
        "#bae6fd",
        "#e0f2fe",
      ];
    case "sunset":
      return [
        "#f97316",
        "#ea580c",
        "#c2410c",
        "#9a3412",
        "#fb923c",
        "#fdba74",
        "#fed7aa",
        "#ffedd5",
      ];
    case "dark-enterprise":
      return [
        "#1F77B4",
        "#FF7F0E",
        "#2CA02C",
        "#D62728",
        "#9467BD",
        "#8C564B",
        "#E377C2",
        "#7F7F7F",
      ];
    case "pastel-minimal":
      return [
        "#A8E6CF",
        "#DCEDC1",
        "#FFD3B6",
        "#FFAAA5",
        "#FF8B94",
        "#B2EBF2",
        "#B39DDB",
        "#C5E1A5",
      ];
    default:
      return [
        "#ef4444",
        "#3b82f6",
        "#10b981",
        "#f59e0b",
        "#8b5cf6",
        "#ec4899",
        "#06b6d4",
        "#64748b",
      ];
  }
};

const getFontClass = (font) => {
  switch (font) {
    case "serif":
      return "font-serif";
    case "mono":
      return "font-mono";
    case "geist":
      return "font-sans"; // default sans is usually ok
    case "space":
      return "font-mono tracking-tighter";
    default:
      return "font-sans";
  }
};

export default function DashboardBuilder() {
  const { datasetId } = useParams();
  const navigate = useNavigate();

  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(datasetId || "");
  const [datasetData, setDatasetData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [customMeasures, setCustomMeasures] = useState([]);
  const [showMeasureModal, setShowMeasureModal] = useState(false);
  const [newMeasureName, setNewMeasureName] = useState("");
  const [newMeasureFormula, setNewMeasureFormula] = useState("");
  const [enrichedData, setEnrichedData] = useState([]);

  const [layout, setLayout] = useState("grid-2x2"); // options: 'single', 'grid-2x2', 'split-horizontal', 'spotify-grid', 'executive-summary'
  const [themeStyle, setThemeStyle] = useState("default");
  const [themeFont, setThemeFont] = useState("sans");

  const { isFullScreen, setIsFullScreen } = useOutletContext() || {
    isFullScreen: false,
    setIsFullScreen: () => {},
  };

  const [charts, setCharts] = useState([
    { id: "1", type: "KPI", xAxis: "", yAxis: "" },
    { id: "2", type: "KPI", xAxis: "", yAxis: "" },
    { id: "3", type: "KPI", xAxis: "", yAxis: "" },
    { id: "4", type: "Bar", xAxis: "", yAxis: "" },
    { id: "5", type: "Line", xAxis: "", yAxis: "" },
    { id: "6", type: "Pie", xAxis: "", yAxis: "" },
    { id: "7", type: "Scatter", xAxis: "", yAxis: "" },
  ]);

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("http://localhost:8000/api/datasets/");
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
      const detailsRes = await apiFetch(
        `http://localhost:8000/api/datasets/${dsId}/`,
      );
      if (detailsRes.ok) {
        const detailsData = await detailsRes.json();
        setCustomMeasures(detailsData.custom_measures || []);
      }

      const res = await apiFetch(
        `http://localhost:8000/api/datasets/${dsId}/data/`,
      );
      if (res.ok) {
        const data = await res.json();
        setDatasetData(data.data || []);
        setColumns(data.columns || []);

        if (data.columns && data.columns.length > 0) {
          const defaultX = data.columns[0];
          const defaultY =
            data.columns.length > 1 ? data.columns[1] : data.columns[0];

          setCharts((prev) =>
            prev.map((c) => ({
              ...c,
              xAxis: data.columns.includes(c.xAxis) ? c.xAxis : defaultX,
              yAxis: data.columns.includes(c.yAxis) ? c.yAxis : defaultY,
            })),
          );
        }
      }
    } catch (err) {
      console.error(err);
    }
    setDataLoading(false);
  };

  const saveCustomMeasures = async (measures) => {
    if (!selectedDatasetId) return;
    try {
      await apiFetch(
        `http://localhost:8000/api/datasets/${selectedDatasetId}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ custom_measures: measures }),
        },
      );
    } catch (e) {
      console.error("Failed to save measures", e);
    }
  };

  useEffect(() => {
    // Process custom DAX-like measures
    if (datasetData.length === 0) {
      setEnrichedData([]);
      return;
    }

    // Define DAX-like functions for eval scope
    // eslint-disable-next-line no-unused-vars
    const SUM = (...args) =>
      args.reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0);
    // eslint-disable-next-line no-unused-vars
    const AVERAGE = (...args) => (args.length ? SUM(...args) / args.length : 0);
    // eslint-disable-next-line no-unused-vars
    const MAX = (...args) => Math.max(...args.map((a) => Number(a) || 0));
    // eslint-disable-next-line no-unused-vars
    const MIN = (...args) => Math.min(...args.map((a) => Number(a) || 0));
    // eslint-disable-next-line no-unused-vars
    const IF = (condition, t, f) => (condition ? t : f);
    // eslint-disable-next-line no-unused-vars
    const DIVIDE = (num, den, alt = 0) =>
      Number(den) === 0 ? alt : Number(num) / Number(den);
    try {
      // helper to escape column names safely for regex
      const escapeRegExp = (s) =>
        String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // sort columns by length desc so that longer names are replaced before shorter ones (avoid partial matches)
      const sortedCols = [...columns].sort((a, b) => b.length - a.length);

      const newData = datasetData.map((row) => {
        const newRow = { ...row };
        customMeasures.forEach((measure) => {
          try {
            let formula = measure.formula || "";

            // replace column references with literal values (numbers stay numbers, strings become quoted)
            sortedCols.forEach((col) => {
              if (!col) return;
              if (formula.includes(col)) {
                const raw = row[col];
                let replacement;
                if (raw === null || raw === undefined || raw === "") {
                  replacement = 0;
                } else if (!isNaN(Number(raw))) {
                  replacement = Number(raw);
                } else {
                  // quote strings safely
                  const safe = String(raw).replace(/'/g, "\\'");
                  replacement = `'${safe}'`;
                }
                const regex = new RegExp(escapeRegExp(col), "g");
                formula = formula.replace(regex, replacement);
              }
            });

            // include SUM and AVERAGE in the evaluator scope so formulas using them work
            const computeFormula = new Function(
              "SUM",
              "AVERAGE",
              "MAX",
              "MIN",
              "IF",
              "DIVIDE",
              "Number",
              "return " + formula,
            );
            const result = computeFormula(
              SUM,
              AVERAGE,
              MAX,
              MIN,
              IF,
              DIVIDE,
              Number,
            );

            if (typeof result === "number" && isFinite(result)) {
              newRow[measure.name] = result;
            } else if (!isNaN(Number(result))) {
              newRow[measure.name] = Number(result);
            } else {
              // non-numeric results fallback to 0 for charting/aggregations
              newRow[measure.name] = 0;
            }
          } catch (e) {
            newRow[measure.name] = 0;
          }
        });
        return newRow;
      });
      setEnrichedData(newData);
    } catch (e) {
      setEnrichedData(datasetData);
    }
  }, [datasetData, customMeasures, columns]);

  const allColumns = [...columns, ...customMeasures.map((m) => m.name)];
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [columnModalChartIndex, setColumnModalChartIndex] = useState(null);
  const [columnModalField, setColumnModalField] = useState("");

  const openColumnModal = (chartIndex, field) => {
    setColumnModalChartIndex(chartIndex);
    setColumnModalField(field);
    setShowColumnModal(true);
  };

  const closeColumnModal = () => {
    setShowColumnModal(false);
    setColumnModalChartIndex(null);
    setColumnModalField("");
  };

  const selectColumnForChart = (value) => {
    if (columnModalChartIndex !== null && columnModalField) {
      updateChart(columnModalChartIndex, columnModalField, value);
    }
    closeColumnModal();
  };

  useEffect(() => {
    if (datasetId) {
      loadDatasetData(datasetId);
      setSelectedDatasetId(datasetId);
    } else {
      setSelectedDatasetId("");
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
        charts,
      };
      const res = await apiFetch("http://localhost:8000/api/dashboard/share/", {
        method: "POST",
        body: JSON.stringify(payload),
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

  const generateDashboardWithAI = async () => {
    if (!selectedDatasetId) return;
    setIsGeneratingAI(true);
    try {
      const res = await apiFetch(
        `http://localhost:8000/api/datasets/${selectedDatasetId}/generate-dashboard/`,
        {
          method: "POST",
        },
      );
      if (res.ok) {
        const config = await res.json();
        if (config.layout) setLayout(config.layout);
        if (config.theme_style) setThemeStyle(config.theme_style);
        if (config.theme_font) setThemeFont(config.theme_font);
        if (config.custom_measures) {
          setCustomMeasures(config.custom_measures);
          saveCustomMeasures(config.custom_measures);
        }
        if (config.charts) {
          // Merge AI charts with existing array (override first ones, keep rest if any)
          const newCharts = [...charts];
          config.charts.forEach((aiChart, idx) => {
            if (idx < newCharts.length) {
              newCharts[idx] = { ...newCharts[idx], ...aiChart };
            }
          });
          setCharts(newCharts);
        }
      } else {
        console.error("AI Generation failed");
      }
    } catch (err) {
      console.error(err);
    }
    setIsGeneratingAI(false);
  };

  const handleDatasetSelect = (dsId) => {
    if (!dsId) {
      navigate("/dashboard-builder");
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
    if (!enrichedData || enrichedData.length === 0) {
      return (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm font-mono">
          No Data
        </div>
      );
    }
    if (chartConfig.type === "KPI") {
      if (!chartConfig.yAxis) {
        return (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm font-mono">
            Configure Metric (Y-Axis)
          </div>
        );
      }
    } else {
      if (!chartConfig.xAxis || !chartConfig.yAxis) {
        return (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm font-mono">
            Configure Axes
          </div>
        );
      }
    }

    const { type, xAxis, yAxis, topN } = chartConfig;
    const color = currentColors[index % currentColors.length];

    const CustomTooltipStyle = {
      backgroundColor:
        themeStyle === "spotify"
          ? "#121212"
          : themeStyle === "netflix" || themeStyle === "cyberpunk"
            ? "#000"
            : themeStyle === "analytical"
              ? "#fff"
              : "var(--card)",
      borderColor:
        themeStyle === "spotify"
          ? "#282828"
          : themeStyle === "netflix" || themeStyle === "cyberpunk"
            ? "#333"
            : "var(--border)",
      borderRadius: "8px",
      color:
        themeStyle === "spotify"
          ? "#fff"
          : themeStyle === "netflix" || themeStyle === "cyberpunk"
            ? "#fff"
            : "inherit",
      boxShadow:
        themeStyle === "cyberpunk"
          ? "0 0 10px rgba(0, 255, 255, 0.2)"
          : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    };

    let chartData = [...enrichedData];
    if (topN && type !== "KPI" && type !== "Pie") {
      const limit = parseInt(topN, 10);
      if (!isNaN(limit)) {
        chartData = chartData
          .sort((a, b) => (Number(b[yAxis]) || 0) - (Number(a[yAxis]) || 0))
          .slice(0, limit);
      }
    }

    switch (type) {
      case "KPI": {
        let value = 0;
        const validData = enrichedData.filter(
          (d) => d[yAxis] !== null && d[yAxis] !== undefined && d[yAxis] !== "",
        );
        if (validData.length > 0) {
          const sum = validData.reduce(
            (acc, curr) => acc + (Number(curr[yAxis]) || 0),
            0,
          );
          if (chartConfig.aggregation === "sum") value = sum;
          else if (chartConfig.aggregation === "count")
            value = validData.length;
          else if (chartConfig.aggregation === "max")
            value = Math.max(...validData.map((d) => Number(d[yAxis]) || 0));
          else if (chartConfig.aggregation === "min")
            value = Math.min(...validData.map((d) => Number(d[yAxis]) || 0));
          else value = sum / validData.length; // default average
        }

        // Pseudo-trend logic (just for visual conditional formatting)
        const isPositive = value > 0;
        const TrendIcon =
          value === 0 ? Minus : isPositive ? TrendingUp : TrendingDown;
        const trendColor =
          value === 0
            ? "text-muted-foreground"
            : isPositive
              ? "text-success"
              : "text-destructive";

        return (
          <div className="flex flex-col items-center justify-center h-full w-full p-4 text-center relative">
            {value !== 0 && (
              <div
                className={`absolute top-4 right-4 ${trendColor} bg-background/50 p-1.5 rounded-full`}
              >
                <TrendIcon size={16} />
              </div>
            )}
            <span
              className="text-4xl md:text-5xl font-bold tracking-tighter drop-shadow-sm"
              style={{
                color: color,
                textShadow:
                  themeStyle === "cyberpunk" || themeStyle === "dark-enterprise"
                    ? `0 0 10px ${color}55`
                    : "none",
              }}
            >
              {value % 1 !== 0 ? value.toFixed(2) : value}
            </span>
            <span className="text-[10px] md:text-xs uppercase tracking-widest opacity-60 mt-3 font-semibold text-inherit">
              {chartConfig.title
                ? chartConfig.title
                : `${chartConfig.aggregation || "average"} ${yAxis}`}
            </span>
          </div>
        );
      }
      case "Line": {
        const sortedLineData = [...chartData].sort((a, b) =>
          a[xAxis] > b[xAxis] ? 1 : -1,
        );
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={sortedLineData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#333"
                opacity={0.2}
              />
              <XAxis dataKey={xAxis} tick={{ fontSize: 10 }} name={xAxis} />
              <YAxis tick={{ fontSize: 10 }} name={yAxis} />
              <RechartsTooltip cursor={false} contentStyle={CustomTooltipStyle} />
              <Legend />
              <Line
                type="monotone"
                dataKey={yAxis}
                stroke={color}
                strokeWidth={3}
                dot={{ r: 4, fill: color, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      }
      case "Bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#333"
                opacity={0.2}
              />
              <XAxis dataKey={xAxis} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <RechartsTooltip
                cursor={false}
                contentStyle={CustomTooltipStyle}
              />
              <Legend />
              <Bar dataKey={yAxis} fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case "Area": {
        const sortedAreaData = [...chartData].sort((a, b) =>
          a[xAxis] > b[xAxis] ? 1 : -1,
        );
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sortedAreaData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#333"
                opacity={0.2}
              />
              <XAxis dataKey={xAxis} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <RechartsTooltip cursor={false} contentStyle={CustomTooltipStyle} />
              <Legend />
              <Area
                type="monotone"
                dataKey={yAxis}
                fill={color}
                stroke={color}
                fillOpacity={0.4}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      }
      case "Scatter":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#333"
                opacity={0.2}
              />
              <XAxis dataKey={xAxis} tick={{ fontSize: 10 }} name={xAxis} />
              <YAxis dataKey={yAxis} tick={{ fontSize: 10 }} name={yAxis} />
              <RechartsTooltip
                cursor={false}
                contentStyle={CustomTooltipStyle}
              />
              <Legend />
              <Scatter
                name={`${xAxis} vs ${yAxis}`}
                data={chartData}
                fill={color}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );
      case "Pie": {
        const aggs = {};
        enrichedData.forEach((d) => {
          const k = d[xAxis];
          const v = Number(d[yAxis]) || 0;
          if (k) aggs[k] = (aggs[k] || 0) + v;
        });
        const limit = topN ? parseInt(topN, 10) : 10;
        const pieData = Object.keys(aggs)
          .map((k) => ({ name: k, value: aggs[k] }))
          .sort((a, b) => b.value - a.value)
          .slice(0, limit);

        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <RechartsTooltip cursor={false} contentStyle={CustomTooltipStyle} />
              <Legend />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="40%"
                outerRadius="80%"
                stroke="none"
              >
                {pieData.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={currentColors[idx % currentColors.length]}
                  />
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
      case "single":
        return "grid-cols-1";
      case "split-horizontal":
        return "grid-cols-1 lg:grid-cols-1";
      case "grid-2x2":
        return "grid-cols-1 md:grid-cols-2";
      case "spotify-grid":
        return "grid-cols-1 md:grid-cols-4";
      case "executive-summary":
        return "grid-cols-1 md:grid-cols-12";
      default:
        return "grid-cols-1 md:grid-cols-2";
    }
  };

  const getSlotClass = (index) => {
    if (layout === "spotify-grid") {
      switch (index) {
        case 0:
          return "col-span-1 md:col-span-1 min-h-[120px]";
        case 1:
          return "col-span-1 md:col-span-2 min-h-[120px]";
        case 2:
          return "col-span-1 md:col-span-1 min-h-[120px]";
        case 3:
          return "col-span-1 md:col-span-1 md:row-span-2 min-h-[250px]";
        case 4:
          return "col-span-1 md:col-span-3 min-h-[250px]";
        case 5:
          return "col-span-1 md:col-span-1 min-h-[250px]";
        case 6:
          return "col-span-1 md:col-span-2 min-h-[250px]";
        default:
          return "col-span-1";
      }
    }
    if (layout === "executive-summary") {
      if (index >= 0 && index <= 3)
        return "col-span-1 md:col-span-3 min-h-[140px]";
      if (index === 4) return "col-span-1 md:col-span-8 min-h-[350px]";
      if (index === 5) return "col-span-1 md:col-span-4 min-h-[350px]";
      if (index === 6) return "col-span-1 md:col-span-12 min-h-[300px]";
      return "col-span-1 md:col-span-12";
    }
    return layout === "single" ? "min-h-[500px]" : "min-h-[300px]";
  };

  const getVisibleCharts = () => {
    switch (layout) {
      case "single":
        return charts.slice(0, 1);
      case "split-horizontal":
        return charts.slice(0, 2);
      case "spotify-grid":
        return charts.slice(0, 7);
      case "executive-summary":
        return charts.slice(0, 7);
      case "grid-2x2":
      default:
        return charts.slice(0, 4);
    }
  };

  const themeColors = getThemeColors(themeStyle);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const getFullscreenBg = () => {
    if (themeStyle === "spotify") return "bg-[#121212]";
    if (themeStyle === "netflix") return "bg-[#141414]";
    if (themeStyle === "analytical") return "bg-[#f8fafc]";
    if (themeStyle === "cyberpunk") return "bg-[#0B0C10]";
    if (themeStyle === "ocean") return "bg-[#0f172a]";
    return "bg-background";
  };

  return (
    <div
      className={`transition-colors duration-500 min-h-full flex flex-col overflow-y-auto ${isFullScreen ? `${getFullscreenBg()} fixed inset-0 z-[100]` : "bg-background pb-20 md:pb-0"} text-foreground ${getFontClass(themeFont)}`}
    >
      {isFullScreen && (
        <button
          onClick={toggleFullScreen}
          className="fixed top-4 right-4 z-[110] bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-all shadow-lg cursor-pointer"
        >
          <X size={24} />
        </button>
      )}

      <div
        className={`${isFullScreen ? "p-4 md:p-8 max-w-[1600px] min-h-0 h-full" : "max-w-7xl p-4 md:p-8"} mx-auto w-full flex flex-col flex-1`}
      >
        {/* Header - Hidden in Full Screen */}
        {!isFullScreen && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6 mb-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-destructive to-destructive flex items-center justify-center text-destructive-foreground shadow-lg">
                <LayoutDashboard size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Interactive Dashboard
                </h1>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mt-1">
                  Configure & Visualize your Data
                </p>
              </div>
            </div>

            {/* Theming Controls */}
            <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-2 shadow-sm min-w-[300px]">
              <CustomSelect
                value={themeStyle}
                onChange={setThemeStyle}
                options={[
                  { value: "default", label: "Default Theme" },
                  { value: "spotify", label: "Spotify Dark" },
                  { value: "netflix", label: "Netflix Red" },
                  { value: "analytical", label: "Analytical Light" },
                  { value: "cyberpunk", label: "Neon Cyberpunk" },
                  { value: "ocean", label: "Ocean Blue" },
                  { value: "sunset", label: "Sunset Orange" },
                  {
                    value: "dark-enterprise",
                    label: "Dark Enterprise (Vault)",
                  },
                  { value: "pastel-minimal", label: "Pastel Minimal (Vault)" },
                ]}
                className="w-[140px]"
                triggerClassName="bg-transparent border-none p-1 text-xs shadow-none hover:bg-transparent text-foreground"
              />
              <div className="w-px h-4 bg-border"></div>
              <CustomSelect
                value={themeFont}
                onChange={setThemeFont}
                options={[
                  { value: "sans", label: "Sans Serif" },
                  { value: "serif", label: "Serif" },
                  { value: "mono", label: "Monospace" },
                  { value: "space", label: "Space Grotesk" },
                ]}
                className="w-[130px]"
                triggerClassName="bg-transparent border-none p-1 text-xs shadow-none hover:bg-transparent text-foreground"
              />
            </div>
          </div>
        )}

        <div
          className={`grid grid-cols-1 ${!isFullScreen ? "lg:grid-cols-4" : ""} gap-6 flex-1 min-h-0`}
        >
          {/* Controls Panel - Hidden in Full Screen */}
          {!isFullScreen && (
            <div className="lg:col-span-1 space-y-6">
              {/* Dataset Selection */}
              <div className="bg-card border border-border p-5 rounded-[20px] shadow-sm">
                <h2 className="text-sm font-bold mb-4 font-mono uppercase tracking-wider">
                  1. Select Dataset
                </h2>
                <CustomSelect
                  value={String(selectedDatasetId)}
                  onChange={handleDatasetSelect}
                  placeholder="-- Choose a Dataset --"
                  options={datasets.map((ds) => ({
                    value: String(ds.id),
                    label: `${ds.name} (${ds.rows_count} rows)`,
                  }))}
                  className="w-full"
                />
                {dataLoading && (
                  <p className="text-xs text-muted-foreground mt-3 font-mono animate-pulse">
                    Fetching dataset records...
                  </p>
                )}

                {selectedDatasetId && (
                  <button
                    onClick={generateDashboardWithAI}
                    disabled={isGeneratingAI || dataLoading}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white p-3 rounded-xl shadow-md transition-all font-bold disabled:opacity-50"
                  >
                    {isGeneratingAI ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Generating...
                      </span>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        AI Autopilot
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Layout Selection */}
              <div className="bg-card border border-border p-5 rounded-[20px] shadow-sm">
                <h2 className="text-sm font-bold mb-4 font-mono uppercase tracking-wider">
                  2. Choose Layout
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setLayout("single")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${layout === "single" ? "bg-destructive/10 border-destructive text-destructive" : "bg-background border-border hover:bg-accent hover:border-foreground/30"}`}
                  >
                    <Maximize2 size={16} className="mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Single
                    </span>
                  </button>
                  <button
                    onClick={() => setLayout("split-horizontal")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${layout === "split-horizontal" ? "bg-destructive/10 border-destructive text-destructive" : "bg-background border-border hover:bg-accent hover:border-foreground/30"}`}
                  >
                    <Rows3 size={16} className="mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Split
                    </span>
                  </button>
                  <button
                    onClick={() => setLayout("grid-2x2")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${layout === "grid-2x2" ? "bg-destructive/10 border-destructive text-destructive" : "bg-background border-border hover:bg-accent hover:border-foreground/30"}`}
                  >
                    <LayoutGrid size={16} className="mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      2x2
                    </span>
                  </button>
                  <button
                    onClick={() => setLayout("spotify-grid")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${layout === "spotify-grid" ? "bg-[#1db954]/20 border-[#1db954] text-[#1db954]" : "bg-background border-border hover:bg-accent hover:border-foreground/30"}`}
                  >
                    <LayoutTemplate size={16} className="mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center">
                      Spotify
                      <br />
                      Template
                    </span>
                  </button>
                  <button
                    onClick={() => setLayout("executive-summary")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${layout === "executive-summary" ? "bg-[#1F77B4]/20 border-[#1F77B4] text-[#1F77B4]" : "bg-background border-border hover:bg-accent hover:border-foreground/30"}`}
                  >
                    <LayoutTemplate size={16} className="mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center">
                      Exec
                      <br />
                      Summary
                    </span>
                  </button>
                </div>
              </div>

              {/* Custom Measures */}
              <div className="bg-card border border-border p-5 rounded-[20px] shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-bold font-mono uppercase tracking-wider">
                    3. Custom Measures
                  </h2>
                  <button
                    onClick={() => setShowMeasureModal(true)}
                    className="p-1 bg-accent hover:bg-foreground hover:text-background rounded-md transition-colors"
                    title="Add DAX Measure"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {customMeasures.length === 0 ? (
                  <p className="text-xs text-muted-foreground font-mono">
                    No custom measures defined.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {customMeasures.map((m, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center bg-background border border-border p-2 rounded-lg"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="text-[11px] font-bold truncate">
                            {m.name}
                          </div>
                          <div className="text-[9px] font-mono text-muted-foreground truncate">
                            {m.formula}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const updated = customMeasures.filter(
                              (_, idx) => idx !== i,
                            );
                            setCustomMeasures(updated);
                            saveCustomMeasures(updated);
                          }}
                          className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Configuration & Preview */}
          <div
            className={`${!isFullScreen ? "lg:col-span-3" : "w-full"} flex flex-col min-h-0 h-full`}
          >
            <div
              className={`flex-1 flex flex-col min-h-0 overflow-hidden ${!isFullScreen ? "bg-card border border-border p-5 rounded-[20px] shadow-sm" : ""}`}
            >
              {!isFullScreen && (
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-bold font-mono uppercase tracking-wider flex items-center gap-2">
                    <Play size={14} className="text-destructive" /> 4. Live
                    Dashboard Render
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleShare}
                      disabled={!selectedDatasetId || isSharing}
                      className="flex items-center gap-2 bg-card border border-border text-foreground px-4 py-2 rounded-lg text-xs font-bold hover:bg-accent disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                    >
                      <Share2 size={14} />{" "}
                      {isSharing ? "Generating..." : "Share"}
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
                <div className={`grid ${getGridClass()} gap-4 flex-1 p-1`}>
                  <AnimatePresence mode="popLayout">
                    {getVisibleCharts().map((chart, index) => {
                      const isSpotify = themeStyle === "spotify";
                      const isNetflix = themeStyle === "netflix";
                      const isCyberpunk = themeStyle === "cyberpunk";
                      const isAnalytical = themeStyle === "analytical";
                      const isDarkEnterprise = themeStyle === "dark-enterprise";
                      const isPastelMinimal = themeStyle === "pastel-minimal";

                      let cardStyle = {};
                      let cardClasses = `flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow ${getSlotClass(index)} `;
                      let headerClasses = `px-3 py-2 border-b flex flex-wrap gap-2 items-center justify-between text-xs `;

                      if (isSpotify) {
                        cardStyle = {
                          backgroundColor: "#181818",
                          borderColor: "#282828",
                        };
                        cardClasses += "rounded-lg border text-[#b3b3b3]";
                        headerClasses +=
                          "bg-[#282828] border-[#333] text-white";
                      } else if (isNetflix) {
                        cardStyle = {
                          backgroundColor: "#1f1f1f",
                          borderColor: "#333",
                        };
                        cardClasses +=
                          "rounded-md border text-[#d2d2d2] shadow-lg";
                        headerClasses +=
                          "bg-[#141414] border-[#333] text-white";
                      } else if (isCyberpunk) {
                        cardStyle = {
                          backgroundColor: "#1F2833",
                          borderColor: "#45A29E",
                          boxShadow: "0 0 10px rgba(69, 162, 158, 0.2)",
                        };
                        cardClasses += "rounded-xl border text-[#C5C6C7]";
                        headerClasses +=
                          "bg-[#0B0C10] border-[#45A29E] text-white";
                      } else if (isDarkEnterprise) {
                        cardStyle = {
                          backgroundColor: "#1A1A24",
                          borderColor: "#2D2D3D",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        };
                        cardClasses += "rounded-[4px] border text-[#E0E0E0]";
                        headerClasses +=
                          "bg-[#1A1A24] border-[#2D2D3D] text-[#E0E0E0]";
                      } else if (isPastelMinimal) {
                        cardStyle = {
                          backgroundColor: "#FDFBF7",
                          borderColor: "#E8E4D9",
                          boxShadow: "none",
                        };
                        cardClasses += "rounded-[16px] border text-[#4A4A4A]";
                        headerClasses +=
                          "bg-[#FDFBF7] border-[#E8E4D9] text-[#4A4A4A]";
                      } else if (isAnalytical) {
                        cardStyle = {
                          backgroundColor: "#ffffff",
                          borderColor: "#e2e8f0",
                        };
                        cardClasses +=
                          "rounded-xl border text-slate-700 shadow-sm";
                        headerClasses +=
                          "bg-slate-50 border-slate-200 text-slate-800";
                      } else {
                        cardClasses +=
                          "bg-background border border-border rounded-2xl";
                        headerClasses += "bg-accent/30 border-border";
                      }

                      return (
                        <motion.div
                          key={chart.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{
                            duration: 0.4,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className={cardClasses}
                          style={cardStyle}
                        >
                          {/* Title - Rendered if provided */}
                          {chart.title && chart.type !== "KPI" && (
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
                                  value={chart.title || ""}
                                  onChange={(e) =>
                                    updateChart(index, "title", e.target.value)
                                  }
                                  placeholder="Chart Title"
                                  className="bg-transparent border-b border-border/50 focus:border-foreground/50 focus:outline-none w-24 text-[11px] placeholder:opacity-50 text-inherit"
                                />
                                <CustomSelect
                                  value={chart.type}
                                  onChange={(val) =>
                                    updateChart(index, "type", val)
                                  }
                                  options={[
                                    { label: "KPI Card", value: "KPI" },
                                    { label: "Line Chart", value: "Line" },
                                    { label: "Bar Chart", value: "Bar" },
                                    { label: "Area Chart", value: "Area" },
                                    { label: "Scatter Plot", value: "Scatter" },
                                    { label: "Pie Chart", value: "Pie" },
                                  ]}
                                  className="w-[130px]"
                                  triggerClassName="bg-transparent border-none p-1 text-[11px] shadow-none hover:bg-transparent font-bold text-inherit"
                                />
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                {chart.type === "KPI" ? (
                                  <CustomSelect
                                    value={chart.aggregation || "average"}
                                    onChange={(val) =>
                                      updateChart(index, "aggregation", val)
                                    }
                                    options={[
                                      { label: "Average", value: "average" },
                                      { label: "Sum", value: "sum" },
                                      { label: "Count", value: "count" },
                                      { label: "Maximum", value: "max" },
                                      { label: "Minimum", value: "min" },
                                    ]}
                                    className="w-[100px]"
                                    triggerClassName="bg-transparent border-none p-1 text-[10px] uppercase font-bold shadow-none hover:bg-transparent text-inherit"
                                  />
                                ) : (
                                  <>
                                    <span className="font-mono text-[10px] opacity-70">
                                      X:
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openColumnModal(index, "xAxis")
                                      }
                                      className="w-[100px] bg-transparent border-none p-1 text-[10px] truncate hover:bg-accent/5 text-inherit font-mono text-left"
                                    >
                                      {chart.xAxis || "Axis..."}
                                    </button>
                                  </>
                                )}
                                <span className="font-mono text-[10px] opacity-70 ml-1">
                                  {chart.type === "KPI" ? "Metric:" : "Y:"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    openColumnModal(index, "yAxis")
                                  }
                                  className="w-[100px] bg-transparent border-none p-1 text-[10px] truncate hover:bg-accent/5 text-inherit font-mono text-left"
                                >
                                  {chart.yAxis || "Metric..."}
                                </button>
                                {chart.type !== "KPI" && (
                                  <>
                                    <span className="font-mono text-[10px] opacity-70 ml-1">
                                      Limit:
                                    </span>
                                    <CustomSelect
                                      value={chart.topN || ""}
                                      onChange={(val) =>
                                        updateChart(index, "topN", val)
                                      }
                                      options={[
                                        { value: "", label: "All" },
                                        { value: "5", label: "Top 5" },
                                        { value: "10", label: "Top 10" },
                                        { value: "20", label: "Top 20" },
                                        { value: "50", label: "Top 50" },
                                      ]}
                                      className="w-[80px]"
                                      triggerClassName="bg-transparent border-none p-1 text-[10px] uppercase shadow-none hover:bg-transparent text-inherit font-mono"
                                    />
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Chart Render Area */}
                          <div
                            className={`flex-1 ${chart.type !== "KPI" ? "p-4 pb-6" : "p-0"} min-h-0 relative`}
                          >
                            {renderChart(chart, index, themeColors)}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-accent/20">
                  <LayoutDashboard
                    size={40}
                    className="text-muted-foreground mb-4 opacity-50"
                  />
                  <p className="text-sm text-muted-foreground font-mono">
                    Select a dataset to begin rendering
                  </p>
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
            <h3 className="text-xl font-bold tracking-tight mb-2 text-foreground font-sans">
              Share Dashboard
            </h3>
            <p className="text-xs text-muted-foreground font-sans mb-6">
              Anyone with this link will be able to view this interactive
              dashboard.
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
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showMeasureModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-[20px] shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowMeasureModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
            <h3 className="text-xl font-bold tracking-tight mb-2 text-foreground font-sans flex items-center gap-2">
              <Calculator size={20} className="text-destructive" /> New DAX-like
              Measure
            </h3>
            <p className="text-xs text-muted-foreground font-sans mb-6">
              Create a custom column by applying mathematical formulas to
              existing columns (e.g.,{" "}
              <code className="font-mono bg-accent p-0.5 rounded">
                Sales - Cost
              </code>
              ).
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase font-mono tracking-wider mb-1 block text-muted-foreground">
                  Measure Name
                </label>
                <input
                  type="text"
                  value={newMeasureName}
                  onChange={(e) => setNewMeasureName(e.target.value)}
                  placeholder="e.g. Profit Margin"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-destructive transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase font-mono tracking-wider mb-1 block text-muted-foreground">
                  Formula
                </label>
                <input
                  type="text"
                  value={newMeasureFormula}
                  onChange={(e) => setNewMeasureFormula(e.target.value)}
                  placeholder="e.g. Sales - Cost"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-destructive transition-colors"
                />

                {(() => {
                  const daxFunctions = [
                    "SUM",
                    "AVERAGE",
                    "MAX",
                    "MIN",
                    "IF",
                    "DIVIDE",
                  ];
                  const allSuggestions = [...columns, ...daxFunctions];

                  const parts = newMeasureFormula.split(/([\s+\-*/(),]+)/);
                  const lastWord = parts[parts.length - 1];
                  const showSuggestions = lastWord.length > 0;
                  const suggestions = showSuggestions
                    ? allSuggestions.filter(
                        (c) =>
                          c.toLowerCase().includes(lastWord.toLowerCase()) &&
                          c !== lastWord,
                      )
                    : [];

                  return (
                    <div className="mt-2 min-h-[32px]">
                      {showSuggestions && suggestions.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 items-center bg-destructive/10 p-2 rounded-lg border border-destructive/20 animate-in fade-in zoom-in-95 duration-200">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-destructive mr-1">
                            Suggest:
                          </span>
                          {suggestions.map((col) => (
                            <button
                              key={col}
                              onClick={() => {
                                const newParts = [...parts];
                                const isFunc = daxFunctions.includes(col);
                                newParts[newParts.length - 1] =
                                  col + (isFunc ? "(" : " ");
                                setNewMeasureFormula(newParts.join(""));
                              }}
                              className={`px-2 py-1 bg-background border border-border text-foreground rounded hover:border-destructive hover:text-destructive text-[10px] font-mono transition-all shadow-sm ${daxFunctions.includes(col) ? "text-destructive/80 font-bold" : ""}`}
                            >
                              {col}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[10px] text-muted-foreground p-1 space-y-2">
                          <p>
                            Available columns:{" "}
                            <span className="font-mono bg-accent/50 p-0.5 rounded text-foreground">
                              {columns.join(", ")}
                            </span>
                          </p>
                          <p>
                            DAX Functions:{" "}
                            <span className="font-mono bg-accent/50 p-0.5 rounded text-foreground">
                              {daxFunctions.join(", ")}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    if (newMeasureName && newMeasureFormula) {
                      const updated = [
                        ...customMeasures,
                        { name: newMeasureName, formula: newMeasureFormula },
                      ];
                      setCustomMeasures(updated);
                      saveCustomMeasures(updated);
                      setNewMeasureName("");
                      setNewMeasureFormula("");
                      setShowMeasureModal(false);
                    }
                  }}
                  disabled={!newMeasureName || !newMeasureFormula}
                  className="w-full px-4 py-2 bg-destructive text-destructive-foreground hover:opacity-90 rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  Create Measure
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showColumnModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-card border border-border/50 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={closeColumnModal}
              className="absolute top-4 right-4 p-2 bg-muted/20 hover:bg-muted/50 rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
            <div className="flex flex-col gap-1 mb-5">
              <h4 className="text-lg font-bold text-foreground font-display tracking-tight">Choose Column</h4>
              <p className="text-sm text-muted-foreground">
                Select a data column to assign to this chart control.
              </p>
            </div>

            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              <button
                onClick={() => selectColumnForChart("")}
                className="group flex items-center justify-between w-full px-4 py-3 bg-surface-soft border border-border/50 rounded-xl hover:border-primary/30 hover:bg-accent/50 hover:shadow-sm transition-all text-left"
              >
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">None</span>
              </button>
              {allColumns.map((c) => (
                <button
                  key={c}
                  onClick={() => selectColumnForChart(c)}
                  className="group flex items-center justify-between w-full px-4 py-3 bg-surface-soft border border-border/50 rounded-xl hover:border-primary/30 hover:bg-accent/50 hover:shadow-sm transition-all text-left"
                >
                  <span className="text-sm font-semibold text-foreground">{c}</span>
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
