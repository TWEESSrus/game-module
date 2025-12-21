import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Pong.css';

const Pong = () => {
  const [gameActive, setGameActive] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [winner, setWinner] = useState(null);
  const [highScore, setHighScore] = useState(0);
  
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const animationRef = useRef(null);
  
  // Игровые объекты (используем useRef чтобы не перерисовывать компонент при каждом кадре)
  const gameStateRef = useRef({
    player: { x: 0, y: 180, width: 10, height: 60, score: 0 },
    computer: { x: 390, y: 180, width: 10, height: 60, score: 0 },
    ball: { x: 200, y: 200, radius: 8, speed: 4, velocityX: 4, velocityY: 4 },
    canvasWidth: 400,
    canvasHeight: 300
  });

  // Загрузка рекорда
  useEffect(() => {
    const saved = localStorage.getItem('pongHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Сохранение счета
  useEffect(() => {
    const totalScore = playerScore + computerScore;
    if (totalScore > highScore) {
      setHighScore(totalScore);
      localStorage.setItem('pongHighScore', totalScore.toString());
    }
    
    const event = new CustomEvent('gameScoreUpdate', {
      detail: { game: 'pong', score: playerScore }
    });
    window.dispatchEvent(event);
  }, [playerScore, computerScore, highScore]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, []);

  // Рисуем прямоугольник
  const drawRect = useCallback((ctx, x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }, []);

  // Рисуем круг
  const drawCircle = useCallback((ctx, x, y, r, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }, []);

  // Рисуем текст
  const drawText = useCallback((ctx, text, x, y, color, size = '24px') => {
    ctx.fillStyle = color;
    ctx.font = `bold ${size} 'Courier New', monospace`;
    ctx.fillText(text, x, y);
  }, []);

  // Рисуем сетку
  const drawNet = useCallback((ctx, canvasWidth, canvasHeight) => {
    for (let i = 0; i <= canvasHeight; i += 15) {
      drawRect(ctx, canvasWidth / 2 - 1, i, 2, 8, '#667eea');
    }
  }, [drawRect]);

  // Проверка столкновения
  const collision = useCallback((ball, paddle) => {
    const b = {
      top: ball.y - ball.radius,
      bottom: ball.y + ball.radius,
      left: ball.x - ball.radius,
      right: ball.x + ball.radius
    };
    
    const p = {
      top: paddle.y,
      bottom: paddle.y + paddle.height,
      left: paddle.x,
      right: paddle.x + paddle.width
    };
    
    return b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom;
  }, []);

  // Сброс мяча
  const resetBall = useCallback(() => {
    const state = gameStateRef.current;
    state.ball.x = state.canvasWidth / 2;
    state.ball.y = state.canvasHeight / 2;
    state.ball.velocityX = -state.ball.velocityX;
    state.ball.speed = 4;
  }, []);

  // Обновление игры
  const update = useCallback(() => {
    const state = gameStateRef.current;
    const { ball, player, computer, canvasWidth, canvasHeight } = state;

    // Проверка забития гола
    if (ball.x - ball.radius < 0) {
      computer.score++;
      setComputerScore(computer.score);
      resetBall();
    } else if (ball.x + ball.radius > canvasWidth) {
      player.score++;
      setPlayerScore(player.score);
      resetBall();
    }

    // Движение мяча
    ball.x += ball.velocityX * gameSpeed;
    ball.y += ball.velocityY * gameSpeed;

    // ИИ компьютера (следит за мячом)
    const computerCenter = computer.y + computer.height / 2;
    const speed = 3 * gameSpeed;
    if (computerCenter < ball.y - 10) {
      computer.y += speed;
    } else if (computerCenter > ball.y + 10) {
      computer.y -= speed;
    }

    // Ограничение движения ракеток
    computer.y = Math.max(0, Math.min(canvasHeight - computer.height, computer.y));
    player.y = Math.max(0, Math.min(canvasHeight - player.height, player.y));

    // Отскок от стен
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvasHeight) {
      ball.velocityY = -ball.velocityY;
    }

    // Определяем, какая ракетка отбивает
    const paddle = ball.x < canvasWidth / 2 ? player : computer;

    // Столкновение с ракеткой
    if (collision(ball, paddle)) {
      // Точка столкновения (от -1 до 1)
      let collidePoint = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
      
      // Угол отскока
      let angleRad = (Math.PI / 4) * collidePoint;
      
      // Направление
      let direction = ball.x < canvasWidth / 2 ? 1 : -1;
      
      // Новая скорость
      ball.velocityX = direction * ball.speed * Math.cos(angleRad);
      ball.velocityY = ball.speed * Math.sin(angleRad);
      
      // Увеличение скорости
      ball.speed = Math.min(ball.speed + 0.2, 8);
    }

    // Проверка победы
    if (player.score >= 5) {
      setWinner('player');
      setGameActive(false);
    } else if (computer.score >= 5) {
      setWinner('computer');
      setGameActive(false);
    }
  }, [gameSpeed, collision, resetBall]);

  // Отрисовка игры
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const state = gameStateRef.current;
    const { canvasWidth, canvasHeight, player, computer, ball } = state;

    // Очистка canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Фон
    drawRect(ctx, 0, 0, canvasWidth, canvasHeight, '#1a1a2e');
    
    // Сетка
    drawNet(ctx, canvasWidth, canvasHeight);
    
    // Счет
    drawText(ctx, player.score.toString(), canvasWidth / 4, 40, '#667eea', '32px');
    drawText(ctx, computer.score.toString(), 3 * canvasWidth / 4, 40, '#ff5e62', '32px');
    
    // Ракетки
    drawRect(ctx, player.x, player.y, player.width, player.height, '#667eea');
    drawRect(ctx, computer.x, computer.y, computer.width, computer.height, '#ff5e62');
    
    // Мяч
    drawCircle(ctx, ball.x, ball.y, ball.radius, '#00b09b');
    
    // Центральная линия
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.setLineDash([5, 10]);
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2, 0);
    ctx.lineTo(canvasWidth / 2, canvasHeight);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [drawRect, drawCircle, drawText, drawNet]);

  // Игровой цикл
  const gameLoop = useCallback(() => {
    if (!gameActive) return;
    
    update();
    render();
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameActive, update, render]);

  // Запуск игрового цикла
  useEffect(() => {
    if (gameActive) {
      animationRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameActive, gameLoop]);

  // Управление ракеткой игрока
  const handleMouseMove = useCallback((e) => {
    if (!gameActive || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const state = gameStateRef.current;
    
    const y = e.clientY - rect.top - state.player.height / 2;
    state.player.y = Math.max(0, Math.min(state.canvasHeight - state.player.height, y));
  }, [gameActive]);

  // Управление для мобильных
  const handleTouchMove = useCallback((e) => {
    if (!gameActive || !canvasRef.current) return;
    
    const touch = e.touches[0];
    handleMouseMove(touch);
  }, [gameActive, handleMouseMove]);

  // Старт игры
  const startGame = useCallback(() => {
    setGameActive(true);
    setPlayerScore(0);
    setComputerScore(0);
    setWinner(null);
    
    // Сброс состояния
    gameStateRef.current = {
      player: { x: 0, y: 180, width: 10, height: 60, score: 0 },
      computer: { x: 390, y: 180, width: 10, height: 60, score: 0 },
      ball: { x: 200, y: 200, radius: 8, speed: 4, velocityX: 4, velocityY: 4 },
      canvasWidth: 400,
      canvasHeight: 300
    };
  }, []);

  // Сброс игры
  const resetGame = useCallback(() => {
    setGameActive(false);
    setPlayerScore(0);
    setComputerScore(0);
    setWinner(null);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  // Настройка управления
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleMouseMove, handleTouchMove]);

  return (
    <div className="pong-game">
      <div className="game-header">
        <h2>🏓 Пинг-Понг</h2>
        <div className="game-controls">
          <button 
            className="control-btn"
            onClick={gameActive ? resetGame : startGame}
          >
            {gameActive ? '🔄 Начать заново' : '▶️ Начать игру'}
          </button>
        </div>
      </div>

      <div className="game-stats">
        <div className="stat-box">
          <div className="stat-label">Игрок</div>
          <div className="stat-value player-score">{playerScore}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Компьютер</div>
          <div className="stat-value computer-score">{computerScore}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Рекорд</div>
          <div className="stat-value">{highScore}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Скорость</div>
          <div className="stat-value">x{gameSpeed.toFixed(1)}</div>
        </div>
      </div>

      <div className="game-area">
        <div className="pong-container">
          <canvas 
            ref={canvasRef}
            width={400}
            height={300}
            className="pong-canvas"
          />
          
          {!gameActive && winner && (
            <div className="game-over-screen">
              <div className="game-over-message">
                <h3>{winner === 'player' ? '🏆 Победа!' : '💀 Поражение'}</h3>
                <div className="final-score">
                  <p>Игрок: <strong>{playerScore}</strong></p>
                  <p>Компьютер: <strong>{computerScore}</strong></p>
                </div>
                <button className="play-again-btn" onClick={startGame}>
                  🎮 Играть снова
                </button>
              </div>
            </div>
          )}
          
          {!gameActive && !winner && (
            <div className="start-screen">
              <div className="start-message">
                <h3>🏓 Пинг-Понг</h3>
                <p>Двигайте мышью для управления ракеткой</p>
                <p>Первым до 5 очков побеждает!</p>
                <button className="start-btn-big" onClick={startGame}>
                  НАЧАТЬ ИГРУ
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="speed-control">
          <div className="speed-label">Скорость игры:</div>
          <div className="speed-slider">
            <input 
              type="range" 
              min="0.5" 
              max="2" 
              step="0.1"
              value={gameSpeed}
              onChange={(e) => setGameSpeed(parseFloat(e.target.value))}
            />
            <div className="speed-value">x{gameSpeed.toFixed(1)}</div>
          </div>
        </div>
      </div>

      <div className="game-instructions">
        <div className="instructions-row">
          <p><strong>Управление:</strong> Двигайте мышью вверх/вниз</p>
          <p><strong>Цель:</strong> Отбивайте мяч и забивайте голы!</p>
        </div>
        <div className="legend">
          <div className="legend-item">
            <div className="legend-color player-color"></div>
            <span>Игрок (синий)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color computer-color"></div>
            <span>Компьютер (красный)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color ball-color"></div>
            <span>Мяч</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pong;