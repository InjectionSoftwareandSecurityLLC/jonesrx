// ── Jones RX Skater — Hidden Mini-Game ──

(function () {
    'use strict';

    const SPRITES = {
        bg: 'assets/sprites/bg_anim.gif',
        character: 'assets/sprites/skating_jones.gif',
        obstacle: 'assets/sprites/trashcan.png'
    };
    const MUSIC_SRC = 'assets/sound/bg_music.mp3';

    // Tuning
    const BASE_SPEED = 4;          // px per frame
    const SPEED_INCREMENT = 0.3;   // added per point
    const MAX_SPEED = 16;
    const MIN_SPAWN_INTERVAL = 600;  // ms
    const BASE_SPAWN_INTERVAL = 1800; // ms
    const JUMP_DURATION = 500;     // ms — matches CSS animation

    // State
    let score = 0;
    let highScore = parseInt(localStorage.getItem('jonesrx_highscore') || '0', 10);
    let speed = BASE_SPEED;
    let running = false;
    let waiting = false;  // start or game-over screen showing
    let jumpLocked = false;
    let animFrameId = null;
    let spawnTimer = null;
    let obstacles = [];
    let music = null;

    // DOM refs (set on first open)
    let overlay, backdrop, gameArea, character, scoreVal, highVal;
    let startScreen, overScreen, overScoreEl, overHighEl;

    // ── Build the DOM once ──
    function buildDOM() {
        if (document.getElementById('gameOverlay')) return;

        backdrop = document.createElement('div');
        backdrop.id = 'gameBackdrop';
        document.body.appendChild(backdrop);
        backdrop.addEventListener('click', function (e) {
            if (e.target === backdrop) exitGame();
        });

        overlay = document.createElement('div');
        overlay.id = 'gameOverlay';
        overlay.innerHTML = `
            <div class="game-hud">
                <div class="game-score-box">
                    <p class="game-score-label">Score</p>
                    <p class="game-score-value" id="gameScoreVal">0</p>
                </div>
                <button class="game-exit-btn" id="gameExitBtn">ESC</button>
                <div class="game-high-box">
                    <p class="game-high-label">Best</p>
                    <p class="game-high-value" id="gameHighVal">${highScore}</p>
                </div>
            </div>
            <div class="game-area" id="gameArea">
                <div class="game-ground"></div>
                <div class="game-character" id="gameChar"><img src="${SPRITES.character}" alt="Jones"></div>
                <div class="game-tap-zone" id="gameTapZone"></div>
                <div class="game-start-screen" id="gameStartScreen">
                    <div class="game-start-title">Jones RX<br>Skater</div>
                    <div class="game-start-prompt">Tap or Press Space to Start</div>
                </div>
                <div class="game-over-screen" id="gameOverScreen" style="display:none;">
                    <div class="game-over-title">WIPEOUT</div>
                    <div class="game-over-score" id="gameOverScore">Score: 0</div>
                    <div class="game-over-high" id="gameOverHigh">Best: 0</div>
                    <div class="game-over-prompt">Tap or Press Space to Retry</div>
                </div>
            </div>
        `;

        // Nest overlay inside backdrop for centering
        backdrop.appendChild(overlay);

        gameArea = document.getElementById('gameArea');
        character = document.getElementById('gameChar');
        scoreVal = document.getElementById('gameScoreVal');
        highVal = document.getElementById('gameHighVal');
        startScreen = document.getElementById('gameStartScreen');
        overScreen = document.getElementById('gameOverScreen');
        overScoreEl = document.getElementById('gameOverScore');
        overHighEl = document.getElementById('gameOverHigh');

        document.getElementById('gameExitBtn').addEventListener('click', function (e) {
            e.stopPropagation();
            exitGame();
        });

        var tapZone = document.getElementById('gameTapZone');
        tapZone.addEventListener('click', handleInput);
        tapZone.addEventListener('touchend', function (e) {
            e.preventDefault();
            handleInput();
        }, { passive: false });

        // Start & game-over screens sit above the tap zone, so they need their own handlers
        startScreen.addEventListener('click', handleInput);
        startScreen.addEventListener('touchend', function (e) {
            e.preventDefault();
            handleInput();
        }, { passive: false });

        overScreen.addEventListener('click', handleInput);
        overScreen.addEventListener('touchend', function (e) {
            e.preventDefault();
            handleInput();
        }, { passive: false });

        // Prevent scroll on touch
        overlay.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });
    }

    // ── Open / Close ──
    window.startGame = function () {
        buildDOM();
        backdrop.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        score = 0;
        updateScore(0);
        highVal.textContent = highScore;
        waiting = true;
        startScreen.style.display = 'flex';
        overScreen.style.display = 'none';
        clearObstacles();
        document.addEventListener('keydown', onKey);
    };

    function exitGame() {
        running = false;
        waiting = false;
        overlay.classList.remove('active');
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
        cancelAnimationFrame(animFrameId);
        clearTimeout(spawnTimer);
        clearObstacles();
        stopMusic();
        document.removeEventListener('keydown', onKey);
    }

    // ── Input ──
    function onKey(e) {
        if (e.key === 'Escape') { exitGame(); return; }
        if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            handleInput();
        }
    }

    function handleInput() {
        if (waiting) {
            beginRound();
            return;
        }
        if (running) jump();
    }

    // ── Round lifecycle ──
    function beginRound() {
        waiting = false;
        running = true;
        score = 0;
        speed = BASE_SPEED;
        updateScore(0);
        startScreen.style.display = 'none';
        overScreen.style.display = 'none';
        clearObstacles();
        playMusic();
        scheduleSpawn();
        animFrameId = requestAnimationFrame(gameLoop);
    }

    function gameOver() {
        running = false;
        cancelAnimationFrame(animFrameId);
        clearTimeout(spawnTimer);

        if (score > highScore) {
            highScore = score;
            localStorage.setItem('jonesrx_highscore', String(highScore));
            highVal.textContent = highScore;
        }

        overScoreEl.textContent = `Score: ${score}`;
        overHighEl.textContent = `Best: ${highScore}`;
        overScreen.style.display = 'flex';
        waiting = true;
        stopMusic();
    }

    // ── Jump ──
    function jump() {
        if (jumpLocked) return;
        jumpLocked = true;
        character.classList.add('jumping');
        setTimeout(() => {
            character.classList.remove('jumping');
            jumpLocked = false;
        }, JUMP_DURATION);
    }

    // ── Obstacles ──
    function spawnObstacle() {
        const el = document.createElement('div');
        el.className = 'game-obstacle';
        el.innerHTML = `<img src="${SPRITES.obstacle}" alt="Trashcan">`;
        el.style.right = '-60px';
        el.dataset.scored = '0';
        gameArea.appendChild(el);
        obstacles.push(el);
    }

    function clearObstacles() {
        obstacles.forEach(o => o.remove());
        obstacles = [];
    }

    function scheduleSpawn() {
        if (!running) return;
        spawnObstacle();
        const interval = Math.max(MIN_SPAWN_INTERVAL, BASE_SPAWN_INTERVAL - score * 40);
        // Add randomness: ±30%
        const jitter = interval * (0.7 + Math.random() * 0.6);
        spawnTimer = setTimeout(scheduleSpawn, jitter);
    }

    // ── Collision ──
    function getRect(el) {
        return el.getBoundingClientRect();
    }

    function checkCollision() {
        const charRect = getRect(character);
        // Shrink hitbox for fairness
        const cx = charRect.left + charRect.width * 0.25;
        const cy = charRect.top + charRect.height * 0.15;
        const cw = charRect.width * 0.5;
        const ch = charRect.height * 0.7;

        for (const obs of obstacles) {
            const or = getRect(obs);
            const ox = or.left + or.width * 0.15;
            const oy = or.top + or.height * 0.1;
            const ow = or.width * 0.7;
            const oh = or.height * 0.8;

            if (cx < ox + ow && cx + cw > ox && cy < oy + oh && cy + ch > oy) {
                return true;
            }
        }
        return false;
    }

    // ── Game Loop ──
    function gameLoop() {
        if (!running) return;

        const areaWidth = gameArea.offsetWidth;

        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obs = obstacles[i];
            const currentRight = parseFloat(obs.style.right) || 0;
            const newRight = currentRight + speed;
            obs.style.right = newRight + 'px';

            // The obstacle's left edge in the game area
            const obsLeftEdge = areaWidth - newRight - obs.offsetWidth;

            // Score: obstacle's right edge has passed the character's left edge
            if (obs.dataset.scored === '0' && (obsLeftEdge + obs.offsetWidth) < character.offsetLeft) {
                obs.dataset.scored = '1';
                score++;
                updateScore(score);
                speed = Math.min(MAX_SPEED, BASE_SPEED + score * SPEED_INCREMENT);
            }

            // Remove off-screen
            if (newRight > areaWidth + 100) {
                obs.remove();
                obstacles.splice(i, 1);
            }
        }

        if (checkCollision()) {
            gameOver();
            return;
        }

        animFrameId = requestAnimationFrame(gameLoop);
    }

    // ── Score UI ──
    function updateScore(val) {
        scoreVal.textContent = val;
        scoreVal.classList.remove('pop');
        if (val > 0) {
            // Trigger reflow for re-animation
            void scoreVal.offsetWidth;
            scoreVal.classList.add('pop');
        }
    }

    // ── Music ──
    function playMusic() {
        if (!music) {
            music = new Audio(MUSIC_SRC);
            music.loop = true;
            music.volume = 0.5;
        }
        music.currentTime = 0;
        music.play().catch(() => {});
    }

    function stopMusic() {
        if (music) {
            music.pause();
            music.currentTime = 0;
        }
    }
})();
