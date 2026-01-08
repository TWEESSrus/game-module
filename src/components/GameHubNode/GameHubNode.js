import React, { memo, useMemo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

import SnakeGame from '../../games/Snake/SnakeGame';
import Game2048 from '../../games/Game2048/Game2048';
import MemoryGame from '../../games/Memory/MemoryGame';
import ClickerGame from '../../games/Clicker/ClickerGame';
import Pong from '../../games/Pong/Pong';
import PlatformerGame from '../../games/Platformer/PlatformerGame';

import './GameHubNode.css';

const MENU_SIZE = { width: 560, height: 520 };

// Размеры ноды “под игру” (подбираем без скролла)
const GAME_NODE_SIZES = {
  snake: { width: 760, height: 1000 },
  '2048': { width: 560, height: 780 },
  memory: { width: 980, height: 820 },
  clicker: { width: 980, height: 760 },
  pong: { width: 760, height: 780 },
  platformer: { width: 980, height: 720 },
};

const GameHubNode = memo(({ id, data, selected, overlayMode = false, overlayGameId }) => {
  const games = useMemo(
    () => [
      { id: 'snake', title: '🐍 Змейка', desc: 'Классика на сетке', component: <SnakeGame /> },
      { id: '2048', title: '🔢 2048', desc: 'Собери 2048', component: <Game2048 /> },
      { id: 'memory', title: '🧠 Память', desc: 'Найди пары', component: <MemoryGame /> },
      { id: 'clicker', title: '🖱️ Кликер', desc: 'Кликай и прокачивай', component: <ClickerGame /> },
      { id: 'pong', title: '🏓 Пинг-Понг', desc: 'Ракетка и мяч', component: <Pong /> },
      { id: 'platformer', title: '👾 Платформер', desc: 'Прыгай и беги', component: <PlatformerGame /> },
    ],
    []
  );

  // view: 'menu' | 'game'
  const [view, setView] = useState('menu');
  const [currentGame, setCurrentGame] = useState(games[0].id);
  const [currentScore, setCurrentScore] = useState(0);

  // если это overlay — игра задаётся извне
  useEffect(() => {
    if (overlayMode && overlayGameId) {
      setView('game');
      setCurrentGame(overlayGameId);
      setCurrentScore(0);
    }
  }, [overlayMode, overlayGameId]);

  const active = useMemo(() => games.find((g) => g.id === currentGame), [games, currentGame]);

  // слушаем обновления счёта
  useEffect(() => {
    const handleScoreUpdate = (e) => {
      const d = e?.detail;
      if (!d) return;
      if (d.game === currentGame) setCurrentScore(d.score ?? 0);
    };
    window.addEventListener('gameScoreUpdate', handleScoreUpdate);
    return () => window.removeEventListener('gameScoreUpdate', handleScoreUpdate);
  }, [currentGame]);

  // ✅ говорим App: “поставь такой размер ноды” (в пикселях экрана)
  useEffect(() => {
    const size =
      overlayMode ? GAME_NODE_SIZES[currentGame] :
      view === 'menu' ? MENU_SIZE :
      (GAME_NODE_SIZES[currentGame] || MENU_SIZE);

    window.dispatchEvent(
      new CustomEvent('resizeGameHubNode', {
        detail: { nodeId: id, width: size.width, height: size.height },
      })
    );
  }, [id, view, currentGame, overlayMode]);

  const openOverlay = () => {
    window.dispatchEvent(
      new CustomEvent('openGameOverlay', {
        detail: { gameId: currentGame, gameTitle: active?.title || '' },
      })
    );
  };

  const backToMenu = () => {
    setView('menu');
    setCurrentScore(0);
  };

  const startGame = (gameId) => {
    setCurrentGame(gameId);
    setCurrentScore(0);
    setView('game');
  };

  // В overlay-режиме мы не показываем handles и не даём перетаскивать
  if (overlayMode) {
    return (
      <div className="game-overlay-container nodrag">
        <div className="game-overlay-game nodrag">{active?.component}</div>
      </div>
    );
  }

  return (
    <div className={`gamehub-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} />

      {/* ✅ DRAG HANDLE (таскаем только за шапку) */}
      <div className="gamehub-drag-handle">
        <div className="gamehub-title">{data?.label ?? '🎮 Игровой хаб'}</div>
        <div className="gamehub-subtitle">
          {view === 'menu'
            ? 'Выбери игру'
            : `Текущая: ${active?.title || ''} • Счёт: ${currentScore}`}
        </div>
      </div>

      {/* CONTENT */}
      <div className="gamehub-content nodrag">
        {view === 'menu' ? (
          <div className="gamehub-menu nodrag">
            <div className="gamehub-menu-title nodrag">Выбор игры</div>

            <div className="gamehub-menu-grid nodrag">
              {games.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className="gamehub-card nodrag"
                  onClick={() => startGame(g.id)}
                >
                  <div className="gamehub-card-title">{g.title}</div>
                  <div className="gamehub-card-desc">{g.desc}</div>
                  <div className="gamehub-card-cta">Играть →</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="gamehub-game-screen nodrag">
            <div className="gamehub-game-topbar nodrag">
              <button type="button" className="gamehub-top-btn nodrag" onClick={backToMenu}>
                ← Меню
              </button>

              <div className="gamehub-top-title nodrag">{active?.title}</div>

              <button
                type="button"
                className="gamehub-top-btn nodrag"
                onClick={openOverlay}
                title="Развернуть игру"
              >
                🔼 Развернуть
              </button>
            </div>

            <div className="gamehub-game-wrap nodrag">
              {active?.component}
            </div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

export default GameHubNode;