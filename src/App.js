import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';
import GameNode from './components/GameNode/GameNode';
import GamePanel from './components/GamePanel/GamePanel';

const nodeTypes = {
  gameNode: GameNode,
};

// Начальные узлы по умолчанию
const defaultNodes = [
  {
    id: '1',
    type: 'gameNode',
    position: { x: 100, y: 100 },
    data: { 
      label: 'Змейка', 
      gameId: 'snake',
      score: 0 
    },
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
  },
  {
    id: '5',
    type: 'gameNode',
    position: { x: 100, y: 700 },
    data: { 
      label: 'Пинг-Понг', 
      gameId: 'pong',
      score: 0 
    },
  }
];

const initialEdges = [];

function App() {
  // Загружаем сохраненные узлы или используем начальные
  const [nodes, setNodes] = useState(() => {
    const savedNodes = localStorage.getItem('gameNodes');
    return savedNodes ? JSON.parse(savedNodes) : defaultNodes;
  });
  
  const [edges, setEdges] = useState(initialEdges);
  const [currentGame, setCurrentGame] = useState(null);
  const [panelVisible, setPanelVisible] = useState(false);

  // Сохраняем узлы в localStorage при изменении
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

  const onNodeClick = useCallback((reactFlowEvent, node) => {
    setCurrentGame(node.data.gameId);
    setPanelVisible(true);
    
    // Анимируем ноду при клике
    const gameEvent = new CustomEvent('gameStatusUpdate', {
      detail: { gameId: node.data.gameId, isPlaying: true }
    });
    window.dispatchEvent(gameEvent);
  }, []);

  const onPaneClick = useCallback(() => {
    setPanelVisible(false);
    setCurrentGame(null);
  }, []);

  // Функция сброса позиций
  const resetPositions = useCallback(() => {
    if (window.confirm('Сбросить все узлы в начальные позиции?')) {
      setNodes(defaultNodes);
    }
  }, []);

  return (
    <div className="app">
      <div className="header">
        <h1>Игровой блок на платформе обучения</h1>
        <p>Перетаскивайте игры • Сохраняйте связи • Позиции сохраняются автоматически</p>
        
        <div className="header-controls">
          {!panelVisible && (
            <div className="hint">
              👆 Нажмите на любую игру, чтобы открыть игровую панель
            </div>
          )}
          
          <button 
            className="reset-btn"
            onClick={resetPositions}
            title="Вернуть все игры на начальные позиции"
          >
            <span className="reset-icon">🔄</span>
            <span className="reset-text">Сбросить позиции</span>
          </button>
        </div>
      </div>
      
      <div className="main-content">
        <div className="flow-container">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              fitView
            >
              <Background variant="dots" gap={12} size={1} />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
        
        {panelVisible ? (
          <div className="game-container">
            <GamePanel currentGame={currentGame} />
          </div>
        ) : (
          <div className="game-container placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon">🎮</div>
              <h3>Игровая панель</h3>
              <p>Выберите игру из списка слева</p>
              <div className="placeholder-tips">
                <div className="tip">
                  <span>👈</span>
                  <p>Нажмите на любую игру</p>
                </div>
                <div className="tip">
                  <span>🎯</span>
                  <p>Игра откроется здесь</p>
                </div>
                <div className="tip">
                  <span>💾</span>
                  <p>Позиции сохраняются автоматически</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;