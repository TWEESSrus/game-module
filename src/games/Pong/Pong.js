import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Pong.css';

const Pong = () => {
  const [gameActive, setGameActive] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [roundSpeed, setRoundSpeed] = useState(1); // Скорость текущего раунда
  const [winner, setWinner] = useState(null);
  const [highScore, setHighScore] = useState(0);
  const [winStreak, setWinStreak] = useState(0);
  const [roundTime, setRoundTime] = useState(0); // Время текущего раунда

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const roundStartTimeRef = useRef(0);
  const timeIntervalRef = useRef(null);

  // Игровые объекты
  const gameStateRef = useRef({
    player: { x: 0, y: 180, width: 10, height: 60, score: 0 },
    computer: { x: 390, y: 180, width: 10, height: 60, score: 0 },
    ball: { x: 200, y: 200, radius: 8, speed: 2, velocityX: 2, velocityY: 2 }, // Уменьшена начальная скорость
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
    const event = new CustomEvent('gameScoreUpdate', {
      detail: { game: 'pong', score: playerScore }
    });
    window.dispatchEvent(event);
  }, [playerScore]);

  // Таймер раунда и увеличение скорости
  useEffect(() => {
    if (gameActive) {
      roundStartTimeRef.current = Date.now();

      timeIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - roundStartTimeRef.current) / 1000);
        setRoundTime(elapsed);

        // Каждые 10 секунд +0.15, максимум x1.8
        const newSpeed = 1 + (elapsed / 10) * 0.15;
        setRoundSpeed(Math.min(newSpeed, 1.8));
      }, 1000);
    } else {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
        timeIntervalRef.current = null;
      }
      setRoundTime(0);
      setRoundSpeed(1);
    }

    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, [gameActive]);

  const handleGameEnd = useCallback((winner) => {
    setWinner(winner);
    setGameActive(false);

    if (winner === 'player') {
      const newStreak = winStreak + 1;
      setWinStreak(newStreak);

      if (newStreak > highScore) {
        setHighScore(newStreak);
        localStorage.setItem('pongHighScore', newStreak.toString());
      }
    } else if (winner === 'computer') {
      setWinStreak(0);
    }
  }, [winStreak, highScore]);

  const resetHighScore = useCallback(() => {
    localStorage.removeItem('pongHighScore');
    setHighScore(0);
    setWinStreak(0);
    alert('Рекорд сброшен!');
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    };
  }, []);

  const drawRect = useCallback((ctx, x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }, []);

  const drawCircle = useCallback((ctx, x, y, r, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }, []);

  const drawText = useCallback((ctx, text, x, y, color, size = '24px') => {
    ctx.fillStyle = color;
    ctx.font = `bold ${size} 'Courier New', monospace`;
    ctx.fillText(text, x, y);
  }, []);

  const drawNet = useCallback((ctx, canvasWidth, canvasHeight) => {
    for (let i = 0; i <= canvasHeight; i += 15) {
      drawRect(ctx, canvasWidth / 2 - 1, i, 2, 8, '#667eea');
    }
  }, [drawRect]);

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

    const isColliding = b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom;

    if (isColliding) {
      const randomAngle = (Math.random() - 0.5) * 0.3;
      return randomAngle;
    }

    return null;
  }, []);

  const resetBallForRound = useCallback(() => {
    const state = gameStateRef.current;
    state.ball.x = state.canvasWidth / 2;
    state.ball.y = state.canvasHeight / 2;

    const direction = Math.random() > 0.5 ? 1 : -1;
    const angle = (Math.random() * Math.PI / 3) - (Math.PI / 6);

    state.ball.speed = 2;
    state.ball.velocityX = direction * state.ball.speed * Math.cos(angle);
    state.ball.velocityY = state.ball.speed * Math.sin(angle);
  }, []);

  const update = useCallback(() => {
    const state = gameStateRef.current;
    const { ball, player, computer, canvasWidth, canvasHeight } = state;

    if (ball.x - ball.radius < 0) {
      computer.score++;
      setComputerScore(computer.score);

      resetBallForRound();
      setRoundSpeed(1);
      setRoundTime(0);
      roundStartTimeRef.current = Date.now();

      if (computer.score >= 5) {
        handleGameEnd('computer');
      }
      return;
    } else if (ball.x + ball.radius > canvasWidth) {
      player.score++;
      setPlayerScore(player.score);

      resetBallForRound();
      setRoundSpeed(1);
      setRoundTime(0);
      roundStartTimeRef.current = Date.now();

      if (player.score >= 5) {
        handleGameEnd('player');
      }
      return;
    }

    ball.x += ball.velocityX * roundSpeed;
    ball.y += ball.velocityY * roundSpeed;

    const predictionY = ball.y + (ball.velocityY * 5);
    const targetY = predictionY - computer.height / 2;

    const diff = targetY - computer.y;
    let moveAmount = diff * 0.07 * Math.min(roundSpeed, 1.3);

    const maxComputerSpeed = 1.5;
    if (Math.abs(moveAmount) > maxComputerSpeed) {
      moveAmount = Math.sign(moveAmount) * maxComputerSpeed;
    }

    computer.y += moveAmount;

    computer.y = Math.max(0, Math.min(canvasHeight - computer.height, computer.y));
    player.y = Math.max(0, Math.min(canvasHeight - player.height, player.y));

    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius + 1;
      ball.velocityY = Math.abs(ball.velocityY) * 0.9;
      ball.velocityY += (Math.random() * 0.15);
    }
    else if (ball.y + ball.radius > canvasHeight) {
      ball.y = canvasHeight - ball.radius - 1;
      ball.velocityY = -Math.abs(ball.velocityY) * 0.9;
      ball.velocityY -= (Math.random() * 0.15);
    }

    const minVerticalSpeed = 0.4;
    if (Math.abs(ball.velocityY) < minVerticalSpeed) {
      const sign = ball.velocityY >= 0 ? 1 : -1;
      ball.velocityY = sign * minVerticalSpeed;
    }

    const isHorizontalStuck = Math.abs(ball.velocityY) < 0.2 && Math.abs(ball.velocityX) > 1;
    if (isHorizontalStuck) {
      ball.velocityY += (Math.random() - 0.5) * 0.5;
    }

    const playerCollision = collision(ball, player);
    const computerCollision = collision(ball, computer);

    let collisionAngle = null;
    let paddle = null;

    if (playerCollision !== null && ball.velocityX < 0) {
      collisionAngle = playerCollision;
      paddle = player;
    } else if (computerCollision !== null && ball.velocityX > 0) {
      collisionAngle = computerCollision;
      paddle = computer;
    }

    if (collisionAngle !== null && paddle) {
      let collidePoint = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
      collidePoint = Math.max(-0.8, Math.min(0.8, collidePoint));

      let angleRad = (Math.PI / 4) * collidePoint;
      angleRad += collisionAngle;

      let direction = ball.x < canvasWidth / 2 ? 1 : -1;

      const currentSpeed = Math.sqrt(ball.velocityX * ball.velocityX + ball.velocityY * ball.velocityY);
      const newSpeed = Math.min(currentSpeed * 1.03, 5);
      ball.speed = newSpeed;

      ball.velocityX = direction * ball.speed * Math.cos(angleRad);
      ball.velocityY = ball.speed * Math.sin(angleRad);

      if (direction > 0) {
        ball.x = paddle.x + paddle.width + ball.radius + 1;
      } else {
        ball.x = paddle.x - ball.radius - 1;
      }
    }
  }, [roundSpeed, collision, resetBallForRound, handleGameEnd]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const state = gameStateRef.current;
    const { canvasWidth, canvasHeight, player, computer, ball } = state;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    drawRect(ctx, 0, 0, canvasWidth, canvasHeight, '#1a1a2e');
    drawNet(ctx, canvasWidth, canvasHeight);

    drawText(ctx, player.score.toString(), canvasWidth / 4, 40, '#667eea', '32px');
    drawText(ctx, computer.score.toString(), 3 * canvasWidth / 4, 40, '#ff5e62', '32px');

    drawText(ctx, `${formatTime(roundTime)}`, canvasWidth / 2 - 40, 25, '#ff9966', '14px');
    if (roundSpeed > 1.1) {
      drawText(ctx, `x${roundSpeed.toFixed(1)}`, canvasWidth / 2 + 20, 25, '#00b09b', '14px');
    }

    drawRect(ctx, player.x, player.y, player.width, player.height, '#667eea');
    drawRect(ctx, computer.x, computer.y, computer.width, computer.height, '#ff5e62');

    drawCircle(ctx, ball.x, ball.y, ball.radius, '#00b09b');

    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.setLineDash([5, 10]);
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2, 0);
    ctx.lineTo(canvasWidth / 2, canvasHeight);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [drawRect, drawCircle, drawText, drawNet, roundTime, roundSpeed]);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const gameLoop = useCallback(() => {
    if (!gameActive) return;

    update();
    render();
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameActive, update, render]);

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

  // ✅ ВАЖНО: корректная конвертация координат мыши при любом CSS-scale/zoom
  const handleMouseMove = useCallback((e) => {
    if (!gameActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const state = gameStateRef.current;

    // масштаб DOM-канваса -> координаты canvas (атрибуты width/height)
    const scaleY = canvas.height / rect.height;

    const yCanvas = (e.clientY - rect.top) * scaleY;
    const y = yCanvas - state.player.height / 2;

    state.player.y = Math.max(0, Math.min(state.canvasHeight - state.player.height, y));
  }, [gameActive]);

  const handleTouchMove = useCallback((e) => {
    if (!gameActive || !canvasRef.current) return;

    const touch = e.touches[0];
    handleMouseMove(touch);
  }, [gameActive, handleMouseMove]);

  const startGame = useCallback(() => {
    setGameActive(true);
    setPlayerScore(0);
    setComputerScore(0);
    setWinner(null);
    setRoundSpeed(1);
    setRoundTime(0);

    gameStateRef.current = {
      player: { x: 0, y: 180, width: 10, height: 60, score: 0 },
      computer: { x: 390, y: 180, width: 10, height: 60, score: 0 },
      ball: { x: 200, y: 200, radius: 8, speed: 2, velocityX: 2, velocityY: 0 },
      canvasWidth: 400,
      canvasHeight: 300
    };

    resetBallForRound();
  }, [resetBallForRound]);

  const resetGame = useCallback(() => {
    setGameActive(false);
    setPlayerScore(0);
    setComputerScore(0);
    setWinner(null);
    setWinStreak(0);
    setRoundSpeed(1);
    setRoundTime(0);

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

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
        <div className="game-controls">
          <button
            className="control-btn"
            onClick={gameActive ? resetGame : startGame}
          >
            {gameActive ? '🔄 Начать заново' : '▶️ Начать игру'}
          </button>
          <button
            className="control-btn reset-btn"
            onClick={resetHighScore}
            disabled={gameActive}
          >
            🗑️ Сбросить рекорд
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
          <div className="stat-value">{highScore} 🔥</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Раунд</div>
          <div className="stat-value time-value">{formatTime(roundTime)}</div>
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
                  <p>Счет: <strong>{playerScore}:{computerScore}</strong></p>
                  <p>Серия побед: <strong>{winStreak}</strong></p>
                  {winner === 'player' && winStreak > 1 && (
                    <p className="streak-message">🔥 Выиграно {winStreak} партий подряд!</p>
                  )}
                </div>
                <button className="play-again-btn" onClick={startGame}>
                  🎮 Новая партия
                </button>
              </div>
            </div>
          )}

          {!gameActive && !winner && (
            <div className="start-screen">
              <div className="start-message">
                <h3>🏓 Пинг-Понг</h3>
                <p>Двигайте мышью для управления ракеткой</p>
                <p>Партия: первый до 5 очков</p>
                {highScore > 0 && (
                  <p className="record-info">🏆 Рекорд: {highScore} побед подряд</p>
                )}
                <button className="start-btn-big" onClick={startGame}>
                  НАЧАТЬ ПАРТИЮ
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="speed-info">
          <div className="speed-display">
            <span className="speed-label">Скорость раунда: </span>
            <span className="speed-value">x{roundSpeed.toFixed(1)}</span>
          </div>
          <div className="speed-hint">
            ⚡ Скорость медленно растет и сбрасывается при голе
          </div>
        </div>
      </div>

      <div className="game-instructions">
        <div className="instructions-row">
          <p><strong>Управление:</strong> Двигайте мышью вверх/вниз</p>
          <p><strong>Цель:</strong> Выиграйте 5 раундов</p>
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