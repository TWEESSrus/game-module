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
  snake: { width: 700, height: 1000 },
  '2048': { width: 560, height: 780 },
  memory: { width: 680, height: 890 },
  clicker: { width: 980, height: 760 },
  pong: { width: 760, height: 780 },
  platformer: { width: 980, height: 750 },
};

// ====== API BASE ======
const STATS_API_BASE = process.env.REACT_APP_STATS_API_URL || 'http://localhost:4000';

// ====== AUTH (storage) ======
function getAuthFromStorage() {
  const token =
    localStorage.getItem('jwt') ||
    localStorage.getItem('token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('accessToken') ||
    '';

  let user = null;
  const userRaw =
    localStorage.getItem('user') ||
    localStorage.getItem('userInfo') ||
    localStorage.getItem('profile');

  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      user = null;
    }
  }

  const userId =
    (user && (user.id || user.userId || user._id)) ||
    localStorage.getItem('userId') ||
    localStorage.getItem('uid') ||
    '';

  return { userId, token };
}

// ====== USER STATS ======
async function fetchUserStats(userId, token) {
  const res = await fetch(`${STATS_API_BASE}/api/stats/${encodeURIComponent(userId)}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`GET stats failed: ${res.status}`);
  return res.json();
}

async function postGameStat({ userId, token, gameId, score }) {
  const res = await fetch(`${STATS_API_BASE}/api/stats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ userId, gameId, score }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`POST stats failed: ${res.status} ${text}`);
  }
  return res.json();
}

// ====== LEADERBOARD (TOP-10) ======
async function fetchLeaderboard(gameId, limit = 10) {
  const res = await fetch(
    `${STATS_API_BASE}/api/leaderboard/${encodeURIComponent(gameId)}?limit=${encodeURIComponent(limit)}`
  );
  if (!res.ok) throw new Error(`GET leaderboard failed: ${res.status}`);
  return res.json();
}

// ====== USERS (NICKNAME) ======
async function upsertNickname({ userId, nickname }) {
  const res = await fetch(`${STATS_API_BASE}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, nickname }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`POST /api/users failed: ${res.status} ${text}`);
  }
  return res.json();
}

// GET /api/users/:userId -> { user_id, nickname, updated_at } | null
async function fetchNickname(userId) {
  const res = await fetch(`${STATS_API_BASE}/api/users/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error(`GET /api/users/:userId failed: ${res.status}`);
  return res.json();
}

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

  // вкладки меню
  const [menuTab, setMenuTab] = useState('games'); // 'games' | 'stats'

  // ====== USER STATS STATE ======
  const [userStats, setUserStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');
  // ==============================

  // ====== LEADERBOARD STATE ======
  const [lbGame, setLbGame] = useState(games[0].id);
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [lbError, setLbError] = useState('');
  // ==============================

  // ====== NICKNAME UI STATE ======
  const [nicknameInput, setNicknameInput] = useState('');
  const [nickSaving, setNickSaving] = useState(false);
  const [nickMsg, setNickMsg] = useState('');
  // ==============================

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
      overlayMode
        ? GAME_NODE_SIZES[currentGame]
        : view === 'menu'
          ? MENU_SIZE
          : (GAME_NODE_SIZES[currentGame] || MENU_SIZE);

    window.dispatchEvent(
      new CustomEvent('resizeGameHubNode', {
        detail: { nodeId: id, width: size.width, height: size.height },
      })
    );
  }, [id, view, currentGame, overlayMode]);

  const backToMenu = () => {
    setView('menu');
    setCurrentScore(0);
  };

  const startGame = (gameId) => {
    setCurrentGame(gameId);
    setCurrentScore(0);
    setView('game');
  };

  // ====== USER STATS: подгрузка при входе в игру / смене игры ======
  useEffect(() => {
    if (overlayMode) return;
    if (view !== 'game') return;

    const { userId, token } = getAuthFromStorage();
    if (!userId) {
      setStatsError('Нет userId в storage');
      setUserStats([]);
      return;
    }

    let cancelled = false;
    setStatsLoading(true);
    setStatsError('');

    fetchUserStats(userId, token)
      .then((rows) => {
        if (cancelled) return;
        setUserStats(Array.isArray(rows) ? rows : []);
      })
      .catch((err) => {
        if (cancelled) return;
        setStatsError('Не удалось загрузить статистику');
        setUserStats([]);
        console.warn(err);
      })
      .finally(() => {
        if (cancelled) return;
        setStatsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [view, currentGame, overlayMode]);

  const currentGameStat = useMemo(() => {
    const row = userStats.find((r) => r?.game_id === currentGame);
    if (!row) return null;
    return {
      best: row.best_score ?? 0,
      last: row.last_score ?? 0,
      plays: row.plays ?? 0,
    };
  }, [userStats, currentGame]);

  const saveScore = async () => {
    const { userId, token } = getAuthFromStorage();
    if (!userId) {
      setStatsError('Нет userId в storage');
      return;
    }

    try {
      setStatsError('');
      setStatsLoading(true);

      await postGameStat({
        userId,
        token,
        gameId: currentGame,
        score: Number(currentScore) || 0,
      });

      const rows = await fetchUserStats(userId, token);
      setUserStats(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setStatsError('Не удалось сохранить результат');
      console.warn(err);
    } finally {
      setStatsLoading(false);
    }
  };
  // ==================================================================

  // ====== LEADERBOARD: подгрузка когда открыли вкладку статистики ======
  const loadLeaderboard = async (gameId) => {
    try {
      setLbError('');
      setLbLoading(true);
      const rows = await fetchLeaderboard(gameId, 10);
      setLeaderboard(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setLbError('Не удалось загрузить топ-10');
      setLeaderboard([]);
      console.warn(err);
    } finally {
      setLbLoading(false);
    }
  };

  useEffect(() => {
    if (overlayMode) return;
    if (view !== 'menu') return;
    if (menuTab !== 'stats') return;

    // грузим топ
    loadLeaderboard(lbGame);

    // и пробуем подтянуть текущий ник в поле
    const { userId } = getAuthFromStorage();
    if (!userId) return;

    fetchNickname(userId)
      .then((u) => {
        if (u?.nickname) setNicknameInput(u.nickname);
      })
      .catch((e) => {
        // если endpoint ещё не добавили — не мешаем работе
        console.warn(e);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuTab, lbGame, view, overlayMode]);
  // ===================================================================

  // ====== Nickname save handler ======
  const saveNickname = async () => {
    const { userId } = getAuthFromStorage();
    if (!userId) {
      setNickMsg('⚠️ Нет userId в storage');
      return;
    }
    const nick = (nicknameInput || '').trim();
    if (!nick) {
      setNickMsg('⚠️ Введи никнейм');
      return;
    }

    try {
      setNickMsg('');
      setNickSaving(true);
      await upsertNickname({ userId, nickname: nick });
      setNicknameInput(nick); // ✅ фиксируем в поле
      setNickMsg('✅ Ник сохранён');
      await loadLeaderboard(lbGame);
    } catch (e) {
      console.warn(e);
      setNickMsg('⚠️ Не удалось сохранить ник');
    } finally {
      setNickSaving(false);
    }
  };
  // ==================================

  // В overlay-режиме мы не показываем handles и не даём перетаскивать
  if (overlayMode) {
    return (
      <div className="game-overlay-container nodrag">
        <div className="game-overlay-game nodrag">{active?.component}</div>
      </div>
    );
  }

  const subtitleText =
    view === 'menu'
      ? menuTab === 'stats'
        ? 'Лидерборды: топ-10 по играм'
        : 'Выбери игру'
      : `Текущая: ${active?.title || ''} • Счёт: ${currentScore}${
          currentGameStat
            ? ` • Best: ${currentGameStat.best} • Last: ${currentGameStat.last} • Plays: ${currentGameStat.plays}`
            : ''
        }`;

  return (
    <div className={`gamehub-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} />

      {/* ✅ DRAG HANDLE (таскаем только за шапку) */}
      <div className="gamehub-drag-handle">
        <div className="gamehub-title">{data?.label ?? '🎮 Игровой хаб'}</div>
        <div className="gamehub-subtitle">{subtitleText}</div>
      </div>

      {/* CONTENT */}
      <div className="gamehub-content nodrag">
        {view === 'menu' ? (
          <div className="gamehub-menu nodrag">
            <div className="gamehub-menu-head nodrag">
              <div className="gamehub-menu-title nodrag">
                {menuTab === 'games' ? 'Выбор игры' : 'Статистика игроков'}
              </div>

              <div className="gamehub-menu-tabs nodrag">
                <button
                  type="button"
                  className={`gamehub-tab nodrag ${menuTab === 'games' ? 'active' : ''}`}
                  onClick={() => setMenuTab('games')}
                >
                  🎮 Игры
                </button>
                <button
                  type="button"
                  className={`gamehub-tab nodrag ${menuTab === 'stats' ? 'active' : ''}`}
                  onClick={() => {
                    setMenuTab('stats');
                    setNickMsg('');
                  }}
                >
                  🏆 Статистика
                </button>
              </div>
            </div>

            {menuTab === 'games' ? (
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
            ) : (
              <div className="gamehub-stats nodrag">
                {/* Ввод ника */}
                <div className="gamehub-nick-box nodrag">
                  <div className="gamehub-nick-title nodrag">Твой никнейм</div>
                  <div className="gamehub-nick-row nodrag">
                    <input
                      className="gamehub-nick-input nodrag"
                      placeholder="Например: Алекс"
                      value={nicknameInput}
                      onChange={(e) => setNicknameInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="gamehub-top-btn nodrag"
                      onClick={saveNickname}
                      disabled={nickSaving}
                      title="Сохранить никнейм"
                    >
                      💾 Сохранить ник
                    </button>
                  </div>
                  {nickMsg ? <div className="gamehub-nick-msg nodrag">{nickMsg}</div> : null}
                </div>

                {/* Лидерборд */}
                <div className="gamehub-stats-controls nodrag">
                  <label className="gamehub-stats-label nodrag">
                    Игра:
                    <select
                      className="gamehub-stats-select nodrag"
                      value={lbGame}
                      onChange={(e) => setLbGame(e.target.value)}
                    >
                      {games.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    className="gamehub-top-btn nodrag"
                    onClick={() => loadLeaderboard(lbGame)}
                    disabled={lbLoading}
                    title="Обновить топ-10"
                  >
                    🔄 Обновить
                  </button>
                </div>

                {lbError ? (
                  <div className="gamehub-stats-error nodrag">⚠️ {lbError}</div>
                ) : lbLoading ? (
                  <div className="gamehub-stats-loading nodrag">Загрузка…</div>
                ) : leaderboard.length === 0 ? (
                  <div className="gamehub-stats-empty nodrag">(пока нет данных)</div>
                ) : (
                  <ol className="gamehub-leaderboard nodrag">
                    {leaderboard.map((row, idx) => (
                      <li key={`${row.user_id}-${idx}`} className="gamehub-leaderboard-item nodrag">
                        <span className="gamehub-lb-rank nodrag">#{idx + 1}</span>
                        <span className="gamehub-lb-user nodrag">{row.nickname || row.user_id}</span>
                        <span className="gamehub-lb-score nodrag">{row.best_score}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="gamehub-game-screen nodrag">
            <div className="gamehub-game-topbar nodrag">
              <button type="button" className="gamehub-top-btn nodrag" onClick={backToMenu}>
                ← Меню
              </button>

              <div className="gamehub-top-title nodrag">{active?.title}</div>

              <div className="gamehub-top-right nodrag">
                {statsError ? (
                  <span className="gamehub-stats-text nodrag">⚠️ {statsError}</span>
                ) : currentGameStat ? (
                  <span className="gamehub-stats-text nodrag">
                    Best {currentGameStat.best} • Last {currentGameStat.last} • Plays {currentGameStat.plays}
                  </span>
                ) : statsLoading ? (
                  <span className="gamehub-stats-text nodrag">Загрузка…</span>
                ) : (
                  <span className="gamehub-stats-text nodrag">(нет данных)</span>
                )}

                <button
                  type="button"
                  className="gamehub-top-btn nodrag"
                  onClick={saveScore}
                  title="Сохранить текущий результат"
                  disabled={statsLoading}
                >
                  💾 Сохранить
                </button>
              </div>
            </div>

            <div className="gamehub-game-wrap nodrag">{active?.component}</div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

export default GameHubNode;