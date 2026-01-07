import React, { memo, useMemo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

import SnakeGame from '../../games/Snake/SnakeGame';
import Game2048 from '../../games/Game2048/Game2048';
import MemoryGame from '../../games/Memory/MemoryGame';
import ClickerGame from '../../games/Clicker/ClickerGame';
import Pong from '../../games/Pong/Pong';
import PlatformerGame from '../../games/Platformer/PlatformerGame';

const GameHubNode = memo(({ id, data, selected, overlayMode = false, overlayGameId }) => {
  const games = useMemo(
    () => [
      { id: 'snake', title: '🐍 Змейка', component: <SnakeGame /> },
      { id: '2048', title: '🔢 2048', component: <Game2048 /> },
      { id: 'memory', title: '🧠 Память', component: <MemoryGame /> },
      { id: 'clicker', title: '🖱️ Кликер', component: <ClickerGame /> },
      { id: 'pong', title: '🏓 Пинг-Понг', component: <Pong /> },
      { id: 'platformer', title: '👾 Платформер', component: <PlatformerGame /> },
    ],
    []
  );

  const [currentGame, setCurrentGame] = useState(games[0].id);
  const [currentScore, setCurrentScore] = useState(0);

  // если это overlay — игра задаётся извне
  useEffect(() => {
    if (overlayMode && overlayGameId) {
      setCurrentGame(overlayGameId);
      setCurrentScore(0);
    }
  }, [overlayMode, overlayGameId]);

  const active = useMemo(() => games.find((g) => g.id === currentGame), [games, currentGame]);

  useEffect(() => {
    const handleScoreUpdate = (e) => {
      const d = e?.detail;
      if (!d) return;
      if (d.game === currentGame) setCurrentScore(d.score ?? 0);
    };
    window.addEventListener('gameScoreUpdate', handleScoreUpdate);
    return () => window.removeEventListener('gameScoreUpdate', handleScoreUpdate);
  }, [currentGame]);

  const openOverlay = () => {
    window.dispatchEvent(
      new CustomEvent('openGameOverlay', {
        detail: { gameId: currentGame, gameTitle: active?.title || '' },
      })
    );
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
    <div
      className="game-hub-node"
      style={{
        width: '100%',
        height: '100%',
        background: '#fff',
        borderRadius: 12,
        border: selected ? '2px solid #667eea' : '1px solid #e1e5e9',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Handle type="target" position={Position.Top} />

      {/* HEADER (drag handle) */}
      <div
        className="drag-handle"
        style={{
          padding: 12,
          borderBottom: '1px solid #e1e5e9',
          cursor: 'grab',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{data?.label ?? '🎮 Игры'}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
              Текущая: <strong>{active?.title}</strong> • Счёт: <strong>{currentScore}</strong>
            </div>
          </div>

          <button
            className="nodrag"
            onClick={openOverlay}
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #e1e5e9',
              background: '#eef2ff',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
            title="Развернуть игру"
          >
            🔼 Развернуть
          </button>
        </div>

        <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {games.map((g) => (
            <button
              key={g.id}
              className="nodrag"
              onClick={() => {
                setCurrentGame(g.id);
                setCurrentScore(0);
              }}
              style={{
                padding: '6px 10px',
                borderRadius: 999,
                border: g.id === currentGame ? '1px solid #667eea' : '1px solid #e1e5e9',
                background: g.id === currentGame ? '#eef2ff' : '#fff',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {g.title}
            </button>
          ))}
        </div>
      </div>

      {/* GAME AREA: скролл, чтобы ничего не ломалось */}
      <div
        className="nodrag game-hub-content"
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          background: '#fff',
        }}
      >
        <div className="game-hub-inner nodrag" style={{ padding: 10 }}>
          {active?.component}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

export default GameHubNode;