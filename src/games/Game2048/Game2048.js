import React, { useState, useEffect, useCallback } from 'react';
import './Game2048.css';

const Game2048 = () => {
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [lastMove, setLastMove] = useState(null);

  const initializeBoard = () => {
    const newBoard = Array(4).fill().map(() => Array(4).fill(0));
    
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setLastMove(null);
  };

  const addRandomTile = (boardCopy) => {
    const emptyCells = [];
    
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (boardCopy[i][j] === 0) {
          emptyCells.push({ i, j });
        }
      }
    }
    
    if (emptyCells.length > 0) {
      const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      boardCopy[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
    
    return boardCopy;
  };

  const moveLeft = useCallback((boardCopy) => {
    let moved = false;
    let newScore = score;
    
    for (let i = 0; i < 4; i++) {
      let row = boardCopy[i].filter(cell => cell !== 0);
      
      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2;
          newScore += row[j];
          row.splice(j + 1, 1);
          moved = true;
          
          if (row[j] === 2048) {
            setWon(true);
          }
        }
      }
      
      while (row.length < 4) {
        row.push(0);
      }
      
      if (JSON.stringify(boardCopy[i]) !== JSON.stringify(row)) {
        moved = true;
      }
      
      boardCopy[i] = row;
    }
    
    if (moved) {
      setScore(newScore);
    }
    
    return moved;
  }, [score]);

  // ИСПРАВЛЕННАЯ ФУНКЦИЯ ПОВОРОТА - не мутирует исходный массив
  const rotateBoard = (boardToRotate, times = 1) => {
    let result = boardToRotate.map(row => [...row]);
    
    for (let t = 0; t < times; t++) {
      const newBoard = Array(4).fill().map(() => Array(4).fill(0));
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          newBoard[j][3 - i] = result[i][j];
        }
      }
      result = newBoard;
    }
    
    return result;
  };

  const move = useCallback((direction) => {
    if (gameOver) return;
    
    let boardCopy = board.map(row => [...row]);
    let moved = false;
    
    const oldBoard = JSON.parse(JSON.stringify(boardCopy));
    
    switch(direction) {
      case 'left':
        moved = moveLeft(boardCopy);
        setLastMove({ direction: 'left', oldBoard, newBoard: boardCopy });
        break;
      case 'right':
        boardCopy = boardCopy.map(row => [...row].reverse());
        moved = moveLeft(boardCopy);
        boardCopy = boardCopy.map(row => [...row].reverse());
        setLastMove({ direction: 'right', oldBoard, newBoard: boardCopy });
        break;
      case 'up':
        // Правильный поворот для движения вверх
        boardCopy = rotateBoard(boardCopy, 3); // Поворачиваем 3 раза против часовой
        moved = moveLeft(boardCopy);
        boardCopy = rotateBoard(boardCopy, 1); // Поворачиваем обратно (по часовой)
        setLastMove({ direction: 'up', oldBoard, newBoard: boardCopy });
        break;
      case 'down':
        // Правильный поворот для движения вниз
        boardCopy = rotateBoard(boardCopy, 1); // Поворачиваем по часовой
        moved = moveLeft(boardCopy);
        boardCopy = rotateBoard(boardCopy, 3); // Поворачиваем обратно
        setLastMove({ direction: 'down', oldBoard, newBoard: boardCopy });
        break;
      default:
        break;
    }
    
    if (moved) {
      addRandomTile(boardCopy);
      setBoard(boardCopy);
      
      const event = new CustomEvent('gameScoreUpdate', {
        detail: { game: '2048', score }
      });
      window.dispatchEvent(event);
      
      if (isGameOver(boardCopy)) {
        setGameOver(true);
      }
    }
  }, [board, gameOver, moveLeft]);

  const isGameOver = (boardCopy) => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (boardCopy[i][j] === 0) return false;
      }
    }
    
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (j < 3 && boardCopy[i][j] === boardCopy[i][j + 1]) return false;
        if (i < 3 && boardCopy[i][j] === boardCopy[i + 1][j]) return false;
      }
    }
    
    return true;
  };

  useEffect(() => {
    initializeBoard();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      e.preventDefault();
      if (gameOver || won) return;
      
      switch(e.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
          move('left');
          break;
        case 'arrowright':
        case 'd':
          move('right');
          break;
        case 'arrowup':
        case 'w':
          move('up');
          break;
        case 'arrowdown':
        case 's':
          move('down');
          break;
        case 'r':
          initializeBoard();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move, gameOver, won]);

  const getTileColor = (value) => {
    const colors = {
      2: '#eee4da',
      4: '#ede0c8',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc850',
      1024: '#edc53f',
      2048: '#edc22e',
      4096: '#edc22e',
      8192: '#edc22e'
    };
    
    return colors[value] || '#3c3a32';
  };

  const getTileFontSize = (value) => {
    if (value < 100) return '18px';
    if (value < 1000) return '16px';
    if (value < 10000) return '14px';
    return '12px';
  };

  return (
    <div className="game-2048">
      <div className="game-header">
        <div className="header-left">
          <div className="game-subtitle">
            Объединяйте плитки, чтобы получить 2048!
          </div>
        </div>
        
        <div className="header-right">
          <div className="score-display">
            <div className="score-label">Счет</div>
            <div className="score-value">{score}</div>
          </div>
          
          <div className="game-controls">
            <button 
              className="control-btn new-game-btn"
              onClick={initializeBoard}
            >
              Новая игра
            </button>
          </div>
        </div>
      </div>

      <div className="instructions">
        <p>Используйте <strong>стрелки</strong> или <strong>WASD</strong> для движения</p>
        <p>Нажмите <strong>R</strong> для перезапуска</p>
      </div>

      <div className="game-area">
        <div className="board-container">
          <div className="board">
            {board.map((row, i) => (
              <div key={i} className="row">
                {row.map((cell, j) => (
                  <div key={`${i}-${j}`} className="cell">
                    {cell !== 0 && (
                      <div 
                        className={`tile tile-${cell}`}
                        style={{
                          backgroundColor: getTileColor(cell),
                          color: cell <= 4 ? '#776e65' : '#f9f6f2',
                          fontSize: getTileFontSize(cell),
                        }}
                        data-value={cell}
                      >
                        {cell}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mobile-controls">
          <div className="control-row">
            <button 
              className="mobile-control-btn up"
              onClick={() => move('up')}
            >
              ↑
            </button>
          </div>
          <div className="control-row">
            <button 
              className="mobile-control-btn left"
              onClick={() => move('left')}
            >
              ←
            </button>
            <div className="spacer"></div>
            <button 
              className="mobile-control-btn right"
              onClick={() => move('right')}
            >
              →
            </button>
          </div>
          <div className="control-row">
            <button 
              className="mobile-control-btn down"
              onClick={() => move('down')}
            >
              ↓
            </button>
          </div>
        </div>
      </div>

      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-content">
            <h3>🎮 Игра окончена!</h3>
            <div className="final-score">
              <p>Ваш счет: <strong>{score}</strong></p>
              <p>Максимальная плитка: <strong>{Math.max(...board.flat())}</strong></p>
            </div>
            <button 
              className="play-again-btn"
              onClick={initializeBoard}
            >
              Играть снова
            </button>
          </div>
        </div>
      )}

      {won && (
        <div className="win-overlay">
          <div className="win-content">
            <div className="confetti">🎉</div>
            <h3>🏆 Победа!</h3>
            <p>Вы получили плитку 2048!</p>
            <div className="win-buttons">
              <button 
                className="continue-btn"
                onClick={() => setWon(false)}
              >
                Продолжить
              </button>
              <button 
                className="restart-btn"
                onClick={initializeBoard}
              >
                Новая игра
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game2048;