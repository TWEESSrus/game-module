import React, { useState, useEffect, useCallback } from 'react';
import './SnakeGame.css';

const SnakeGame = () => {
  // ✅ одна сетка всегда
  const GRID_SIZE = 20;

  // ✅ сложность = только скорость
  const SPEEDS = {
    easy: 200,
    medium: 150,
    hard: 100
  };

  const [difficulty, setDifficulty] = useState('medium');
  const [snake, setSnake] = useState([]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState('RIGHT');
  const [nextDirection, setNextDirection] = useState('RIGHT');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [speed, setSpeed] = useState(SPEEDS.medium);
  const [highScore, setHighScore] = useState(0);
  const [gamePaused, setGamePaused] = useState(false);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
    initializeGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ КАЧЕСТВЕННО: еду генерируем на основе "переданной" змейки (актуальной),
  // а не по устаревшему state snake — это убирает странные баги с едой.
  const generateFood = useCallback((snakeBody) => {
    const emptyCells = [];

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (!snakeBody.some(segment => segment.x === x && segment.y === y)) {
          emptyCells.push({ x, y });
        }
      }
    }

    if (emptyCells.length > 0) {
      return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    return { x: -1, y: -1 };
  }, [GRID_SIZE]);

  const initializeGame = () => {
    const size = GRID_SIZE;
    const initialSpeed = SPEEDS[difficulty];
    const midPoint = Math.floor(size / 2);

    const initialSnake = [{ x: midPoint, y: midPoint }];
    let initialFood = {
      x: Math.floor(Math.random() * size),
      y: Math.floor(Math.random() * size)
    };

    // не даём еде появиться на голове
    if (initialSnake.some(segment => segment.x === initialFood.x && segment.y === initialFood.y)) {
      initialFood = generateFood(initialSnake);
    }

    setSnake(initialSnake);
    setFood(initialFood);
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    setGamePaused(false);
    setSpeed(initialSpeed);
  };

  const changeDifficulty = (newDifficulty) => {
    if (gameStarted && !gameOver) {
      if (window.confirm('Сменить сложность? Текущая игра будет сброшена.')) {
        setDifficulty(newDifficulty);
        // скорость поменяется после setDifficulty, поэтому делаем небольшой таймаут как у тебя
        setTimeout(() => initializeGame(), 100);
      }
    } else {
      setDifficulty(newDifficulty);
      // если игра не идёт — просто обновляем скорость сразу
      setSpeed(SPEEDS[newDifficulty]);
    }
  };

  const checkCollision = useCallback((head, body) => {
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }

    // столкновение с телом
    for (let i = 1; i < body.length; i++) {
      if (head.x === body[i].x && head.y === body[i].y) {
        return true;
      }
    }

    return false;
  }, [GRID_SIZE]);

  const moveSnake = useCallback(() => {
    if (!gameStarted || gameOver || gamePaused) return;

    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };

      // применяем отложенное направление
      const currentDirection = nextDirection;
      setDirection(currentDirection);

      switch (currentDirection) {
        case 'RIGHT': head.x += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        default: break;
      }

      if (checkCollision(head, prevSnake)) {
        setGameOver(true);
        // highScore обновим ниже по score в state (как у тебя было)
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      if (head.x === food.x && head.y === food.y) {
        // ✅ очки всегда +10, бонуса нет
        setScore(prev => {
          const newScore = prev + 10;

          // ✅ безопасно обновляем рекорд
          setHighScore(prevHigh => {
            if (newScore > prevHigh) {
              localStorage.setItem('snakeHighScore', newScore.toString());
              return newScore;
            }
            return prevHigh;
          });

          return newScore;
        });

        // ✅ еду генерируем от "новой" змейки (с ростом)
        const newFood = generateFood(newSnake);
        if (newFood.x !== -1 && newFood.y !== -1) {
          setFood(newFood);
        } else {
          setGameOver(true);
        }
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameStarted, gameOver, gamePaused, nextDirection, checkCollision, food, generateFood]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;

      const key = e.key;

      // WASD + стрелки
      const isUp = key === 'ArrowUp' || key === 'w' || key === 'W';
      const isDown = key === 'ArrowDown' || key === 's' || key === 'S';
      const isLeft = key === 'ArrowLeft' || key === 'a' || key === 'A';
      const isRight = key === 'ArrowRight' || key === 'd' || key === 'D';

      if (isUp) {
        if (direction !== 'DOWN') {
          e.preventDefault();
          setNextDirection('UP');
        }
        return;
      }
      if (isDown) {
        if (direction !== 'UP') {
          e.preventDefault();
          setNextDirection('DOWN');
        }
        return;
      }
      if (isLeft) {
        if (direction !== 'RIGHT') {
          e.preventDefault();
          setNextDirection('LEFT');
        }
        return;
      }
      if (isRight) {
        if (direction !== 'LEFT') {
          e.preventDefault();
          setNextDirection('RIGHT');
        }
        return;
      }

      switch (key) {
        case ' ':
          e.preventDefault();
          if (gameStarted && !gameOver) {
            setGamePaused(prev => !prev);
          }
          break;
        case 'Enter':
          if (!gameStarted || gameOver) {
            e.preventDefault();
            initializeGame();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameStarted, gameOver]);

  useEffect(() => {
    if (!gameStarted || gameOver || gamePaused) return;

    const gameInterval = setInterval(moveSnake, speed);
    return () => clearInterval(gameInterval);
  }, [gameStarted, gameOver, gamePaused, moveSnake, speed]);

  useEffect(() => {
    if (gameStarted) {
      const event = new CustomEvent('gameScoreUpdate', {
        detail: { game: 'snake', score }
      });
      window.dispatchEvent(event);
    }
  }, [score, gameStarted]);

  const handleButtonControl = (newDirection) => {
    if (gamePaused || gameOver || !gameStarted) return;

    if (
      (newDirection === 'UP' && direction !== 'DOWN') ||
      (newDirection === 'DOWN' && direction !== 'UP') ||
      (newDirection === 'LEFT' && direction !== 'RIGHT') ||
      (newDirection === 'RIGHT' && direction !== 'LEFT')
    ) {
      setNextDirection(newDirection);
    }
  };

  const getDifficultyColor = (diff) => {
    return diff === difficulty ?
      diff === 'easy' ? '#00b09b' :
      diff === 'medium' ? '#667eea' : '#ff5e62'
      : '#666';
  };

  // если игра окончена — убедимся, что рекорд не потеряли (на случай если умерли между тиками)
  useEffect(() => {
    if (gameOver) {
      setHighScore(prevHigh => {
        if (score > prevHigh) {
          localStorage.setItem('snakeHighScore', score.toString());
          return score;
        }
        return prevHigh;
      });
    }
  }, [gameOver, score]);

  return (
    <div className="snake-game">
      <div className="game-header">
        <div className="game-controls">
          {!gameStarted || gameOver ? (
            <button className="control-btn start-btn" onClick={initializeGame}>
              {gameOver ? '🔄 Играть снова' : '▶️ Начать игру'}
            </button>
          ) : (
            <button
              className="control-btn pause-btn"
              onClick={() => setGamePaused(!gamePaused)}
            >
              {gamePaused ? '▶️ Продолжить' : '⏸️ Пауза'}
            </button>
          )}
        </div>
      </div>

      <div className="difficulty-selector">
        <div className="difficulty-label">Сложность:</div>
        {['easy', 'medium', 'hard'].map(diff => (
          <button
            key={diff}
            className={`difficulty-btn ${difficulty === diff ? 'active' : ''}`}
            onClick={() => changeDifficulty(diff)}
            style={{
              background: difficulty === diff ? getDifficultyColor(diff) : undefined,
              color: difficulty === diff ? 'white' : undefined
            }}
          >
            {diff === 'easy' && '🐢 Легкая'}
            {diff === 'medium' && '⚡ Средняя'}
            {diff === 'hard' && '🔥 Сложная'}
          </button>
        ))}
      </div>

      {/* ✅ убрали бонус, сетка одна */}
      <div className="difficulty-info">
        <div className="info-item">
          <span>Поле:</span>
          <strong>{GRID_SIZE}x{GRID_SIZE}</strong>
        </div>
        <div className="info-item">
          <span>Скорость:</span>
          <strong>{speed}ms</strong>
        </div>
        <div className="info-item">
          <span>Очки:</span>
          <strong>+10/еда</strong>
        </div>
      </div>

      <div className="game-stats">
        <div className="stat-box">
          <div className="stat-label">Счет</div>
          <div className="stat-value">{score}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Рекорд</div>
          <div className="stat-value">{highScore}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Длина</div>
          <div className="stat-value">{snake.length}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Сложность</div>
          <div className="stat-value">
            {difficulty === 'easy' ? '🐢' : difficulty === 'medium' ? '⚡' : '🔥'}
          </div>
        </div>
      </div>

      <div className="game-board-container">
        {!gameStarted ? (
          <div className="start-screen">
            <div className="instructions">
              <h3>Как играть:</h3>
              <ul>
                <li>📍 Используйте стрелки или WASD</li>
                <li>🍎 Собирайте красные яблоки</li>
                <li>🚫 Избегайте стен и себя</li>
                <li>🎯 Выберите сложность выше</li>
                <li>🏆 Побивайте свой рекорд!</li>
              </ul>
              <button className="start-instruction-btn" onClick={initializeGame}>
                НАЧАТЬ ИГРУ
              </button>
            </div>
          </div>
        ) : gamePaused ? (
          <div className="paused-screen">
            <h3>⏸️ ИГРА НА ПАУЗЕ</h3>
            <p>Нажмите пробел или кнопку "Продолжить"</p>
          </div>
        ) : (
          <div
            className="game-board"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
              const y = Math.floor(index / GRID_SIZE);
              const x = index % GRID_SIZE;
              const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
              const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
              const isFood = food.x === x && food.y === y;

              let cellClass = 'grid-cell';
              if (isSnakeHead) cellClass += ' snake-head';
              else if (isSnakeBody) cellClass += ' snake-body';
              else if (isFood) cellClass += ' food';

              return (
                <div
                  key={`${x}-${y}`}
                  className={cellClass}
                  style={{
                    width: `${400 / GRID_SIZE}px`,
                    height: `${400 / GRID_SIZE}px`
                  }}
                />
              );
            })}

            {gameOver && (
              <div className="game-over-overlay">
                <div className="game-over-content">
                  <h3>💀 ИГРА ОКОНЧЕНА</h3>
                  <div className="final-stats">
                    <p>Ваш счет: <strong>{score}</strong></p>
                    <p>Рекорд: <strong>{Math.max(score, highScore)}</strong></p>
                    <p>Длина змейки: <strong>{snake.length}</strong></p>
                    <p>Сложность: <strong>
                      {difficulty === 'easy' ? 'Легкая' :
                        difficulty === 'medium' ? 'Средняя' : 'Сложная'}
                    </strong></p>
                  </div>
                  <button
                    className="play-again-btn"
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

      <div className="mobile-controls">
        <button
          className="mobile-btn up-btn"
          onClick={() => handleButtonControl('UP')}
        >
          ↑
        </button>
        <div className="horizontal-controls">
          <button
            className="mobile-btn left-btn"
            onClick={() => handleButtonControl('LEFT')}
          >
            ←
          </button>
          <div className="center-space"></div>
          <button
            className="mobile-btn right-btn"
            onClick={() => handleButtonControl('RIGHT')}
          >
            →
          </button>
        </div>
        <button
          className="mobile-btn down-btn"
          onClick={() => handleButtonControl('DOWN')}
        >
          ↓
        </button>
      </div>

      <div className="game-instructions">
        <div className="key-instructions">
          <p><strong>Управление:</strong> ←↑↓→ или WASD</p>
          <p><strong>Пауза:</strong> Пробел • <strong>Рестарт:</strong> Enter</p>
        </div>
        <div className="legend">
          <div className="legend-item">
            <div className="legend-color snake-head"></div>
            <span>Голова змейки</span>
          </div>
          <div className="legend-item">
            <div className="legend-color snake-body"></div>
            <span>Тело змейки</span>
          </div>
          <div className="legend-item">
            <div className="legend-color food"></div>
            <span>Еда (+10 очков)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;