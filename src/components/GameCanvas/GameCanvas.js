import React, { useState, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Controls,
  Background,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import GameNode from '../GameNode/GameNode';

// Настройка типов узлов
const nodeTypes = {
  gameNode: GameNode,
};

// Начальные узлы
const initialNodes = [
  {
    id: '1',
    type: 'gameNode',
    position: { x: 100, y: 50 },
    data: { 
      label: 'Змейка', 
      type: 'snake',
      score: 0,
      isActive: true 
    },
  },
  {
    id: '2',
    type: 'gameNode',
    position: { x: 350, y: 50 },
    data: { 
      label: '2048', 
      type: 'game2048',
      score: 0,
      isActive: false 
    },
  },
  {
    id: '3',
    type: 'gameNode',
    position: { x: 100, y: 250 },
    data: { 
      label: 'Память', 
      type: 'memory',
      score: 0,
      isActive: false 
    },
  },
  {
    id: '4',
    type: 'gameNode',
    position: { x: 350, y: 250 },
    data: { 
      label: 'Кликер', 
      type: 'clicker',
      score: 0,
      isActive: false 
    },
  },
];

// Начальные связи
const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3', animated: true },
  { id: 'e2-4', source: '2', target: '4', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
];

const GameCanvas = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [activeGame, setActiveGame] = useState('1');

  // Обработчик клика по узлу
  const onNodeClick = useCallback((event, node) => {
    setActiveGame(node.id);
    
    // Обновляем активность узлов
    setNodes(nds => nds.map(nd => ({
      ...nd,
      data: {
        ...nd.data,
        isActive: nd.id === node.id
      }
    })));
  }, []);

  // Обработчик создания связи
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  // Рендер активной игры
  const renderActiveGame = () => {
    const activeNode = nodes.find(n => n.id === activeGame);
    if (!activeNode) return null;

    const gameConfigs = {
      snake: {
        title: '🐍 Змейка',
        description: 'Классическая игра "Змейка". Собирайте еду и не врезайтесь!',
        controls: 'Стрелки ←↑→↓ для управления',
        color: '#2ecc71',
        bgColor: '#1a1a2e'
      },
      game2048: {
        title: '🔢 2048',
        description: 'Объединяйте одинаковые числа, чтобы получить 2048!',
        controls: 'Стрелки ←↑→↓ для сдвига плиток',
        color: '#3498db',
        bgColor: '#faf8ef'
      },
      memory: {
        title: '🧠 Игра на память',
        description: 'Найдите все пары одинаковых карточек.',
        controls: 'Кликните по карточкам чтобы перевернуть',
        color: '#9b59b6',
        bgColor: '#f0f0f0'
      },
      clicker: {
        title: '🖱️ Кликер',
        description: 'Кликайте и покупайте улучшения!',
        controls: 'Кликните по большой кнопке',
        color: '#e74c3c',
        bgColor: '#ffffff'
      }
    };

    const config = gameConfigs[activeNode.data.type] || gameConfigs.snake;

    return (
      <div style={{ 
        width: '100%', 
        height: '100%',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ 
          marginBottom: '20px',
          padding: '20px',
          background: config.bgColor,
          borderRadius: '10px',
          border: `3px solid ${config.color}`,
          color: config.color === '#1a1a2e' ? 'white' : '#2c3e50'
        }}>
          <h2 style={{ 
            margin: '0 0 10px 0',
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {config.title}
          </h2>
          <p style={{ margin: '0 0 15px 0', fontSize: '16px' }}>
            {config.description}
          </p>
          <div style={{
            padding: '10px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '5px',
            fontSize: '14px'
          }}>
            <strong>Управление:</strong> {config.controls}
          </div>
        </div>

        <div style={{ 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '400px',
            height: '400px',
            background: config.bgColor,
            border: `3px dashed ${config.color}`,
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: config.color === '#1a1a2e' ? 'white' : '#2c3e50',
            textAlign: 'center',
            padding: '20px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>
              {activeNode.data.type === 'snake' && '🐍'}
              {activeNode.data.type === 'game2048' && '🔢'}
              {activeNode.data.type === 'memory' && '🧠'}
              {activeNode.data.type === 'clicker' && '🖱️'}
            </div>
            <h3 style={{ margin: '0 0 10px 0' }}>
              {activeNode.data.label}
            </h3>
            <p style={{ margin: '0 0 20px 0', opacity: 0.8 }}>
              Игра загружается...
            </p>
            <div style={{
              padding: '10px 30px',
              background: config.color,
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              🎮 Запустить игру
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#f8f9fa',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Счет</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: config.color }}>
              {activeNode.data.score}
            </div>
          </div>
          <div style={{
            display: 'flex',
            gap: '10px'
          }}>
            <div style={{
              padding: '8px 16px',
              background: config.color,
              color: 'white',
              borderRadius: '5px',
              fontSize: '14px',
              cursor: 'pointer'
            }}>
              🔄 Сбросить
            </div>
            <div style={{
              padding: '8px 16px',
              background: '#95a5a6',
              color: 'white',
              borderRadius: '5px',
              fontSize: '14px',
              cursor: 'pointer'
            }}>
              ⚙️ Настройки
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: 'calc(100vh - 80px)', 
      width: '100vw' 
    }}>
      {/* Левая часть - React Flow */}
      <div style={{ 
        flex: 3, 
        height: '100%',
        borderRight: '2px solid #ddd',
        position: 'relative'
      }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={onNodeClick}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            style={{ background: '#f8f9fa' }}
            defaultEdgeOptions={{
              style: { strokeWidth: 2, stroke: '#bdc3c7' },
            }}
          >
            <Background color="#aaa" gap={16} />
            <Controls />
            <MiniMap 
              nodeStrokeWidth={3}
              nodeColor={(node) => {
                switch (node.data?.type) {
                  case 'snake': return '#2ecc71';
                  case 'game2048': return '#3498db';
                  case 'memory': return '#9b59b6';
                  case 'clicker': return '#e74c3c';
                  default: return '#95a5a6';
                }
              }}
            />
          </ReactFlow>
        </ReactFlowProvider>
        
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          padding: '10px 15px',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '5px',
          fontSize: '12px',
          color: '#7f8c8d',
          border: '1px solid #ddd',
          zIndex: 10
        }}>
          🖱️ Перетаскивайте узлы • 🔗 Соединяйте игры
        </div>
      </div>
      
      {/* Правая часть - игровая панель */}
      <div style={{ 
        flex: 2, 
        background: 'white', 
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{ 
          padding: '20px',
          borderBottom: '2px solid #4CAF50',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>
            🎮 Игровая панель
          </h2>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            {nodes.find(n => n.id === activeGame)?.data.label} • 
            Счет: <strong>{nodes.find(n => n.id === activeGame)?.data.score}</strong>
          </div>
        </div>
        
        <div style={{ 
          flex: 1,
          overflow: 'auto'
        }}>
          {renderActiveGame()}
        </div>
      </div>
    </div>
  );
};

export default GameCanvas;