import React, { useState, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';
import GameNode from './components/GameNode/GameNode';
import GamePanel from './components/GamePanel/GamePanel';

const nodeTypes = {
  gameNode: GameNode,
};

const initialNodes = [
  {
    id: '1',
    type: 'gameNode',
    position: { x: 100, y: 100 },
    data: { 
      label: 'Змейка', 
      gameId: 'snake',
      score: 0 
    },
    draggable: true,
  },
  {
    id: '2',
    type: 'gameNode',
    position: { x: 100, y: 250 },
    data: { 
      label: '2048', 
      gameId: '2048',
      score: 0 
    },
    draggable: true,
  },
  {
    id: '3',
    type: 'gameNode',
    position: { x: 100, y: 400 },
    data: { 
      label: 'Память', 
      gameId: 'memory',
      score: 0 
    },
    draggable: true,
  },
  {
    id: '4',
    type: 'gameNode',
    position: { x: 100, y: 550 },
    data: { 
      label: 'Кликер', 
      gameId: 'clicker',
      score: 0 
    },
    draggable: true,
  },
];

const initialEdges = [];

function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [currentGame, setCurrentGame] = useState(null);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onNodeClick = useCallback((event, node) => {
    setCurrentGame(node.data.gameId);
  }, []);

  return (
    <div className="app">
      <div className="header">
        <h1>Игровой блок на платформе обучения
          
        </h1>
        <p>Перетаскивайте игры • Сохраняйте связи</p>
      </div>
      
      <div className="main-content">
        <div className="flow-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background variant="dots" gap={12} size={1} />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
        
        <div className="game-container">
          <GamePanel currentGame={currentGame} />
        </div>
      </div>
    </div>
  );
}

export default App;