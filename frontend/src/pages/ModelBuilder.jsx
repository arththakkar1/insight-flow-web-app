import React, { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ChevronLeft, Save, Database } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion } from 'motion/react';
import { apiFetch } from '../utils/api';

// Custom Node Component to look like a database table
const TableNode = ({ data }) => {
  return (
    <div className="bg-card rounded-xl shadow-lg border border-border w-56 text-sm group hover:border-primary/50 transition-colors">
      <div className="bg-muted/50 border-b border-border text-foreground p-3 flex items-center font-bold tracking-tight rounded-t-xl">
        <Database className="w-4 h-4 mr-2 text-primary" />
        {data.label}
      </div>
      <div className="p-2 flex flex-col space-y-0 bg-card rounded-b-xl">
        {data.columns.map((col, idx) => (
          <div key={idx} className="flex justify-between items-center relative py-1.5 px-2 hover:bg-accent rounded-md transition-colors">
            <span className="text-foreground text-xs font-sans font-medium truncate pr-2">{col.name}</span>
            <span className="text-[10px] text-muted-foreground font-mono uppercase shrink-0">{col.type}</span>
            <Handle type="source" position={Position.Right} id={`${data.label}-${col.name}-source`} style={{ top: '50%', right: -12, width: 8, height: 8, backgroundColor: 'hsl(var(--primary))', border: '2px solid hsl(var(--background))' }} />
            <Handle type="target" position={Position.Left} id={`${data.label}-${col.name}-target`} style={{ top: '50%', left: -12, width: 8, height: 8, backgroundColor: 'hsl(var(--muted-foreground))', border: '2px solid hsl(var(--background))' }} />
          </div>
        ))}
      </div>
    </div>
  );
};

const nodeTypes = {
  tableNode: TableNode,
};

export default function ModelBuilder() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    fetchLayoutAndProfile();
  }, [projectId]);

  const fetchLayoutAndProfile = async () => {
    try {
      // First try to fetch saved layout
      const layoutRes = await apiFetch(`http://localhost:8000/api/datasets/${projectId}/schema-layout/`);
      if (layoutRes.ok) {
        const layoutData = await layoutRes.json();
        if (layoutData.nodes && layoutData.nodes.length > 0) {
          setNodes(layoutData.nodes);
          setEdges(layoutData.edges || []);
          return;
        }
      }
      
      // If no layout, generate default from profile
      const profRes = await apiFetch(`http://localhost:8000/api/datasets/${projectId}/profile/`, { method: 'POST' });
      if (profRes.ok) {
        const profData = await profRes.json();
        
        const factColumns = [];
        const dimensionNodes = [];
        let dimX = 400;
        let dimY = 100;
        
        profData.columns.forEach(col => {
          if (col.type === 'string' || col.type === 'datetime') {
            const dimLabel = `Dim_${col.name}`;
            dimensionNodes.push({
              id: dimLabel,
              type: 'tableNode',
              position: { x: dimX, y: dimY },
              data: {
                label: dimLabel,
                columns: [{ name: col.name, type: col.type }]
              }
            });
            dimY += 150;
            if (dimY > 600) {
              dimY = 100;
              dimX += 250;
            }
            factColumns.push({ name: `${col.name}_id`, type: 'fk' });
          } else {
            factColumns.push({ name: col.name, type: col.type });
          }
        });

        const initialNodes = [
          {
            id: 'FactTable',
            type: 'tableNode',
            position: { x: 50, y: 150 },
            data: {
              label: `Fact_${profData.dataset_id.split('_')[0]}`,
              columns: factColumns
            }
          },
          ...dimensionNodes
        ];
        
        setNodes(initialNodes);
      }
    } catch (error) {
      console.error("Error fetching model info:", error);
    }
  };

  const saveLayout = async () => {
    try {
      const res = await apiFetch(`http://localhost:8000/api/datasets/${projectId}/schema-layout/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges })
      });
      if (res.ok) {
        alert("Layout saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save layout:", error);
    }
  };

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), [setEdges]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full bg-background font-sans text-foreground min-h-0"
    >
      <div className="flex items-center justify-between p-4 bg-card border-b border-border shrink-0 z-10 shadow-sm relative">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate(`/datasets/${projectId}`)} className="mr-4 text-foreground hover:bg-accent border border-transparent hover:border-border transition-all rounded-full h-9 px-4">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back to Dataset
          </Button>
          <div>
            <h1 className="text-xl font-bold font-sans tracking-tight">Visual Relationship Builder</h1>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-0.5">Drag to connect columns</p>
          </div>
        </div>
        <button onClick={saveLayout} className="flex items-center bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold px-5 py-2.5 rounded-full transition-all active:scale-95 shadow-sm">
          <Save className="w-3.5 h-3.5 mr-2" /> Save Schema
        </button>
      </div>
      
      <div className="flex-1 w-full h-full relative bg-background">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background"
        >
          <Controls className="bg-card border-border shadow-md" />
          <Background variant="dots" gap={16} size={1} color="#a1a1aa" />
        </ReactFlow>
      </div>
    </motion.div>
  );
}
