import React, { memo, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';

const GameNode = memo(({ data, id, selected }) => {
  const [localScore, setLocalScore] = useState(data.score || 0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const handleScoreUpdate = (event) => {
      if (event.detail && event.detail.gameId === data.gameId) {
        setLocalScore(event.detail.score);
      }
    };

    const handleGameStatus = (event) => {
      if (event.detail && event.detail.gameId === data.gameId) {
        setIsPlaying(event.detail.isPlaying || false);
      }
    };

    window.addEventListener('updateNodeScore', handleScoreUpdate);
    window.addEventListener('gameStatusUpdate', handleGameStatus);
    
    return () => {
      window.removeEventListener('updateNodeScore', handleScoreUpdate);
      window.removeEventListener('gameStatusUpdate', handleGameStatus);
    };
  }, [data.gameId]);

  const getGameIcon = () => {
    switch(data.gameId) {
      case 'snake': return '🐍';
      case '2048': return '🔢';
      case 'memory': return '🧠';
      case 'clicker': return '🖱️';
      case 'pong': return '🏓';
      default: return '🎮';
    }
  };

  const getGameColor = () => {
    switch(data.gameId) {
      case 'snake': return '#00b09b';
      case '2048': return '#667eea';
      case 'memory': return '#ff9966';
      case 'clicker': return '#4cc9f0';
      case 'pong': return '#ff5e62';
      default: return '#667eea';
    }
  };

  const handlePlayClick = () => {
    const event = new CustomEvent('selectGame', {
      detail: { gameId: data.gameId, nodeId: id }
    });
    window.dispatchEvent(event);
    
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 300);
  };

  return (
    <div className={`game-node ${selected ? 'selected' : ''} ${isPlaying ? 'playing' : ''}`}>
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: getGameColor(),
          width: '8px',
          height: '8px',
          border: '2px solid white',
          borderRadius: '50%'
        }}
      />
      
      <div className="node-content">
        <div className="node-header">
          <div className="game-icon" style={{ color: getGameColor() }}>
            {getGameIcon()}
          </div>
          <div className="node-info">
            <div className="node-title">{data.label}</div>
            {isPlaying && <div className="playing-indicator">▶️ Играем</div>}
          </div>
        </div>
        
        <div className="node-score">
          <div className="score-label">Счет</div>
          <div className="score-value" style={{ color: getGameColor() }}>
            {localScore}
          </div>
        </div>
        
        <button 
          className="play-button"
          onClick={handlePlayClick}
          style={{ background: getGameColor() }}
        >
          <span className="button-text">Играть</span>
          <span className="button-icon">▶</span>
        </button>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: getGameColor(),
          width: '8px',
          height: '8px',
          border: '2px solid white',
          borderRadius: '50%'
        }}
      />
    </div>
  );
});

export default GameNode;