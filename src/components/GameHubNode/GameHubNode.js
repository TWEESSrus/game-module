import React, { memo, useEffect, useMemo, useState } from 'react';
import { Handle, Position } from 'reactflow';

import SnakeGame from '../../games/Snake/SnakeGame';
import Game2048 from '../../games/Game2048/Game2048';
import MemoryGame from '../../games/Memory/MemoryGame';
import ClickerGame from '../../games/Clicker/ClickerGame';
import Pong from '../../games/Pong/Pong';
import PlatformerGame from '../../games/Platformer/PlatformerGame';

const GameHubNode = memo(({ id, data, selected }) => {
  const games = useMemo(
    () => [
      { id: 'snake', title: '🐍 Змейка', size: { width: 430, height: 520 }, component: <SnakeGame /> },
      { id: '2048', title: '🔢 2048', size: { width: 430, height: 600 }, component: <Game2048 /> },
      { id: 'memory', title: '🧠 Память', size: { width: 430, height: 540 }, component: <MemoryGame /> },
      { id: 'clicker', title: '🖱️ Кликер', size: { width: 560, height: 640 }, component: <ClickerGame /> },
      { id: 'pong', title: '🏓 Пинг-Понг', size: { width: 650, height: 520 }, component: <Pong /> },
      { id: 'platformer', title: '👾 Платформер', size: { width: 720, height: 560 }, component: <PlatformerGame /> },
    ],
    []
  );

  const [currentGame, setCurrentGame] = useState(games[0].id);
  const [currentScore, setCurrentScore] = useState(0);

  // режим развернутой ноды
  const [expanded, setExpanded] = useState(false);

  const active = useMemo(() => games.find((g) => g.id === currentGame), [games, currentGame]);

  // слушаем очки от игр
  useEffect(() => {
    const handleScoreUpdate = (e) => {
      const d = e?.detail;
      if (!d) return;
      if (d.game === currentGame) setCurrentScore(d.score ?? 0);
    };
    window.addEventListener('gameScoreUpdate', handleScoreUpdate);
    return () => window.removeEventListener('gameScoreUpdate', handleScoreUpdate);
  }, [currentGame]);

  // вычисляем размер ноды:
  // - если expanded=true → большой размер
  // - иначе → размер под конкретную игру
  const getNodeSize = () => {
    if (expanded) return { width: 980, height: 720 };
    return active?.size || { width: 520, height: 560 };
  };

  // просим App.js изменить размер ноды
  useEffect(() => {
    const size = getNodeSize();
    window.dispatchEvent(
      new CustomEvent('resizeGameNode', {
        detail: { nodeId: id, size },
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, currentGame, id]);

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

      {/* HEADER: drag handle */}
      <div
        className="drag-handle"
        style={{
          padding: 12,
          borderBottom: '1px solid #e1e5e9',
          cursor: 'grab',
          userSelect: 'none',
          background: '#fff',
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
            onClick={() => setExpanded((v) => !v)}
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #e1e5e9',
              background: expanded ? '#eef2ff' : '#f8f9fa',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
            title={expanded ? 'Свернуть ноду' : 'Развернуть ноду'}
          >
            {expanded ? '🔽 Свернуть' : '🔼 Развернуть'}
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

      {/* GAME AREA: безопасно — если не помещается, появляется скролл */}
      <div
        className="nodrag game-hub-content"
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          background: '#fff',
        }}
      >
        <div
          className="game-hub-inner"
          style={{
            padding: expanded ? 12 : 10,
            minWidth: 0,
            minHeight: 0,
          }}
        >
          {active?.component}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

export default GameHubNode;