import React, { useState, useEffect } from 'react';
import SnakeGame from '../../games/Snake/SnakeGame';
import Game2048 from '../../games/Game2048/Game2048';
import MemoryGame from '../../games/Memory/MemoryGame';
import ClickerGame from '../../games/Clicker/ClickerGame';
import './GamePanel.css';

const GamePanel = ({ currentGame }) => {
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    const handleScoreUpdate = (event) => {
      if (event.detail && event.detail.game === currentGame) {
        setCurrentScore(event.detail.score);
      }
    };

    window.addEventListener('gameScoreUpdate', handleScoreUpdate);
    return () => window.removeEventListener('gameScoreUpdate', handleScoreUpdate);
  }, [currentGame]);

  const updateNodeScore = () => {
    const event = new CustomEvent('updateNodeScore', {
      detail: {
        gameId: currentGame,
        score: currentScore
      }
    });
    window.dispatchEvent(event);
  };

  const getGameTitle = () => {
    switch (currentGame) {
      case 'snake': return '🐍 Змейка';
      case '2048': return '🔢 2048';
      case 'memory': return '🧠 Память';
      case 'clicker': return '🖱️ Кликер';
      default: return 'Игровая панель';
    }
  };

  const renderGame = () => {
    switch (currentGame) {
      case 'snake':
        return <SnakeGame />;
      case '2048':
        return <Game2048 />;
      case 'memory':
        return <MemoryGame />;
      case 'clicker':
        return <ClickerGame />;
      default:
        return (
          <div className="game-placeholder">
            <div className="placeholder-icon">🎮</div>
            <h3>Выберите игру</h3>
            <p>Кликните на любую игру на панели слева</p>
            <div className="features">
              <div className="feature">
                <span>🏗️</span>
                <p>Создавайте связи между блоками</p>
              </div>
              <div className="feature">
                <span>📊</span>
                <p>Отслеживайте свой прогресс</p>
              </div>
              <div className="feature">
                <span>💾</span>
                <p>Сохраняйте свою игровую статистику</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="game-panel">
      <div className="panel-header">
        <h2 className="panel-title">{getGameTitle()}</h2>
        
        {currentGame && (
          <div className="panel-actions">
            <button className="save-score-btn" onClick={updateNodeScore}>
              💾 Сохранить счет
            </button>
          </div>
        )}
      </div>
      
      <div className="game-content">
        {renderGame()}
      </div>
    </div>
  );
};

export default GamePanel;