import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';

import GameHubNode from './components/GameHubNode/GameHubNode';

const nodeTypes = { gameHubNode: GameHubNode };

const defaultNodes = [
  {
    id: 'hub-1',
    type: 'gameHubNode',
    position: { x: 120, y: 120 },
    data: {
      label: '🎮 Игровой хаб',
      desiredSize: { width: 560, height: 520 }, // меню
    },
    style: { width: 560, height: 520 },
  },
];

const initialEdges = [];

const approxEq = (a, b, eps = 0.5) => Math.abs((a ?? 0) - (b ?? 0)) <= eps;

export default function App() {
  const [nodes, setNodes] = useState(() => {
    const saved = localStorage.getItem('gameNodes');
    return saved ? JSON.parse(saved) : defaultNodes;
  });
  const [edges, setEdges] = useState(initialEdges);

  const rafRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('gameNodes', JSON.stringify(nodes));
  }, [nodes]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // ✅ Меняем размер ноды ТОЛЬКО по событию от GameHubNode (выбор игры/меню)
  useEffect(() => {
    const handler = (e) => {
      const { nodeId, width, height } = e.detail || {};
      if (!nodeId || !width || !height) return;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id !== nodeId) return n;

            const curW = n.style?.width;
            const curH = n.style?.height;

            // если размер фактически тот же — не трогаем
            if (approxEq(curW, width) && approxEq(curH, height)) {
              const desired = n.data?.desiredSize;
              if (desired?.width === width && desired?.height === height) return n;
              return { ...n, data: { ...(n.data || {}), desiredSize: { width, height } } };
            }

            return {
              ...n,
              data: { ...(n.data || {}), desiredSize: { width, height } },
              style: { ...(n.style || {}), width, height },
            };
          })
        );
      });
    };

    window.addEventListener('resizeGameHubNode', handler);
    return () => {
      window.removeEventListener('resizeGameHubNode', handler);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="app">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          nodeDragHandle=".gamehub-drag-handle"
        >
          <Background variant="dots" gap={12} size={1} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}