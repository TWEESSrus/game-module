import React, { useState, useEffect } from 'react';
import './MemoryGame.css';

const MemoryGame = () => {
  const [difficulty, setDifficulty] = useState('medium');
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);

  const difficulties = {
    easy: { pairs: 8, gridSize: 4 },
    medium: { pairs: 12, gridSize: 4 },
    hard: { pairs: 16, gridSize: 4 }
  };

  const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'];

  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  useEffect(() => {
    if (score > 0) {
      const event = new CustomEvent('gameScoreUpdate', {
        detail: { game: 'memory', score }
      });
      window.dispatchEvent(event);
    }
  }, [score]);

  const initializeGame = () => {
    const { pairs } = difficulties[difficulty];
    const selectedEmojis = emojis.slice(0, pairs);
    const cardPairs = [...selectedEmojis, ...selectedEmojis];
    
    const shuffledCards = cardPairs
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        flipped: false
      }));
    
    setCards(shuffledCards);
    setFlipped([]);
    setSolved([]);
    setScore(0);
    setMoves(0);
  };

  const handleCardClick = (id) => {
    if (disabled || flipped.length === 2 || solved.includes(id) || flipped.includes(id)) {
      return;
    }

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    setMoves(moves + 1);

    if (newFlipped.length === 2) {
      setDisabled(true);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);

      if (firstCard.emoji === secondCard.emoji) {
        const bonus = difficulty === 'hard' ? 15 : difficulty === 'medium' ? 10 : 5;
        setSolved([...solved, firstId, secondId]);
        setScore(score + bonus);
        setFlipped([]);
        setDisabled(false);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setDisabled(false);
        }, 1000);
      }
    }
  };

  const changeDifficulty = (newDifficulty) => {
    if (window.confirm('Сменить сложность? Текущая игра будет сброшена.')) {
      setDifficulty(newDifficulty);
    }
  };

  const getCardSize = () => {
    switch(difficulty) {
      case 'easy': return 'large';
      case 'medium': return 'medium';
      case 'hard': return 'small';
      default: return 'medium';
    }
  };

  return (
    <div className="memory-game">
      
      <div className="difficulty-selector">
        <div className="difficulty-label">Сложность:</div>
        {['easy', 'medium', 'hard'].map(diff => (
          <button
            key={diff}
            className={`difficulty-btn ${difficulty === diff ? 'active' : ''}`}
            onClick={() => changeDifficulty(diff)}
          >
            {diff === 'easy' && '🐢 Легкая (8 пар)'}
            {diff === 'medium' && '⚡ Средняя (12 пар)'}
            {diff === 'hard' && '🔥 Сложная (16 пар)'}
          </button>
        ))}
      </div>
      
      <div className="game-stats">
        <div className="stat">
          <span>Счет:</span>
          <strong>{score}</strong>
        </div>
        <div className="stat">
          <span>Ходы:</span>
          <strong>{moves}</strong>
        </div>
        <div className="stat">
          <span>Найдено пар:</span>
          <strong>{solved.length / 2}</strong>
        </div>
      </div>

      <div className="memory-board-container">
        <div className={`memory-board ${difficulty}`}>
          {cards.map(card => (
            <div
              key={card.id}
              className={`memory-card ${getCardSize()} ${
                flipped.includes(card.id) || solved.includes(card.id) ? 'flipped' : ''
              } ${solved.includes(card.id) ? 'matched' : ''}`}
              onClick={() => handleCardClick(card.id)}
            >
              <div className="card-front">
                ?
              </div>
              <div className="card-back">
                {card.emoji}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="game-controls">
        <button className="restart-btn" onClick={initializeGame}>
          Новая игра
        </button>
      </div>

      <div className="game-instructions">
        <p>Найдите все пары одинаковых эмодзи!</p>
        <p>Бонус за пару: {difficulty === 'hard' ? '15' : difficulty === 'medium' ? '10' : '5'} очков</p>
      </div>
    </div>
  );
};

export default MemoryGame;