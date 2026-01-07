import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PlatformerGame.css';

const PlatformerGame = () => {
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [level, setLevel] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameStatus, setGameStatus] = useState('ready'); // ready, playing, won, lost
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  
  const gameContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const gameStateRef = useRef(null);
  const keysRef = useRef({ left: false, right: false, up: false });
  const deathAnimationRef = useRef({ active: false, time: 0, scale: 1 });

  // Уровни игры
  const LEVELS = [
    [
      "                                                                                ",
      "                                                                                ",
      "                                                                                ",
      "                                                                                ",
      "                                                                                ",
      "                                                                                ",
      "                                                                  xxx           ",
      "                                                   xx      xx    xx!xx          ",
      "                                    o o      xx                  x!!!x          ",
      "                                                                 xx!xx          ",
      "                                   xxxxx                          xvx           ",
      "                                                                            xx  ",
      "  xx                                      o o                                x  ",
      "  x                     o                                                    x  ",
      "  x                                      xxxxx                             o x  ",
      "  x          xxxx       o                                                    x  ",
      "  x  @       x  x                                                xxxxx       x  ",
      "  xxxxxxxxxxxx  xxxxxxxxxxxxxxx   xxxxxxxxxxxxxxxxxxxx     xxxxxxx   xxxxxxxxx  ",
      "                              x   x                  x     x                    ",
      "                              x!!!x                  x!!!!!x                    ",
      "                              x!!!x                  x!!!!!x                    ",
      "                              xxxxx                  xxxxxxx                    ",
      "                                                                                ",
      "                                                                                "
    ],
    [
      "                                      x!!x                        xxxxxxx                                    x!x  ",
      "                                      x!!x                     xxxx     xxxx                                 x!x  ",
      "                                      x!!xxxxxxxxxx           xx           xx                                x!x  ",
      "                                      xx!!!!!!!!!!xx         xx             xx                               x!x  ",
      "                                       xxxxxxxxxx!!x         x                                    o   o   o  x!x  ",
      "                                                xx!x         x     o   o                                    xx!x  ",
      "                                                 x!x         x                                xxxxxxxxxxxxxxx!!x  ",
      "                                                 xvx         x     x   x                        !!!!!!!!!!!!!!xx  ",
      "                                                             xx  |   |   |  xx            xxxxxxxxxxxxxxxxxxxxx   ",
      "                                                              xx!!!!!!!!!!!xx            v                        ",
      "                                                               xxxx!!!!!xxxx                                      ",
      "                                               x     x            xxxxxxx        xxx         xxx                  ",
      "                                               x     x                           x x         x x                  ",
      "                                               x     x                             x         x                    ",
      "                                               x     x                             xx        x                    ",
      "                                               xx    x                             x         x                    ",
      "                                               x     x      o  o     x   x         x         x                    ",
      "               xxxxxxx        xxx   xxx        x     x               x   x         x         x                    ",
      "              xx     xx         x   x          x     x     xxxxxx    x   x   xxxxxxxxx       x                    ",
      "             xx       xx        x o x          x    xx               x   x   x               x                    ",
      "     @       x         x        x   x          x     x               x   x   x               x                    ",
      "    xxx      x         x        x   x          x     x               x   xxxxx   xxxxxx      x                    ",
      "    x x      x         x       xx o xx         x     x               x     o     x x         x                    ",
      "!!!!x x!!!!!!x         x!!!!!!xx     xx!!!!!!!!xx    x!!!!!!!!!!     x     =     x x         x                    ",
      "!!!!x x!!!!!!x         x!!!!!xx       xxxxxxxxxx     x!!!!!!!xx!     xxxxxxxxxxxxx xx  o o  xx                    ",
      "!!!!x x!!!!!!x         x!!!!!x    o                 xx!!!!!!xx !                    xx     xx                     ",
      "!!!!x x!!!!!!x         x!!!!!x                     xx!!!!!!xx  !                     xxxxxxx                      ",
      "!!!!x x!!!!!!x         x!!!!!xx       xxxxxxxxxxxxxx!!!!!!xx   !                                                  ",
      "!!!!x x!!!!!!x         x!!!!!!xxxxxxxxx!!!!!!!!!!!!!!!!!!xx    !                                                  ",
      "!!!!x x!!!!!!x         x!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!xx     !                                                  "
    ],
    // Третий уровень (прототип)
    [
      "                                                                                                              ",
      "                                                                                                              ",
      "                                                                                                              ",
      "                                                                                                              ",
      "                                                                                                              ",
      "                                        o                                                                     ",
      "                                                                                                              ",
      "                                        x                                                                     ",
      "                                        x                                                                     ",
      "                                        x                                                                     ",
      "                                        x                                                                     ",
      "                                       xxx                                                                    ",
      "                                       x x                 !!!        !!!  xxx                                ",
      "                                       x x                 !x!        !x!                                     ",
      "                                     xxx xxx                x          x                                      ",
      "                                      x   x                 x   oooo   x       xxx                            ",
      "                                      x   x                 x          x      x!!!x                           ",
      "                                      x   x                 xxxxxxxxxxxx       xxx                            ",
      "                                     xx   xx      x   x      x                                                ",
      "                                      x   xxxxxxxxx   xxxxxxxx              x x                               ",
      "                                      x   x           x                    x!!!x                              ",
      "                                      x   x           x                     xxx                               ",
      "                                     xx   xx          x                                                       ",
      "                                      x   x= = = =    x            xxx                                        ",
      "                                      x   x           x           x!!!x                                       ",
      "                                      x   x    = = = =x     o      xxx       xxx                              ",
      "                                     xx   xx          x                     x!!!x                             ",
      "                              o   o   x   x           x     x                xxv        xxx                   ",
      "                                      x   x           x              x                 x!!!x                  ",
      "                             xxx xxx xxx xxx     o o  x!!!!!!!!!!!!!!x                   vx                   ",
      "                             x xxx x x xxx x          x!!!!!!!!!!!!!!x                                        ",
      "                             x             x   xxxxxxxxxxxxxxxxxxxxxxx                                        ",
      "                             xx           xx                                         xxx                      ",
      "  xxx                         x     x     x                                         x!!!x                xxx  ",
      "  x x                         x    xxx    x                                          xxx                 x x  ",
      "  x                           x    xxx    xxxxxxx                        xxxxx                             x  ",
      "  x                           x           x                              x   x                             x  ",
      "  x                           xx          x                              x x x                             x  ",
      "  x                                       x       |xxxx|    |xxxx|     xxx xxx                             x  ",
      "  x                xxx             o o    x                              x         xxx                     x  ",
      "  x               xxxxx       xx          x                             xxx       x!!!x          x         x  ",
      "  x               oxxxo       x    xxx    x                             x x        xxx          xxx        x  ",
      "  x                xxx        xxxxxxxxxxxxx  x oo x    x oo x    x oo  xx xx                    xxx        x  ",
      "  x      @          x         x           x!!x    x!!!!x    x!!!!x    xx   xx                    x         x  ",
      "  xxxxxxxxxxxxxxxxxxxxxxxxxxxxx           xxxxxxxxxxxxxxxxxxxxxxxxxxxxx     xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  ",
      "                                                                                                              ",
      "                                                                                                              "
    ]
  ];

  // Векторный класс
  class Vector {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }

    plus(other) {
      return new Vector(this.x + other.x, this.y + other.y);
    }

    times(scale) {
      return new Vector(this.x * scale, this.y * scale);
    }
  }

  // Класс игрока
  class Player {
    constructor(pos) {
      this.pos = pos.plus(new Vector(0, -0.5));
      this.size = new Vector(0.5, 1);
      this.speed = new Vector(0, 0);
      this.type = "player";
      this.alive = true;
      this.canJump = false;
      this.jumpCooldown = 0;
    }

    moveX(step, level, keys) {
      const playerXSpeed = 10;
      this.speed.x = 0;
      if (keys.left) this.speed.x -= playerXSpeed;
      if (keys.right) this.speed.x += playerXSpeed;

      const motion = new Vector(this.speed.x * step, 0);
      const newPos = this.pos.plus(motion);
      const obstacle = level.obstacleAt(newPos, this.size);
      
      if (!obstacle || obstacle === "lava") {
        this.pos = newPos;
      }
    }

    moveY(step, level, keys) {
      const gravity = 30;
      const jumpSpeed = 17;
      
      this.speed.y += step * gravity;
      const motion = new Vector(0, this.speed.y * step);
      const newPos = this.pos.plus(motion);
      const obstacle = level.obstacleAt(newPos, this.size);
      
      if (obstacle) {
        if (obstacle === "lava") {
          // Если коснулись лавы - смерть
          this.alive = false;
          level.status = "lost";
          this.speed.y = 0;
          return;
        }
        
        // Если уперлись в стену
        if (keys.up && this.canJump && this.jumpCooldown <= 0) {
          this.speed.y = -jumpSpeed;
          this.canJump = false;
          this.jumpCooldown = 0.2;
        } else {
          this.speed.y = 0;
          this.canJump = true;
        }
      } else {
        this.pos = newPos;
        this.canJump = false;
      }
      
      // Охлаждение прыжка
      if (this.jumpCooldown > 0) {
        this.jumpCooldown -= step;
      }
    }

    act(step, level, keys) {
      if (!this.alive) return;
      
      this.moveX(step, level, keys);
      this.moveY(step, level, keys);

      // Проверка выпадения за пределы
      if (this.pos.y > level.height) {
        this.alive = false;
        level.status = "lost";
      }
    }
  }

  // Класс монетки
  class Coin {
    constructor(pos) {
      this.basePos = this.pos = pos;
      this.size = new Vector(0.6, 0.6);
      this.wobble = Math.random() * Math.PI * 2;
      this.type = "coin";
      this.collected = false;
    }

    act(step) {
      if (this.collected) return;
      
      const wobbleSpeed = 8;
      const wobbleDist = 0.07;
      this.wobble += step * wobbleSpeed;
      const wobblePos = Math.sin(this.wobble) * wobbleDist;
      this.pos = this.basePos.plus(new Vector(0, wobblePos));
    }
  }

  // Класс лавы
  class Lava {
    constructor(pos, ch) {
      this.pos = pos;
      this.size = new Vector(1, 1);
      this.type = "lava";
      this.char = ch;
      
      if (ch === "=") {
        this.speed = new Vector(2, 0);
      } else if (ch === '|') {
        this.speed = new Vector(0, 2);
      } else if (ch === 'v') {
        this.speed = new Vector(0, 3);
        this.repeatPos = pos;
      } else if (ch === '!') {
        this.speed = new Vector(0, 0); // Статичная лава
      }
    }

    act(step, level) {
      if (this.char === "=" || this.char === '|' || this.char === 'v') {
        const newPos = this.pos.plus(this.speed.times(step));
        if (!level.obstacleAt(newPos, this.size)) {
          this.pos = newPos;
        } else if (this.repeatPos) {
          this.pos = this.repeatPos;
        } else {
          this.speed = this.speed.times(-1);
        }
      }
      // Статичная лава ('!') не двигается
    }
  }

  // Класс уровня
  class Level {
    constructor(plan) {
      this.width = plan[0].length;
      this.height = plan.length;
      this.grid = [];
      this.actors = [];
      this.coins = 0;
      this.coinsCollected = 0;

      const actorChars = {
        "@": Player,
        "o": Coin,
        "=": Lava,
        "|": Lava,
        "v": Lava,
        "!": Lava
      };

      for (let y = 0; y < this.height; y++) {
        const line = plan[y];
        const gridLine = [];
        
        for (let x = 0; x < this.width; x++) {
          const ch = line[x];
          const ActorClass = actorChars[ch];
          let fieldType = null;

          if (ActorClass) {
            const actor = new ActorClass(new Vector(x, y), ch);
            this.actors.push(actor);
            if (actor.type === "coin") this.coins++;
          } else if (ch === "x") {
            fieldType = "wall";
          } else if (ch === "!" || ch === "|" || ch === "=" || ch === "v") {
            fieldType = "lava";
          }
          
          gridLine.push(fieldType);
        }
        this.grid.push(gridLine);
      }

      this.player = this.actors.find(actor => actor.type === "player");
      this.status = null;
      this.coinsTotal = this.coins;
      this.coinsCollected = 0;
    }

    obstacleAt(pos, size) {
      const xStart = Math.floor(pos.x);
      const xEnd = Math.ceil(pos.x + size.x);
      const yStart = Math.floor(pos.y);
      const yEnd = Math.ceil(pos.y + size.y);

      if (xStart < 0 || xEnd > this.width || yStart < 0) return "wall";
      if (yEnd > this.height) return "lava";

      for (let y = yStart; y < yEnd; y++) {
        for (let x = xStart; x < xEnd; x++) {
          const fieldType = this.grid[y][x];
          if (fieldType) return fieldType;
        }
      }
      
      return null;
    }

    actorAt(actor) {
      for (const other of this.actors) {
        if (other !== actor && other.type !== "lava" &&
            actor.pos.x + actor.size.x > other.pos.x &&
            actor.pos.x < other.pos.x + other.size.x &&
            actor.pos.y + actor.size.y > other.pos.y &&
            actor.pos.y < other.pos.y + other.size.y) {
          return other;
        }
      }
      return null;
    }

    checkCollisions() {
      if (!this.player || !this.player.alive) return;

      // Проверка столкновения с лавой (через сетку)
      const playerGridX = Math.floor(this.player.pos.x);
      const playerGridY = Math.floor(this.player.pos.y);
      const playerEndX = Math.ceil(this.player.pos.x + this.player.size.x);
      const playerEndY = Math.ceil(this.player.pos.y + this.player.size.y);

      for (let y = playerGridY; y < playerEndY; y++) {
        if (y < 0 || y >= this.height) continue;
        
        for (let x = playerGridX; x < playerEndX; x++) {
          if (x < 0 || x >= this.width) continue;
          
          if (this.grid[y][x] === "lava") {
            this.player.alive = false;
            this.status = "lost";
            deathAnimationRef.current = { active: true, time: 0, scale: 1 };
            return;
          }
        }
      }

      // Проверка столкновения с лавой (актеры)
      for (const actor of this.actors) {
        if (actor.type === "lava" &&
            this.player.pos.x + this.player.size.x > actor.pos.x &&
            this.player.pos.x < actor.pos.x + actor.size.x &&
            this.player.pos.y + this.player.size.y > actor.pos.y &&
            this.player.pos.y < actor.pos.y + actor.size.y) {
          this.player.alive = false;
          this.status = "lost";
          deathAnimationRef.current = { active: true, time: 0, scale: 1 };
          return;
        }
      }

      // Проверка столкновения с монетками
      for (const actor of this.actors) {
        if (actor.type === "coin" && !actor.collected &&
            this.player.pos.x + this.player.size.x > actor.pos.x &&
            this.player.pos.x < actor.pos.x + actor.size.x &&
            this.player.pos.y + this.player.size.y > actor.pos.y &&
            this.player.pos.y < actor.pos.y + actor.size.y) {
          actor.collected = true;
          this.coinsCollected++;
          setScore(prev => prev + 100);
          setCoinsCollected(this.coinsCollected);
          
          // Проверка победы
          if (this.coinsCollected >= this.coinsTotal) {
            this.status = "won";
          }
          break;
        }
      }
    }

    animate(step, keys) {
      const maxStep = 0.05;
      
      while (step > 0) {
        const thisStep = Math.min(step, maxStep);
        
        // Обновляем актеров
        this.actors.forEach(actor => {
          if (actor.type === "player") {
            actor.act(thisStep, this, keys);
          } else if (actor.type === "lava") {
            actor.act(thisStep, this);
          } else if (actor.type === "coin" && !actor.collected) {
            actor.act(thisStep);
          }
        });

        // Проверяем столкновения
        this.checkCollisions();

        // Обновляем анимацию смерти
        if (deathAnimationRef.current.active) {
          deathAnimationRef.current.time += thisStep;
          deathAnimationRef.current.scale = Math.max(0, 1 - deathAnimationRef.current.time * 2);
          if (deathAnimationRef.current.time > 0.5) {
            deathAnimationRef.current.active = false;
          }
        }

        step -= thisStep;
      }
    }

    isFinished() {
      return this.status === "won" || this.status === "lost";
    }
  }

  // Инициализация игры
  const initGame = useCallback(() => {
    if (!canvasRef.current) return;

    const currentLevel = new Level(LEVELS[level]);
    setTotalCoins(currentLevel.coinsTotal);
    setCoinsCollected(0);
    gameStateRef.current = {
      level: currentLevel,
      lastTime: null,
      gameRunning: true,
      cameraX: 0,
      cameraY: 0
    };

    deathAnimationRef.current = { active: false, time: 0, scale: 1 };
    setGameStatus('playing');
    setGameActive(true);
  }, [level]);

  // Обновление камеры
  const updateCamera = useCallback((playerPos, canvasWidth, canvasHeight, levelWidth, levelHeight) => {
    if (!gameStateRef.current || !playerPos) return;
    
    const scale = 12;
    const viewportWidth = canvasWidth / scale;
    const viewportHeight = canvasHeight / scale;
    
    // Центрируем камеру на игроке
    gameStateRef.current.cameraX = Math.max(0, Math.min(
      playerPos.x - viewportWidth / 2,
      levelWidth - viewportWidth
    ));
    
    gameStateRef.current.cameraY = Math.max(0, Math.min(
      playerPos.y - viewportHeight / 2,
      levelHeight - viewportHeight
    ));
  }, []);

  // Игровой цикл
  const gameLoop = useCallback((timestamp) => {
    if (!gameActive || !gameStateRef.current) {
      return;
    }

    const state = gameStateRef.current;
    if (state.lastTime === null) {
      state.lastTime = timestamp;
    }

    const timeStep = Math.min(timestamp - state.lastTime, 100) / 1000;
    state.lastTime = timestamp;

    if (state.level && state.gameRunning) {
      state.level.animate(timeStep, keysRef.current);

      // Обновляем камеру
      if (state.level.player && state.level.player.alive) {
        updateCamera(
          state.level.player.pos,
          canvasRef.current.width,
          canvasRef.current.height,
          state.level.width,
          state.level.height
        );
      }

      if (state.level.isFinished()) {
        if (state.level.status === "won") {
          setGameStatus('won');
          if (level < LEVELS.length - 1) {
            setTimeout(() => {
              setLevel(prev => prev + 1);
              setGameStatus('ready');
              setGameActive(false);
            }, 1500);
          }
        } else if (state.level.status === "lost") {
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameStatus('lost');
              state.gameRunning = false;
              return 0;
            }
            
            // Перезапускаем уровень
            setTimeout(() => {
              setGameStatus('ready');
              setGameActive(false);
            }, 1000);
            
            return newLives;
          });
        }
        state.gameRunning = false;
      }

      drawGame(state.level, state.cameraX, state.cameraY);
    }

    if (gameActive) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameActive, level, updateCamera]);

  // Отрисовка игры
  const drawGame = useCallback((gameLevel, cameraX, cameraY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const scale = 12;
    
    // Очистка
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Рассчитываем видимую область
    const viewStartX = Math.floor(cameraX);
    const viewEndX = Math.ceil(cameraX + canvas.width / scale);
    const viewStartY = Math.floor(cameraY);
    const viewEndY = Math.ceil(cameraY + canvas.height / scale);

    // Рисуем сетку в видимой области
    for (let y = viewStartY; y < viewEndY; y++) {
      if (y < 0 || y >= gameLevel.height) continue;
      
      for (let x = viewStartX; x < viewEndX; x++) {
        if (x < 0 || x >= gameLevel.width) continue;
        
        const cell = gameLevel.grid[y][x];
        const screenX = (x - cameraX) * scale;
        const screenY = (y - cameraY) * scale;
        
        if (cell === "wall") {
          ctx.fillStyle = '#444';
          ctx.fillRect(screenX, screenY, scale, scale);
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 2;
          ctx.strokeRect(screenX, screenY, scale, scale);
        } else if (cell === "lava") {
          // Анимация лавы
          const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
          ctx.fillStyle = `rgb(${Math.floor(229 * pulse)}, ${Math.floor(85 * pulse)}, ${Math.floor(85 * pulse)})`;
          ctx.fillRect(screenX, screenY, scale, scale);
          
          // Рисуем узор на лаве
          if (Date.now() % 500 < 250) {
            ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
            ctx.fillRect(screenX + 2, screenY + 2, scale - 4, scale - 4);
          }
        }
      }
    }

    // Рисуем актеров в видимой области
    gameLevel.actors.forEach(actor => {
      if (actor.type === "coin" && actor.collected) return;
      
      const screenX = (actor.pos.x - cameraX) * scale;
      const screenY = (actor.pos.y - cameraY) * scale;
      
      // Проверяем, виден ли актер
      if (screenX + actor.size.x * scale < 0 || screenX > canvas.width ||
          screenY + actor.size.y * scale < 0 || screenY > canvas.height) {
        return;
      }

      if (actor.type === "player") {
        if (!actor.alive) {
          // Анимация смерти
          const deathScale = deathAnimationRef.current.scale;
          ctx.save();
          ctx.translate(screenX + actor.size.x * scale / 2, screenY + actor.size.y * scale / 2);
          ctx.scale(deathScale, deathScale);
          ctx.fillStyle = '#a04040';
          ctx.fillRect(
            -actor.size.x * scale / 2,
            -actor.size.y * scale / 2,
            actor.size.x * scale,
            actor.size.y * scale
          );
          
          // Рисуем крестик при смерти
          ctx.strokeStyle = '#800000';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-actor.size.x * scale / 3, -actor.size.y * scale / 3);
          ctx.lineTo(actor.size.x * scale / 3, actor.size.y * scale / 3);
          ctx.moveTo(actor.size.x * scale / 3, -actor.size.y * scale / 3);
          ctx.lineTo(-actor.size.x * scale / 3, actor.size.y * scale / 3);
          ctx.stroke();
          
          ctx.restore();
        } else {
          ctx.fillStyle = gameLevel.status === "won" ? '#4CAF50' : '#335699';
          ctx.fillRect(screenX, screenY, actor.size.x * scale, actor.size.y * scale);
          
          // Рисуем глаза
          ctx.fillStyle = 'white';
          const eyeSize = scale * 0.2;
          const eyeOffset = actor.speed.x > 0 ? scale * 0.3 : scale * 0.1;
          ctx.fillRect(screenX + eyeOffset, screenY + scale * 0.2, eyeSize, eyeSize);
          ctx.fillRect(screenX + eyeOffset + scale * 0.2, screenY + scale * 0.2, eyeSize, eyeSize);
          
          // Рисуем улыбку
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(
            screenX + actor.size.x * scale / 2,
            screenY + scale * 0.6,
            scale * 0.2,
            0.2,
            Math.PI - 0.2
          );
          ctx.stroke();
        }
      } else if (actor.type === "coin" && !actor.collected) {
        // Анимация монетки
        const wobble = Math.sin(actor.wobble) * 0.1;
        ctx.fillStyle = '#e2e838';
        ctx.beginPath();
        ctx.arc(
          screenX + actor.size.x * scale / 2,
          screenY + actor.size.y * scale / 2 + wobble * scale,
          actor.size.x * scale / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        // Блеск монетки
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(
          screenX + actor.size.x * scale / 2 - scale * 0.15,
          screenY + actor.size.y * scale / 2 - scale * 0.15 + wobble * scale,
          scale * 0.1,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        // Блестящие лучи
        ctx.strokeStyle = 'rgba(255, 255, 200, 0.6)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
          const angle = actor.wobble + i * Math.PI / 2;
          const length = scale * 0.4;
          ctx.beginPath();
          ctx.moveTo(
            screenX + actor.size.x * scale / 2,
            screenY + actor.size.y * scale / 2 + wobble * scale
          );
          ctx.lineTo(
            screenX + actor.size.x * scale / 2 + Math.cos(angle) * length,
            screenY + actor.size.y * scale / 2 + wobble * scale + Math.sin(angle) * length
          );
          ctx.stroke();
        }
      } else if (actor.type === "lava") {
        // Динамическая лава
        if (actor.char === "=" || actor.char === '|' || actor.char === 'v') {
          const pulse = Math.sin(Date.now() / 150) * 0.3 + 0.7;
          ctx.fillStyle = `rgb(${Math.floor(255 * pulse)}, ${Math.floor(100 * pulse)}, ${Math.floor(100 * pulse)})`;
        } else {
          // Статичная лава
          const pulse = Math.sin(Date.now() / 300) * 0.2 + 0.8;
          ctx.fillStyle = `rgb(${Math.floor(229 * pulse)}, ${Math.floor(85 * pulse)}, ${Math.floor(85 * pulse)})`;
        }
        ctx.fillRect(screenX, screenY, actor.size.x * scale, actor.size.y * scale);
        
        // Пузыри в лаве
        if (Math.random() < 0.02) {
          const bubbleX = screenX + Math.random() * actor.size.x * scale;
          const bubbleY = screenY + Math.random() * actor.size.y * scale;
          const bubbleSize = Math.random() * 3 + 1;
          
          ctx.fillStyle = 'rgba(255, 200, 200, 0.6)';
          ctx.beginPath();
          ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // Рисуем границы уровня
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-cameraX * scale, -cameraY * scale, gameLevel.width * scale, gameLevel.height * scale);
  }, []);

  // Управление клавишами
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Рестарт кнопкой R в любое время
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        resetGame();
        return;
      }
      
      if (!gameActive && e.key === 'Enter') {
        startGame();
        return;
      }
      
      if (!gameActive) return;
      
      switch(e.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
          keysRef.current.left = true;
          break;
        case 'arrowright':
        case 'd':
          keysRef.current.right = true;
          break;
        case 'arrowup':
        case 'w':
        case ' ':
          keysRef.current.up = true;
          break;
      }
    };

    const handleKeyUp = (e) => {
      if (!gameActive) return;
      
      switch(e.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
          keysRef.current.left = false;
          break;
        case 'arrowright':
        case 'd':
          keysRef.current.right = false;
          break;
        case 'arrowup':
        case 'w':
        case ' ':
          keysRef.current.up = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameActive]);

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

  // Сброс игры
  const resetGame = useCallback(() => {
    setScore(0);
    setLevel(0);
    setLives(3);
    setCoinsCollected(0);
    setGameStatus('ready');
    setGameActive(false);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    deathAnimationRef.current = { active: false, time: 0, scale: 1 };
    
    // Инициализируем заново через небольшой таймаут
    setTimeout(() => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }, 100);
  }, []);

  // Старт игры
  const startGame = () => {
    if (gameStatus === 'lost') {
      resetGame();
    }
    initGame();
  };

  // Обновление счета
  useEffect(() => {
    if (score > 0) {
      const event = new CustomEvent('gameScoreUpdate', {
        detail: { game: 'platformer', score }
      });
      window.dispatchEvent(event);
    }
  }, [score]);

  return (
    <div className="platformer-game">
      <div className="game-header">
        <h2>🎮 Платформер</h2>
        <div className="game-controls">
          {!gameActive ? (
            <button className="control-btn start-btn" onClick={startGame}>
              {gameStatus === 'ready' ? '▶️ Начать игру' : 
               gameStatus === 'won' ? '🎉 Следующий уровень' : 
               '🔄 Играть снова'}
            </button>
          ) : (
            <button className="control-btn pause-btn" onClick={() => setGameActive(false)}>
              ⏸️ Пауза
            </button>
          )}
          <button className="control-btn reset-btn" onClick={resetGame}>
            🔄 Сброс (R)
          </button>
        </div>
      </div>

      <div className="game-stats">
        <div className="stat-box">
          <div className="stat-label">Счет</div>
          <div className="stat-value">{score}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Уровень</div>
          <div className="stat-value">{level + 1} / {LEVELS.length}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Жизни</div>
          <div className="stat-value">
            <span style={{ color: lives <= 1 ? '#ff5e62' : '#667eea' }}>
              {'❤️'.repeat(Math.max(0, lives))}
            </span>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Монеты</div>
          <div className="stat-value">
            {coinsCollected} / {totalCoins} 🟡
          </div>
        </div>
      </div>

      <div className="game-area">
        <div className="platformer-container" ref={gameContainerRef}>
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="platformer-canvas"
          />
          
          {!gameActive && gameStatus === 'ready' && (
            <div className="start-screen">
              <div className="start-message">
                <h3>Платформер</h3>
                <p>Собирайте монеты 🟡, избегайте лавы 🔴</p>
                <p>Управление: ← → (или A, D) и ПРОБЕЛ для прыжка</p>
                <p>Нажмите ENTER для старта, R для перезапуска</p>
                <button className="start-btn-big" onClick={startGame}>
                  НАЧАТЬ ИГРУ
                </button>
              </div>
            </div>
          )}

          {gameStatus === 'won' && (
            <div className="win-screen">
              <div className="win-message">
                <h3>🎉 УРОВЕНЬ ПРОЙДЕН!</h3>
                <p>Набрано очков: {score}</p>
                <p>Собрано монет: {coinsCollected}/{totalCoins}</p>
                {level < LEVELS.length - 1 ? (
                  <button className="next-level-btn" onClick={startGame}>
                    Следующий уровень →
                  </button>
                ) : (
                  <button className="restart-btn" onClick={resetGame}>
                    🏆 Поздравляем! Начать заново
                  </button>
                )}
              </div>
            </div>
          )}

          {gameStatus === 'lost' && (
            <div className="lose-screen">
              <div className="lose-message">
                <h3>💀 ИГРА ОКОНЧЕНА</h3>
                <p>Финальный счет: {score}</p>
                <p>Собрано монет: {coinsCollected}/{totalCoins}</p>
                <button className="restart-btn" onClick={resetGame}>
                  Играть снова
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="game-instructions">
        <div className="instructions-row">
          <p><strong>Управление:</strong> ← → (A, D) - движение, ПРОБЕЛ - прыжок</p>
          <p><strong>Цель:</strong> Собрать все монеты, избегая лавы</p>
        </div>
        <div className="legend">
          <div className="legend-item">
            <div className="legend-color player-color"></div>
            <span>Игрок (синий)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color coin-color"></div>
            <span>Монета (+100 очков)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color lava-color"></div>
            <span>Лава (опасно)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color wall-color"></div>
            <span>Стена</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformerGame;