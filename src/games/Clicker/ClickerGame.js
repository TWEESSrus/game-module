import React, { useState, useEffect } from 'react';
import './ClickerGame.css';

const ClickerGame = () => {
  const [clicks, setClicks] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [autoClickerLevel, setAutoClickerLevel] = useState(0);
  const [autoClickerRate, setAutoClickerRate] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [upgrades, setUpgrades] = useState([
    { id: 1, name: '💪 Более сильный палец', cost: 50, power: 2, purchased: false },
    { id: 2, name: '⚡ Энергетик', cost: 200, power: 5, purchased: false },
    { id: 3, name: '🚀 Космический кликер', cost: 1000, power: 10, purchased: false },
    { id: 4, name: '🤖 Автокликер Lv1', cost: 500, rate: 1, purchased: false },
    { id: 5, name: '🏭 Автокликер Lv2', cost: 2000, rate: 5, purchased: false },
    { id: 6, name: '🚀 Автокликер Lv3', cost: 10000, rate: 10, purchased: false },
    { id: 7, name: '✨ Множитель x2', cost: 1500, mult: 2, purchased: false },
    { id: 8, name: '🌈 Множитель x5', cost: 7500, mult: 5, purchased: false },
  ]);
  const [abilities, setAbilities] = useState([
    { id: 1, name: '💥 Взрывной клик', cost: 100, cooldown: 30, currentCd: 0, power: 100 },
    { id: 2, name: '⏱️ Ускорение времени', cost: 300, cooldown: 60, currentCd: 0, effect: 'double' },
    { id: 3, name: '💰 Золотая лихорадка', cost: 1000, cooldown: 120, currentCd: 0, effect: 'bonus' },
  ]);
  const [achievements, setAchievements] = useState([
    { id: 1, name: '🎯 Первые 100 кликов', target: 100, achieved: false },
    { id: 2, name: '💪 1000 силы', target: 1000, achieved: false },
    { id: 3, name: '🚀 Автокликер мастер', target: 5, achieved: false },
    { id: 4, name: '💰 Миллионер', target: 1000000, achieved: false },
  ]);
  const [shopOpen, setShopOpen] = useState(false);

  useEffect(() => {
    if (autoClickerRate > 0) {
      const interval = setInterval(() => {
        setClicks(prev => prev + (autoClickerRate * multiplier));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [autoClickerRate, multiplier]);

  useEffect(() => {
    const abilityInterval = setInterval(() => {
      setAbilities(prev => prev.map(ability => ({
        ...ability,
        currentCd: ability.currentCd > 0 ? ability.currentCd - 1 : 0
      })));
    }, 1000);
    return () => clearInterval(abilityInterval);
  }, []);

  useEffect(() => {
    checkAchievements();
    const event = new CustomEvent('gameScoreUpdate', {
      detail: { game: 'clicker', score: clicks }
    });
    window.dispatchEvent(event);
  }, [clicks, clickPower, autoClickerLevel]);

  const handleClick = () => {
    setClicks(prev => prev + (clickPower * multiplier));
  };

  const buyUpgrade = (upgrade) => {
    if (clicks >= upgrade.cost && !upgrade.purchased) {
      setClicks(prev => prev - upgrade.cost);
      
      if (upgrade.power) {
        setClickPower(prev => prev + upgrade.power);
      } else if (upgrade.rate) {
        setAutoClickerLevel(prev => prev + 1);
        setAutoClickerRate(prev => prev + upgrade.rate);
      } else if (upgrade.mult) {
        setMultiplier(prev => prev * upgrade.mult);
      }
      
      setUpgrades(prev => prev.map(u => 
        u.id === upgrade.id ? { ...u, purchased: true } : u
      ));
    }
  };

  // ИЗМЕНИЛ НАЗВАНИЕ ФУНКЦИИ С useAbility НА activateAbility
  const activateAbility = (ability) => {
    if (clicks >= ability.cost && ability.currentCd === 0) {
      setClicks(prev => prev - ability.cost);
      
      if (ability.power) {
        setClicks(prev => prev + ability.power * multiplier);
      } else if (ability.effect === 'double') {
        const oldMultiplier = multiplier;
        setMultiplier(prev => prev * 2);
        setTimeout(() => setMultiplier(oldMultiplier), 10000);
      } else if (ability.effect === 'bonus') {
        setClicks(prev => prev + 5000 * multiplier);
      }
      
      setAbilities(prev => prev.map(a => 
        a.id === ability.id ? { ...a, currentCd: a.cooldown } : a
      ));
    }
  };

  const checkAchievements = () => {
    const newAchievements = achievements.map(achievement => {
      let achieved = false;
      switch(achievement.id) {
        case 1: achieved = clicks >= achievement.target; break;
        case 2: achieved = clickPower >= achievement.target; break;
        case 3: achieved = autoClickerLevel >= achievement.target; break;
        case 4: achieved = clicks >= achievement.target; break;
        default: break;
      }
      return { ...achievement, achieved };
    });
    setAchievements(newAchievements);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="clicker-game">
      <div className="game-header">
        <div className="header-controls">
          <button 
            className={`shop-toggle ${shopOpen ? 'active' : ''}`}
            onClick={() => setShopOpen(!shopOpen)}
          >
            {shopOpen ? '✖️ Закрыть магазин' : '🛒 Магазин'}
          </button>
        </div>
      </div>

      <div className="game-stats">
        <div className="stat-box">
          <div className="stat-label">Кликов</div>
          <div className="stat-value click-count">{formatNumber(clicks)}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Сила клика</div>
          <div className="stat-value">{clickPower}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Множитель</div>
          <div className="stat-value multiplier">x{multiplier}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Автокликер</div>
          <div className="stat-value">{autoClickerRate}/сек</div>
        </div>
      </div>

      <div className="main-game-area">
        <div className="clicker-container">
          <button 
            className="click-button"
            onClick={handleClick}
          >
            <div className="click-button-text">
              <div className="click-power">+{clickPower * multiplier}</div>
              <div className="click-label">КЛИКАЙ!</div>
              <div className="click-hint">Зарабатывай очки</div>
            </div>
          </button>
          
          <div className="abilities">
            <h3>🔮 Способности</h3>
            <div className="abilities-grid">
              {abilities.map(ability => (
                <button
                  key={ability.id}
                  className={`ability-btn ${ability.currentCd > 0 ? 'cooldown' : ''}`}
                  onClick={() => activateAbility(ability)}
                  disabled={ability.currentCd > 0 || clicks < ability.cost}
                >
                  <div className="ability-name">{ability.name}</div>
                  <div className="ability-cost">💰 {formatNumber(ability.cost)}</div>
                  <div className="ability-cooldown">
                    {ability.currentCd > 0 ? `${ability.currentCd}с` : 'Готово!'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {shopOpen && (
          <div className="shop-panel">
            <h3>🛒 Магазин улучшений</h3>
            <div className="upgrades-grid">
              {upgrades.map(upgrade => (
                <div 
                  key={upgrade.id} 
                  className={`upgrade-item ${upgrade.purchased ? 'purchased' : ''} ${clicks >= upgrade.cost ? 'affordable' : ''}`}
                >
                  <div className="upgrade-content">
                    <div className="upgrade-name">{upgrade.name}</div>
                    <div className="upgrade-stats">
                      {upgrade.power && <span>+{upgrade.power} силы</span>}
                      {upgrade.rate && <span>+{upgrade.rate}/сек</span>}
                      {upgrade.mult && <span>x{upgrade.mult} множитель</span>}
                    </div>
                    <div className="upgrade-cost">💰 {formatNumber(upgrade.cost)}</div>
                  </div>
                  <button
                    className="buy-btn"
                    onClick={() => buyUpgrade(upgrade)}
                    disabled={upgrade.purchased || clicks < upgrade.cost}
                  >
                    {upgrade.purchased ? 'Куплено' : 'Купить'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="achievements">
        <h3>🏆 Достижения</h3>
        <div className="achievements-grid">
          {achievements.map(achievement => (
            <div 
              key={achievement.id} 
              className={`achievement ${achievement.achieved ? 'achieved' : ''}`}
            >
              <div className="achievement-icon">
                {achievement.achieved ? '✅' : '🔒'}
              </div>
              <div className="achievement-info">
                <div className="achievement-name">{achievement.name}</div>
                <div className="achievement-progress">
                  Прогресс: {formatNumber(achievement.target)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="game-instructions">
        <p>💡 <strong>Совет:</strong> Покупайте автокликеры чтобы зарабатывать пассивно!</p>
        <p>🎯 Используйте способности для больших рывков!</p>
      </div>
    </div>
  );
};

export default ClickerGame;