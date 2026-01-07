import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  applyEdgeChanges,
  applyNodeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';

import GameHubNode from './components/GameHubNode/GameHubNode';

const nodeTypes = {
  gameHubNode: GameHubNode,
};

const defaultNodes = [
  {
    id: 'game-hub-1',
    type: 'gameHubNode',
    position: { x: 120, y: 120 },
    data: { label: '🎮 Игровой модуль' },
    // стартовый размер (потом будет меняться)
    width: 520,
    height: 560,
    style: { width: 520, height: 560 },
  },
];

export default function App() {
  const [nodes, setNodes] = useState(defaultNodes);
  const [edges, setEdges] = useState([]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // Вот тут фикс: на resize меняем И style, И width/height
  useEffect(() => {
    const handleResize = (e) => {
      const { nodeId, size } = e.detail || {};
      if (!nodeId || !size) return;

      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== nodeId) return n;

          const w = Number(size.width);
          const h = Number(size.height);

          return {
            ...n,
            width: w,
            height: h,
            style: {
              ...(n.style || {}),
              width: w,
              height: h,
            },
          };
        })
      );
    };

    window.addEventListener('resizeGameNode', handleResize);
    return () => window.removeEventListener('resizeGameNode', handleResize);
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
          nodeDragHandle=".drag-handle"
          fitView
        >
          <Background variant="dots" gap={12} size={1} />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}