import React, { useState, useEffect, useCallback } from 'react';
import './SnakeGame.css';

const SnakeGame = () => {
  const GRID_SIZE = 20;
  const SCORE_PER_FOOD = 10;
  
  const [difficulty, setDifficulty] = useState('medium');
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState('RIGHT');
  const [nextDirection, setNextDirection] = useState('RIGHT');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [gamePaused, setGamePaused] = useState(false);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  useEffect(() => {
    if (!gameStarted || gameOver || gamePaused) return;

    const speeds = { easy: 200, medium: 150, hard: 100 };
    const speed = speeds[difficulty];

    const gameLoop = setInterval(() => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        const currentDirection = nextDirection;
        
        switch (currentDirection) {
          case 'RIGHT': head.x += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          default: break;
        }

        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          handleGameOver();
          return prevSnake;
        }

        for (let i = 1; i < prevSnake.length; i++) {
          if (head.x === prevSnake[i].x && head.y === prevSnake[i].y) {
            handleGameOver();
            return prevSnake;
          }
        }

        const newSnake = [head, ...prevSnake];

        if (head.x === food.x && head.y === food.y) {
          setScore(prev => {
            const newScore = prev + SCORE_PER_FOOD;
            if (newScore > highScore) {
              setHighScore(newScore);
              localStorage.setItem('snakeHighScore', newScore.toString());
            }
            return newScore;
          });
          
          const newFood = generateFood(prevSnake);
          setFood(newFood);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, gamePaused, difficulty, nextDirection, food, highScore]);

  const generateFood = useCallback((currentSnake) => {
    const emptyCells = [];
    
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (!currentSnake.some(segment => segment.x === x && segment.y === y)) {
          emptyCells.push({ x, y });
        }
      }
    }
    
    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      return randomCell;
    }
    
    return { x: 0, y: 0 };
  }, []);

  const initializeGame = () => {
    const midPoint = Math.floor(GRID_SIZE / 2);
    const initialSnake = [{ x: midPoint, y: midPoint }];
    
    let initialFood;
    do {
      initialFood = { 
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (initialSnake.some(segment => segment.x === initialFood.x && segment.y === initialFood.y));
    
    setSnake(initialSnake);
    setFood(initialFood);
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    setGamePaused(false);
  };

  const handleGameOver = () => {
    setGameOver(true);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snakeHighScore', score.toString());
    }
  };

  const changeDifficulty = (newDifficulty) => {
    if (gameStarted && !gameOver) {
      if (window.confirm('Сменить скорость? Текущая игра будет сброшена.')) {
        setDifficulty(newDifficulty);
        initializeGame();
      }
    } else {
      setDifficulty(newDifficulty);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver || !gameStarted) return;
      
      const key = e.key.toLowerCase();
      
      if (key === ' ') {
        e.preventDefault();
        setGamePaused(prev => !prev);
        return;
      }
      
      if (gamePaused) return;
      
      switch(key) {
        case 'arrowup':
        case 'w':
          if (direction !== 'DOWN') {
            e.preventDefault();
            setNextDirection('UP');
            setDirection('UP');
          }
          break;
        case 'arrowdown':
        case 's':
          if (direction !== 'UP') {
            e.preventDefault();
            setNextDirection('DOWN');
            setDirection('DOWN');
          }
          break;
        case 'arrowleft':
        case 'a':
          if (direction !== 'RIGHT') {
            e.preventDefault();
            setNextDirection('LEFT');
            setDirection('LEFT');
          }
          break;
        case 'arrowright':
        case 'd':
          if (direction !== 'LEFT') {
            e.preventDefault();
            setNextDirection('RIGHT');
            setDirection('RIGHT');
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameStarted, gameOver, gamePaused]);

  const handleButtonControl = (newDirection) => {
    if (gamePaused || gameOver || !gameStarted) return;
    
    if (
      (newDirection === 'UP' && direction !== 'DOWN') ||
      (newDirection === 'DOWN' && direction !== 'UP') ||
      (newDirection === 'LEFT' && direction !== 'RIGHT') ||
      (newDirection === 'RIGHT' && direction !== 'LEFT')
    ) {
      setNextDirection(newDirection);
      setDirection(newDirection);
    }
  };

  const getDifficultyName = (diff) => {
    switch(diff) {
      case 'easy': return 'Медленно';
      case 'medium': return 'Нормально';
      case 'hard': return 'Быстро';
      default: return '';
    }
  };

  const getDifficultySpeed = (diff) => {
    switch(diff) {
      case 'easy': return '200 мс';
      case 'medium': return '150 мс';
      case 'hard': return '100 мс';
      default: return '';
    }
  };

  return (
    <div className="snake-game">
      <div className="snake-game-header">
        <h2>🐍 Змейка</h2>
        <div className="snake-game-controls">
          {!gameStarted || gameOver ? (
            <button className="snake-control-btn snake-start-btn" onClick={initializeGame}>
              {gameOver ? '🔄 Заново' : '▶️ Старт'}
            </button>
          ) : (
            <button 
              className="snake-control-btn snake-pause-btn" 
              onClick={() => setGamePaused(!gamePaused)}
            >
              {gamePaused ? '▶️ Продолжить' : '⏸️ Пауза'}
            </button>
          )}
        </div>
      </div>

      <div className="snake-difficulty-selector">
        <div className="snake-difficulty-header">
          <div className="snake-difficulty-label">Скорость:</div>
          <div className="snake-current-speed">{getDifficultySpeed(difficulty)}</div>
        </div>
        <div className="snake-difficulty-buttons">
          {['easy', 'medium', 'hard'].map(diff => (
            <button
              key={diff}
              className={`snake-difficulty-btn ${difficulty === diff ? 'snake-active' : ''}`}
              onClick={() => changeDifficulty(diff)}
            >
              {getDifficultyName(diff)}
            </button>
          ))}
        </div>
      </div>

      <div className="snake-game-stats">
        <div className="snake-stat-box">
          <div className="snake-stat-label">Счет</div>
          <div className="snake-stat-value">{score}</div>
        </div>
        <div className="snake-stat-box">
          <div className="snake-stat-label">Рекорд</div>
          <div className="snake-stat-value">{highScore}</div>
        </div>
        <div className="snake-stat-box">
          <div className="snake-stat-label">Длина</div>
          <div className="snake-stat-value">{snake.length}</div>
        </div>
        <div className="snake-stat-box">
          <div className="snake-stat-label">Сложность</div>
          <div className="snake-stat-value">
            {difficulty === 'easy' ? '🐢' : difficulty === 'medium' ? '⚡' : '🔥'}
          </div>
        </div>
      </div>

      <div className="snake-game-board-container">
        {!gameStarted ? (
          <div className="snake-start-screen">
            <div className="snake-instructions">
              <h3>Как играть:</h3>
              <ul>
                <li>🎮 Управление: ←↑↓→ </li>
                <li>🍎 Съедайте красные яблоки</li>
                <li>⚠️ Не врезайтесь в стены и себя</li>
                <li>⏸️ Пауза: Пробел</li>
                <li>🏆 Побивайте свой рекорд!</li>
              </ul>
              <button className="snake-start-instruction-btn" onClick={initializeGame}>
                НАЧАТЬ ИГРУ
              </button>
            </div>
          </div>
        ) : gamePaused ? (
          <div className="snake-paused-screen">
            <h3>⏸️ ПАУЗА</h3>
            <p>Нажмите пробел для продолжения</p>
          </div>
        ) : (
          <div 
            className="snake-game-board"
            style={{ 
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
              width: `${GRID_SIZE * 20}px`,
              height: `${GRID_SIZE * 20}px`
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
              const y = Math.floor(index / GRID_SIZE);
              const x = index % GRID_SIZE;
              const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
              const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
              const isFood = food.x === x && food.y === y;
              
              let cellClass = 'snake-grid-cell';
              if (isSnakeHead) cellClass += ' snake-grid-cell-head';
              else if (isSnakeBody) cellClass += ' snake-grid-cell-body';
              else if (isFood) cellClass += ' snake-grid-cell-food';
              
              return (
                <div
                  key={`${x}-${y}`}
                  className={cellClass}
                />
              );
            })}
            
            {gameOver && (
              <div className="snake-game-over-overlay">
                <div className="snake-game-over-content">
                  <h3>💀 КОНЕЦ ИГРЫ</h3>
                  <div className="snake-final-stats">
                    <p>Счет: <strong>{score}</strong></p>
                    <p>Рекорд: <strong>{Math.max(score, highScore)}</strong></p>
                    <p>Длина: <strong>{snake.length}</strong></p>
                    <p>Сложность: <strong>{getDifficultyName(difficulty)}</strong></p>
                  </div>
                  <button 
                    className="snake-play-again-btn"
                    onClick={initializeGame}
                  >
                    🎮 Играть снова
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="snake-mobile-controls">
        <button 
          className="snake-mobile-btn"
          onClick={() => handleButtonControl('UP')}
        >
          ↑
        </button>
        <div className="snake-horizontal-controls">
          <button 
            className="snake-mobile-btn"
            onClick={() => handleButtonControl('LEFT')}
          >
            ←
          </button>
          <div className="snake-center-space"></div>
          <button 
            className="snake-mobile-btn"
            onClick={() => handleButtonControl('RIGHT')}
          >
            →
          </button>
        </div>
        <button 
          className="snake-mobile-btn"
          onClick={() => handleButtonControl('DOWN')}
        >
          ↓
        </button>
      </div>

      <div className="snake-game-instructions">
        <div className="snake-key-instructions">
          <p><strong>Управление:</strong> ←↑↓→ </p>
          <p><strong>Пауза:</strong> Пробел</p>
        </div>
        <div className="snake-legend">
          <div className="snake-legend-item">
            <div className="snake-legend-color snake-legend-head"></div>
            <span>Голова</span>
          </div>
          <div className="snake-legend-item">
            <div className="snake-legend-color snake-legend-body"></div>
            <span>Тело</span>
          </div>
          <div className="snake-legend-item">
            <div className="snake-legend-color snake-legend-food"></div>
            <span>Яблоко (+10)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;