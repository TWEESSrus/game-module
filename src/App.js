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
    style: { width: 520, height: 560 },
  },
];

export default function App() {
  const [nodes, setNodes] = useState(defaultNodes);
  const [edges, setEdges] = useState([]);

  // overlay state (развернутая игра)
  const [overlay, setOverlay] = useState({
    open: false,
    gameId: 'snake',
    gameTitle: '',
  });

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // слушаем запрос на открытие/закрытие overlay от GameHubNode
  useEffect(() => {
    const openOverlay = (e) => {
      const d = e?.detail || {};
      setOverlay({
        open: true,
        gameId: d.gameId || 'snake',
        gameTitle: d.gameTitle || '',
      });
    };

    const closeOverlay = () => {
      setOverlay((prev) => ({ ...prev, open: false }));
    };

    window.addEventListener('openGameOverlay', openOverlay);
    window.addEventListener('closeGameOverlay', closeOverlay);

    // ESC закрывает
    const onKeyDown = (ev) => {
      if (ev.key === 'Escape') closeOverlay();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('openGameOverlay', openOverlay);
      window.removeEventListener('closeGameOverlay', closeOverlay);
      window.removeEventListener('keydown', onKeyDown);
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
          nodeDragHandle=".drag-handle"
          fitView
        >
          <Background variant="dots" gap={12} size={1} />
          <MiniMap />
          <Controls />
        </ReactFlow>

        {overlay.open && (
          <div className="game-overlay nodrag">
            <div className="game-overlay-header drag-handle" style={{ cursor: 'default' }}>
              <div className="game-overlay-title">
                {overlay.gameTitle ? overlay.gameTitle : '🎮 Игра'}
              </div>
              <button
                className="game-overlay-close nodrag"
                onClick={() => window.dispatchEvent(new CustomEvent('closeGameOverlay'))}
                title="Закрыть (Esc)"
              >
                ✖
              </button>
            </div>

            <div className="game-overlay-body nodrag">
              {/* GameHubNode сам отрендерит нужную игру в режиме overlay */}
              <GameHubNode
                id="overlay"
                data={{ label: 'overlay' }}
                selected={false}
                // спец-флаг, чтобы нода не работала как нода, а как контейнер игры
                overlayMode
                overlayGameId={overlay.gameId}
              />
            </div>
          </div>
        )}
      </ReactFlowProvider>
    </div>
  );
}