/* ============================================================
   ALTER_OS core — Jones RX
   Window manager · dock · altar · theme/archangels · mobile
   ============================================================ */
(function () {
    'use strict';

    /* ---- config ---- */
    const ALTAR_CONFIG = {
        startOpen: false,   // altar open on load?
        forceClosed: false  // if true, altar cannot be opened (locked shut)
    };

    const ANGELS = {
        raphael: { theme: 'raphael', label: 'Raphael', color: '#ffd400' },
        michael: { theme: 'michael', label: 'Michael', color: '#ff2d2d' },
        gabriel: { theme: 'gabriel', label: 'Gabriel', color: '#2d7bff' },
        uriel:   { theme: 'uriel',   label: 'Uriel',   color: '#1fd882' }
    };

    const APPS = [
        { id: 'tracks',   name: 'Tracks',   icon: 'fa-compact-disc' },
        { id: 'about',    name: 'About',    icon: 'fa-user-astronaut' },
        { id: 'gallery',  name: 'Gallery',  icon: 'fa-images' },
        { id: 'events',   name: 'Events',   icon: 'fa-calendar-alt' },
        { id: 'videos',   name: 'Videos',   icon: 'fa-play-circle' },
        { id: 'social',   name: 'Social',   icon: 'fa-share-alt' },
        { id: 'terminal', name: 'Terminal', icon: 'fa-terminal' },
        { id: 'files',    name: 'Files',    icon: 'fa-folder-open' },
        { id: 'notepad',  name: 'Notepad',  icon: 'fa-file-alt' },
        { id: 'temples',  name: 'Temples',  icon: 'fa-crosshairs' },
        { id: 'exploit',  name: 'Exploit',  icon: 'fa-bug' },
        { id: 'sessions', name: 'Sessions', icon: 'fa-network-wired' },
        { id: 'settings', name: 'Settings', icon: 'fa-sliders-h' },
        { id: 'merch',    name: 'Merch',    icon: 'fa-tshirt' }
    ];
    const PHONE_DOCK = ['tracks', 'videos', 'terminal', 'social'];

    // Raphael unlocks 1, Michael 2, Gabriel 3, Uriel 3 (9 total)
    const DEMOS = [
        { name: 'ALTER — Demo 1', file: 'assets/tracks/demo-01.dat', angel: 'raphael' },
        { name: 'ALTER — Demo 2', file: 'assets/tracks/demo-02.dat', angel: 'michael' },
        { name: 'ALTER — Demo 3', file: 'assets/tracks/demo-03.dat', angel: 'michael' },
        { name: 'ALTER — Demo 4', file: 'assets/tracks/demo-04.dat', angel: 'gabriel' },
        { name: 'ALTER — Demo 5', file: 'assets/tracks/demo-05.dat', angel: 'gabriel' },
        { name: 'ALTER — Demo 6', file: 'assets/tracks/demo-06.dat', angel: 'gabriel' },
        { name: 'ALTER — Demo 7', file: 'assets/tracks/demo-07.dat', angel: 'uriel' },
        { name: 'ALTER — Demo 8', file: 'assets/tracks/demo-08.dat', angel: 'uriel' },
        { name: 'ALTER — Demo 9', file: 'assets/tracks/demo-09.dat', angel: 'uriel' }
    ];

    const LS = { unlocked: 'alter_unlocked', theme: 'alter_theme' };

    // set a URL here to make the cube's "nemo" a clickable portal while the white theme is active
    const NEMO_PORTAL = 'https://on.soundcloud.com/XLSQVcOR2MY7O37FdG';

    /* ---- state ---- */
    let topZ = 1000;
    const unlocked = new Set(loadUnlocked());

    /* ---- helpers ---- */
    const $  = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    function loadUnlocked() {
        try { return JSON.parse(localStorage.getItem(LS.unlocked) || '[]'); } catch (e) { return []; }
    }
    function saveUnlocked() {
        try { localStorage.setItem(LS.unlocked, JSON.stringify([...unlocked])); } catch (e) {}
    }

    /* ============================================================
       COMPAT STUBS (keep legacy events.js / videos.js working)
       ============================================================ */
    window.styleDropdown = window.styleDropdown || function (id, color) {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.borderColor = color; el.style.color = color;
        el.style.boxShadow = `0 0 10px ${color}`;
    };
    window.setupTvTransition = window.setupTvTransition || function () { /* no-op in OS mode */ };

    /* ============================================================
       BOOT
       ============================================================ */
    function runBoot() {
        const boot = $('#boot'), log = $('#bootLog');
        if (!boot || !log) return;
        const order = Object.keys(ANGELS);
        const openCount = order.filter(a => unlocked.has(a)).length;
        let templeLines;
        if (openCount === 0) {
            templeLines = ['[ ok ] 4 temples detected :: status SEALED'];
        } else if (openCount === order.length) {
            templeLines = ['[ ok ] 4 temples detected :: status OPENED'];
        } else {
            templeLines = ['[ ok ] 4 temples detected'];
            order.forEach(a => {
                templeLines.push('        ' + (a + '        ').slice(0, 9) + ':: ' + (unlocked.has(a) ? 'OPENED' : 'SEALED'));
            });
        }
        const lines = [
            'ALTER_OS v1.0  (tty1)',
            '[ ok ] mounting /dev/altar ...',
            '[ ok ] loading ceremonial drivers ...',
            '[ ok ] esoteric subsystem online',
            ...templeLines,
            '[ ok ] binding jones@alter ...',
            '',
            'altering states of consciousness ...',
            'welcome.'
        ];
        let i = 0;
        const tick = () => {
            if (i < lines.length) {
                log.textContent += lines[i++] + '\n';
                setTimeout(tick, 150 + Math.random() * 120);
            } else {
                setTimeout(() => boot.classList.add('gone'), 600);
            }
        };
        tick();
        boot.addEventListener('click', () => boot.classList.add('gone'));
    }

    /* ============================================================
       CLOCK
       ============================================================ */
    function tickClock() {
        const t = new Date();
        const s = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const c = $('#panelClock'), pc = $('#phoneClock');
        if (c) c.textContent = s;
        // phone clock: iOS style, no leading zero / AM-PM
        if (pc) pc.textContent = t.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, '');
    }

    // mobile: close the front-most open app (home indicator)
    function goHome() {
        const open = $$('.win.open');
        if (!open.length) return;
        let top = open[0];
        open.forEach(w => { if ((+w.style.zIndex || 0) >= (+top.style.zIndex || 0)) top = w; });
        closeApp(top.dataset.app);
    }

    /* ============================================================
       WINDOW MANAGER
       ============================================================ */
    function winEl(id) { return document.getElementById('win-' + id); }

    function focusWin(win) {
        win.style.zIndex = ++topZ;
        $$('.win').forEach(w => w.classList.remove('focused'));
        win.classList.add('focused');
    }

    let openCount = 0;
    function openApp(id) {
        const app = APPS.find(a => a.id === id);
        if (app && app.url) { window.open(app.url, '_blank', 'noopener'); return; }
        const win = winEl(id);
        if (!win) return;
        if (!win.classList.contains('open')) {
            // cascade initial position (desktop only)
            if (!document.body.classList.contains('is-mobile') && !win.dataset.placed) {
                const ox = 70 + (openCount % 5) * 34;
                const oy = 60 + (openCount % 5) * 30;
                win.style.left = ox + 'px';
                win.style.top = oy + 'px';
                win.dataset.placed = '1';
                openCount++;
            }
            win.classList.add('open');
        }
        focusWin(win);
        setDockActive();
        if (id === 'terminal') { const inp = $('#termInput'); if (inp) setTimeout(() => inp.focus(), 60); }
        if (id === 'notepad') npRenderList();
        if (id === 'merch') mrRefresh(false);
        if ((id === 'exploit' || id === 'sessions') && window.ALTERGAME) window.ALTERGAME.render();
        if (id === 'settings') refreshSettings();
        if (id === 'files') {
            // open at home, and follow elevation when it changes under us
            const fs = fbFS(), elev = !!(fs && fs.elevated());
            if (elev !== FB.elev || !$('#win-files').dataset.visited) {
                FB.elev = elev;
                FB.path = fbHome();
                $('#win-files').dataset.visited = '1';
            }
            fbRender();
        }
    }
    function closeApp(id) {
        const win = winEl(id);
        if (win) win.classList.remove('open', 'max');
        setDockActive();
    }
    function toggleMax(id) {
        const win = winEl(id);
        if (win) { win.classList.toggle('max'); focusWin(win); }
    }

    function initWindows() {
        $$('.win').forEach(win => {
            const id = win.dataset.app;
            const bar = $('.win-bar', win);

            win.addEventListener('mousedown', () => focusWin(win), true);

            $('[data-win-close]', win)?.addEventListener('click', e => { e.stopPropagation(); closeApp(id); });
            $('[data-win-min]', win)?.addEventListener('click', e => { e.stopPropagation(); closeApp(id); });
            $('[data-win-max]', win)?.addEventListener('click', e => { e.stopPropagation(); toggleMax(id); });

            makeDraggable(win, bar);
            makeResizable(win);
        });
    }

    // 8-way resize grips; sizes are written inline so they survive re-renders
    function makeResizable(win) {
        const MIN_W = 300, MIN_H = 180;
        let dir = null, sx, sy, sw, sh, sl, st;
        const start = (e) => {
            if (document.body.classList.contains('is-mobile')) return;
            if (win.classList.contains('max')) return;
            dir = e.currentTarget.dataset.dir;
            const p = point(e);
            const r = win.getBoundingClientRect();
            sx = p.x; sy = p.y; sw = r.width; sh = r.height; sl = r.left; st = r.top;
            win.dataset.resized = '1';
            focusWin(win);
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', end);
            document.addEventListener('touchmove', move, { passive: false });
            document.addEventListener('touchend', end);
            e.preventDefault(); e.stopPropagation();
        };
        const move = (e) => {
            if (!dir) return;
            const p = point(e);
            const dx = p.x - sx, dy = p.y - sy;
            let w = sw, h = sh, l = sl, t = st;
            if (dir.includes('e')) w = sw + dx;
            if (dir.includes('s')) h = sh + dy;
            if (dir.includes('w')) { w = sw - dx; l = sl + dx; }
            if (dir.includes('n')) { h = sh - dy; t = st + dy; }
            if (w < MIN_W) { if (dir.includes('w')) l = sl + (sw - MIN_W); w = MIN_W; }
            if (h < MIN_H) { if (dir.includes('n')) t = st + (sh - MIN_H); h = MIN_H; }
            if (t < 36) { h += t - 36; t = 36; }     // keep the title bar under the panel
            if (l < 0) { w += l; l = 0; }            // and never off the left edge
            win.style.width = w + 'px';
            win.style.height = h + 'px';
            win.style.left = l + 'px';
            win.style.top = t + 'px';
            if (e.cancelable) e.preventDefault();
        };
        const end = () => {
            dir = null;
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', end);
            document.removeEventListener('touchmove', move);
            document.removeEventListener('touchend', end);
        };
        ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].forEach(d => {
            const g = document.createElement('div');
            g.className = 'win-grip g-' + d;
            g.dataset.dir = d;
            g.addEventListener('mousedown', start);
            g.addEventListener('touchstart', start, { passive: false });
            win.appendChild(g);
        });
    }

    function makeDraggable(win, handle) {
        if (!handle) return;
        let sx, sy, ox, oy, dragging = false;
        const down = (e) => {
            if (document.body.classList.contains('is-mobile')) return;
            if (win.classList.contains('max')) return;
            if (e.target.closest('.win-dot')) return;
            dragging = true;
            const p = point(e);
            sx = p.x; sy = p.y;
            const r = win.getBoundingClientRect();
            ox = r.left; oy = r.top;
            focusWin(win);
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
            document.addEventListener('touchmove', move, { passive: false });
            document.addEventListener('touchend', up);
            e.preventDefault();
        };
        const move = (e) => {
            if (!dragging) return;
            const p = point(e);
            let nx = ox + (p.x - sx);
            let ny = oy + (p.y - sy);
            nx = Math.max(0, Math.min(nx, window.innerWidth - 60));
            ny = Math.max(36, Math.min(ny, window.innerHeight - 40));
            win.style.left = nx + 'px';
            win.style.top = ny + 'px';
            if (e.cancelable) e.preventDefault();
        };
        const up = () => {
            dragging = false;
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up);
            document.removeEventListener('touchmove', move);
            document.removeEventListener('touchend', up);
        };
        handle.addEventListener('mousedown', down);
        handle.addEventListener('touchstart', down, { passive: false });
    }
    function point(e) {
        const t = e.touches && e.touches[0] ? e.touches[0] : e;
        return { x: t.clientX, y: t.clientY };
    }

    /* ============================================================
       DOCK + START MENU + PHONE HOME (built from APPS)
       ============================================================ */
    function buildLaunchers() {
        const dock = $('#dock');
        const menu = $('#startMenuList');
        const grid = $('#phoneGrid');
        const pdock = $('#phoneDock');

        APPS.forEach(app => {
            // dock
            if (dock) {
                const b = document.createElement('button');
                b.className = 'dock-item';
                b.dataset.app = app.id;
                b.innerHTML = `<i class="fas ${app.icon}"></i><span class="dock-tip">${app.name}</span>`;
                b.addEventListener('click', () => openApp(app.id));
                dock.appendChild(b);
            }
            // start menu
            if (menu) {
                const m = document.createElement('button');
                m.className = 'startmenu-item';
                m.innerHTML = `<i class="fas ${app.icon}"></i> ${app.name}`;
                m.addEventListener('click', () => { openApp(app.id); closeStart(); });
                menu.appendChild(m);
            }
            // phone grid
            if (grid) {
                const g = document.createElement('div');
                g.className = 'phone-app';
                g.innerHTML = `<div class="phone-app-icon"><i class="fas ${app.icon}"></i></div><div class="phone-app-label">${app.name}</div>`;
                g.addEventListener('click', () => openApp(app.id));
                grid.appendChild(g);
            }
        });

        // phone dock favorites
        if (pdock) {
            PHONE_DOCK.forEach(id => {
                const app = APPS.find(a => a.id === id);
                if (!app) return;
                const g = document.createElement('div');
                g.className = 'phone-app';
                g.innerHTML = `<div class="phone-app-icon"><i class="fas ${app.icon}"></i></div>`;
                g.addEventListener('click', () => openApp(app.id));
                pdock.appendChild(g);
            });
        }

        // dock drag handle
        if (dock) {
            const h = document.createElement('button');
            h.className = 'dock-handle';
            h.title = 'drag to move the dock';
            h.innerHTML = '<i class="fas fa-grip-vertical"></i>';
            dock.appendChild(h);
            makeDockDraggable(dock, h);
            restoreDock(dock);
        }
    }

    function setDockActive() {
        $$('.dock-item').forEach(d => {
            const w = winEl(d.dataset.app);
            d.classList.toggle('active', !!(w && w.classList.contains('open')));
        });
    }

    function makeDockDraggable(dock, handle) {
        let dragging = false, sx, sy, startLeft, startTop;
        const down = (e) => {
            dragging = true;
            const p = point(e);
            sx = p.x; sy = p.y;
            const r = dock.getBoundingClientRect();
            startLeft = r.left; startTop = r.top;
            dock.style.transform = 'none';
            dock.style.left = startLeft + 'px';
            dock.style.top = startTop + 'px';
            dock.style.bottom = 'auto';
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
            document.addEventListener('touchmove', move, { passive: false });
            document.addEventListener('touchend', up);
            e.preventDefault();
        };
        const move = (e) => {
            if (!dragging) return;
            const p = point(e);
            let nx = startLeft + (p.x - sx);
            let ny = startTop + (p.y - sy);
            nx = Math.max(4, Math.min(nx, window.innerWidth - dock.offsetWidth - 4));
            ny = Math.max(40, Math.min(ny, window.innerHeight - dock.offsetHeight - 4));
            dock.style.left = nx + 'px';
            dock.style.top = ny + 'px';
            // orient: snap vertical near left/right edges
            const nearLeft = nx < 80;
            const nearRight = nx > window.innerWidth - dock.offsetWidth - 80;
            dock.dataset.orient = (nearLeft || nearRight) ? 'vertical' : 'horizontal';
            if (e.cancelable) e.preventDefault();
        };
        const up = () => {
            dragging = false;
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up);
            document.removeEventListener('touchmove', move);
            document.removeEventListener('touchend', up);
            saveDock(dock);
        };
        handle.addEventListener('mousedown', down);
        handle.addEventListener('touchstart', down, { passive: false });
    }
    // sessionStorage, not localStorage: the dock stays put while this tab lives,
    // but every fresh session opens centered at the bottom again
    function saveDock(dock) {
        try {
            sessionStorage.setItem('alter_dock', JSON.stringify({
                left: dock.style.left, top: dock.style.top, orient: dock.dataset.orient
            }));
        } catch (e) {}
    }
    function restoreDock(dock) {
        try {
            const d = JSON.parse(sessionStorage.getItem('alter_dock') || 'null');
            if (d && d.left) {
                dock.style.transform = 'none';
                dock.style.left = d.left; dock.style.top = d.top; dock.style.bottom = 'auto';
                dock.dataset.orient = d.orient || 'horizontal';
            }
        } catch (e) {}
    }

    /* ---- start menu ---- */
    function openStart() { $('#startMenu')?.classList.add('open'); $('#panelMenu')?.setAttribute('aria-expanded', 'true'); }
    function closeStart() { $('#startMenu')?.classList.remove('open'); $('#panelMenu')?.setAttribute('aria-expanded', 'false'); }
    function initStart() {
        const btn = $('#panelMenu');
        btn?.addEventListener('click', (e) => {
            e.stopPropagation();
            $('#startMenu')?.classList.contains('open') ? closeStart() : openStart();
        });
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#startMenu') && !e.target.closest('#panelMenu')) closeStart();
        });
    }

    /* ============================================================
       ALTAR
       ============================================================ */
    function initAltar() {
        const altar = $('#altar');
        if (!altar) return;
        const nemo = $('#altarContent');
        let nemoTimer = null;
        // reveal nemo only after the lid-open animation settles (~1.3s); hide instantly on close
        function revealNemo() {
            if (nemoTimer) { clearTimeout(nemoTimer); nemoTimer = null; }
            if (!nemo) return;
            if (altar.dataset.open === 'true') {
                nemoTimer = setTimeout(() => { if (altar.dataset.open === 'true') nemo.style.opacity = '1'; }, 1600);
            } else {
                nemo.style.opacity = '0';
            }
        }
        if (ALTAR_CONFIG.startOpen && !ALTAR_CONFIG.forceClosed) altar.dataset.open = 'true';
        const toggle = () => {
            if (ALTAR_CONFIG.forceClosed) return;
            altar.dataset.open = altar.dataset.open === 'true' ? 'false' : 'true';
            revealNemo();
        };
        altar.addEventListener('click', toggle);
        altar.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        });
        revealNemo();
    }


    /* ============================================================
       THEME / ARCHANGELS
       ============================================================ */
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme || 'default');
        try { localStorage.setItem(LS.theme, theme || 'default'); } catch (e) {}
        updateNemo(theme || 'default');
    }
    function resetTheme() { setTheme('default'); }

    // nemo becomes a portal only under the white theme; href is injected from NEMO_PORTAL
    function updateNemo(theme) {
        const nemo = $('#altarContent');
        if (!nemo) return;
        const on = theme === 'white';
        nemo.classList.toggle('portal', on);
        nemo.onclick = (on && NEMO_PORTAL)
            ? (e) => { e.stopPropagation(); window.open(NEMO_PORTAL, '_blank', 'noopener'); }
            : null;
        nemo.title = (on && NEMO_PORTAL) ? 'enter' : '';
    }

    const allUnlocked = () => Object.keys(ANGELS).every(a => unlocked.has(a));

    function refreshSigils() {
        const all = allUnlocked();
        $$('.psig').forEach(s => {
            const a = s.dataset.angel;
            if (a === 'white') {
                s.classList.toggle('lit', all);
                s.title = all ? 'White — illuminate' : 'White — locked (invoke all four)';
                return;
            }
            s.classList.toggle('lit', unlocked.has(a));
            s.title = ANGELS[a] ? `${ANGELS[a].label} — ${unlocked.has(a) ? 'invoked' : 'locked'}` : '';
        });
        // phone lock sigils mirror (reset + 4 angels + the white bonus)
        const pls = $('#phoneLockSigils');
        if (pls && !pls.childElementCount) {
            const reset = document.createElement('span');
            reset.className = 'psig psig-reset'; reset.dataset.angel = 'reset'; reset.textContent = '\u238C';
            reset.title = 'Reset theme';
            pls.appendChild(reset);
            Object.keys(ANGELS).forEach(a => {
                const span = document.createElement('span');
                span.className = 'psig'; span.dataset.angel = a; span.textContent = '\u25CE';
                pls.appendChild(span);
            });
            const w = document.createElement('span');
            w.className = 'psig psig-white'; w.dataset.angel = 'white'; w.textContent = '\u2600';
            pls.appendChild(w);
        }
        if (pls) $$('.psig', pls).forEach(s => {
            const a = s.dataset.angel;
            s.classList.toggle('lit', a === 'reset' ? true : (a === 'white' ? all : unlocked.has(a)));
        });
        // hidden desktop sigils mirror the lit state
        $$('.dsig').forEach(s => s.classList.toggle('lit', unlocked.has(s.dataset.angel)));
    }

    // sigils: click a lit one to switch the machine's light (theme) — panel + phone lock
    function initPanelSigils() {
        $$('#panelSigils .psig, #phoneLockSigils .psig').forEach(s => s.addEventListener('click', () => {
            const a = s.dataset.angel;
            if (a === 'reset') { resetTheme(); return; }
            if (a === 'white') { if (allUnlocked()) setTheme('white'); return; }
            if (unlocked.has(a)) setTheme(ANGELS[a].theme);
        }));
    }

    // hidden sigils: click a lit one to re-cast its light; a sealed one just shimmers
    function initDesktopSigils() {
        $$('.dsig').forEach(s => {
            const a = s.dataset.angel;
            s.title = ANGELS[a] ? ANGELS[a].label : '';
            s.addEventListener('click', () => {
                if (unlocked.has(a)) { setTheme(ANGELS[a].theme); }
                else { s.classList.add('peek'); setTimeout(() => s.classList.remove('peek'), 1400); }
            });
        });
    }

    function refreshTemples() {
        const grid = $('#templeGrid');
        if (grid && !grid.childElementCount) {
            Object.keys(ANGELS).forEach(a => {
                const card = document.createElement('div');
                card.className = 'temple-card';
                card.dataset.angel = a;
                card.innerHTML = `<div class="temple-icon"><i class="fas fa-dungeon"></i></div>
                    <div class="temple-name">${ANGELS[a].label}</div>
                    <div class="temple-status">SEALED</div>`;
                card.addEventListener('click', () => openApp('exploit'));
                grid.appendChild(card);
            });
        }
        if (grid) $$('.temple-card', grid).forEach(c => {
            const on = unlocked.has(c.dataset.angel);
            c.classList.toggle('breached', on);
            $('.temple-status', c).textContent = on ? 'BREACHED' : 'SEALED';
        });
    }

    // the visualizer is shared by both playlists, so it parks in the app body
    const vizHome = () => $('#win-tracks .app-pad');
    function parkViz() {
        const viz = $('#vizWrap'), home = vizHome();
        if (viz && home && viz.parentNode !== home) home.appendChild(viz);
    }

    function refreshVault() {
        const vault = $('#demoVault'), list = $('#demoList'), msg = $('#vaultMsg');
        if (!vault || !list) return;
        const count = DEMOS.filter(d => unlocked.has(d.angel)).length;
        vault.dataset.unlocked = String(count);
        parkViz();                       // rescue it before wiping the list
        list.innerHTML = '';
        if (count === 0) {
            if (msg) msg.style.display = '';
            return;
        }
        if (msg) msg.style.display = 'none';
        DEMOS.forEach((d) => {
            const on = unlocked.has(d.angel);
            const row = document.createElement('div');
            row.className = 'demo-item';
            if (on) {
                row.innerHTML = `<span class="demo-name">${d.name}</span>
                    <button class="demo-load" type="button">&#9654; load</button>
                    <div class="xport" hidden>
                        <button class="xp-btn xp-play" type="button" aria-label="Play"><i class="fas fa-play"></i></button>
                        <input class="xp-seek" type="range" min="0" max="1000" value="0" aria-label="Seek">
                        <span class="xp-time">0:00</span>
                        <button class="xp-btn xp-mute" type="button" aria-label="Mute"><i class="fas fa-volume-up"></i></button>
                        <input class="xp-vol" type="range" min="0" max="1" step=".01" value="1" aria-label="Volume">
                    </div>
                    <audio preload="none"></audio>`;
                const btn = $('.demo-load', row), audio = $('audio', row);
                audio.dataset.srt = d.file.replace(/\.[^.]+$/, '.srt');
                audio.addEventListener('play', () => audioClaim('demo', audio));
                audio.addEventListener('pause', () => audioRelease('demo', audio));
                audio.addEventListener('ended', () => audioRelease('demo', audio));
                bindTransport(row, audio);
                btn.addEventListener('click', () => streamDemo(d.file, audio, btn));
            } else {
                const label = ANGELS[d.angel] ? ANGELS[d.angel].label : d.angel;
                row.innerHTML = `<i class="fas fa-lock"></i><span class="demo-name">${d.name}</span>
                    <span class="dim">sealed — invoke ${label}</span>`;
            }
            list.appendChild(row);
        });
    }

    /* ============================================================
       AUDIO BUS — one source at a time, RGB pulse, visualizer
       demo <audio> : pulse + visualizer     spotify : pulse only
       youtube      : neither (it has its own picture)
       ============================================================ */
    const AUDIO = { current: null, owner: null, spotify: [] };

    // every local player, not just the demo vault — the tracklist has its own rows
    const pauseLocalAudio = (except) =>
        $$('audio').forEach(a => { if (a !== except && !a.paused) a.pause(); });
    // only poke players we know are playing — pausing an unloaded embed throws
    const pauseSpotify = () =>
        AUDIO.spotify.forEach(e => { if (e.playing) { e.playing = false; try { e.ctrl.pause(); } catch (_) {} } });
    const pauseYouTube = () =>
        $$('#ytPlayer').forEach(f => {
            try { f.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*'); } catch (e) {}
        });

    // a source announces it started; every other source stands down
    function audioClaim(kind, el) {
        if (AUDIO.current === kind && kind !== 'demo') return;   // spotify spams updates
        AUDIO.current = kind;
        AUDIO.owner = el || null;
        if (kind !== 'demo') pauseLocalAudio(); else pauseLocalAudio(el);
        if (kind !== 'spotify') pauseSpotify();
        if (kind !== 'youtube') pauseYouTube();
        document.documentElement.classList.toggle('audio-live', kind === 'demo' || kind === 'spotify');
        if (kind === 'demo') startViz(el); else stopViz();
    }
    // pause events land a tick late, so a displaced track must not tear down its successor
    function audioRelease(kind, el) {
        if (AUDIO.current !== kind) return;
        if (el && AUDIO.owner && el !== AUDIO.owner) return;
        AUDIO.current = null;
        AUDIO.owner = null;
        document.documentElement.classList.remove('audio-live');
        stopViz();
    }

    /* ---- visualizer (demo audio only — cross-origin frames can't be tapped) ---- */
    let actx = null, analyser = null, outGain = null, vizRAF = null;
    const srcCache = new WeakMap();
    // iOS makes HTMLMediaElement.volume read-only and the graph bypasses the
    // element's output stage, so level has to be controlled by a GainNode
    const wantGain = new WeakMap();
    function setGain(audio, v) {
        wantGain.set(audio, v);
        if (outGain && AUDIO.owner === audio) outGain.gain.value = v;
    }
    function startViz(audio) {
        const canvas = $('#vizCanvas');
        if (!canvas || !audio) return;
        try {
            actx = actx || new (window.AudioContext || window.webkitAudioContext)();
            if (actx.state === 'suspended') actx.resume();
            if (!analyser) {
                analyser = actx.createAnalyser();
                analyser.fftSize = 1024;
                analyser.smoothingTimeConstant = .72;
                // measured content range for these masters: bass peaks ~-26dB, air ~-73dB
                analyser.minDecibels = -78;
                analyser.maxDecibels = -22;
                outGain = actx.createGain();
                analyser.connect(outGain);          // viz taps pre-gain, so mute keeps the bars alive
                outGain.connect(actx.destination);
            }
            let src = srcCache.get(audio);          // one source node per element, ever
            if (!src) { src = actx.createMediaElementSource(audio); srcCache.set(audio, src); }
            try { src.disconnect(); } catch (e) {}
            src.connect(analyser);
            outGain.gain.value = wantGain.has(audio) ? wantGain.get(audio) : 1;
        } catch (e) { return; }

        $('#vizWrap')?.classList.add('on');
        mountViz(audio);
        // keyed off the element, not the load button: that button is removed after the
        // first play, so replaying a track must not inherit another track's cues
        loadCues(audio.dataset.srt || '');
        const ctx = canvas.getContext('2d');
        const bins = new Uint8Array(analyser.frequencyBinCount);
        const bars = buildBarMap(actx.sampleRate, analyser.fftSize);
        const vals = new Float32Array(BARS);
        if (!hexes.length) seedHexes(canvas.width, canvas.height);
        cancelAnimationFrame(vizRAF);

        const draw = () => {
            vizRAF = requestAnimationFrame(draw);
            tickLyric(audio.currentTime);
            analyser.getByteFrequencyData(bins);
            const w = canvas.width, h = canvas.height, n = bins.length;

            let level = 0;
            for (let i = 0; i < BARS; i++) {
                const b = bars[i];
                let peak = 0, sum = 0, cnt = 0;
                for (let j = b.lo; j < b.hi && j < n; j++) { if (bins[j] > peak) peak = bins[j]; sum += bins[j]; cnt++; }
                const raw = cnt ? (peak * .65 + (sum / cnt) * .35) / 255 : 0;
                // lift the naturally-quiet top end, then expand so only real peaks reach full height
                const adj = raw + b.tilt * Math.min(1, raw * 5);
                vals[i] = Math.pow(Math.min(1, adj), 2.2);
                level += vals[i];
            }
            level /= BARS;
            let bass = 0; for (let i = 0; i < 8; i++) bass += vals[i];
            bass /= 8;
            const t = performance.now();

            ctx.clearRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'lighter';   // neon bloom where things overlap

            // hexagrams drifting up through the spectrum
            hexes.forEach(hx => {
                hx.y -= hx.vy * (.35 + bass * 2.4);
                hx.rot += hx.spin * (.5 + bass * 2);
                if (hx.y < -44) { hx.y = h + 34; hx.x = Math.random() * w; }
                const r = hx.r * (1 + bass * .55);
                const hue = (hx.hue + t / 24) % 360;
                ctx.lineWidth = 1.2;
                ctx.strokeStyle = `hsla(${hue}, 100%, 68%, ${(.18 + level * .62).toFixed(3)})`;
                ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
                ctx.shadowBlur = 8 + bass * 20;
                sigilPath(ctx, hx.kind, hx.x, hx.y, r, hx.rot);
                ctx.stroke();
            });

            // mirrored bars blooming out from the centre line
            const mid = h / 2, bw = w / BARS, span = h * .46;
            for (let i = 0; i < BARS; i++) {
                const v = vals[i];
                const bh = Math.max(1, v * span);
                const hue = ((i / BARS) * 360 + t / 18) % 360;
                ctx.fillStyle = `hsla(${hue}, 100%, ${55 + v * 22}%, .92)`;
                ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
                ctx.shadowBlur = 5 + v * 15;
                const x = i * bw, bwid = Math.max(1, bw - 1.6);
                ctx.fillRect(x, mid - bh, bwid, bh);
                ctx.fillRect(x, mid, bwid, bh);
            }

            ctx.shadowBlur = 0;
            ctx.globalCompositeOperation = 'source-over';
        };
        draw();
    }

    /* ---- log-spaced bar mapping ----
       FFT bins are linear in frequency but music energy isn't, so a straight
       bin-per-bar layout leaves the top three quarters of the canvas dead.
       Each bar owns an octave-ish slice from 40Hz up; tilt compensates for the
       measured ~32dB bass-to-air rolloff in these masters. */
    const BARS = 64;
    function buildBarMap(sampleRate, fftSize) {
        const binHz = sampleRate / fftSize, fMin = 40, fMax = Math.min(16000, sampleRate / 2);
        const map = [];
        for (let i = 0; i < BARS; i++) {
            const lo = fMin * Math.pow(fMax / fMin, i / BARS);
            const hi = fMin * Math.pow(fMax / fMin, (i + 1) / BARS);
            const a = Math.floor(lo / binHz);
            map.push({ lo: a, hi: Math.max(a + 1, Math.ceil(hi / binHz)), tilt: (i / BARS) * .42 });
        }
        return map;
    }

    /* ---- hexagram motes that float through the bars ---- */
    const hexes = [];
    // the four corner variants off the altar frame, plus the pentacle
    const SIGILS = ['star', 'stack', 'diamond', 'hourglass', 'pentacle'];
    function seedHexes(w, h) {
        for (let i = 0; i < 12; i++) {
            hexes.push({
                x: Math.random() * w, y: Math.random() * h,
                r: 7 + Math.random() * 15,
                rot: Math.random() * Math.PI,
                spin: (Math.random() - .5) * .02,
                vy: .25 + Math.random() * .7,
                hue: Math.random() * 360,
                kind: SIGILS[i % SIGILS.length]
            });
        }
    }

    const tri = (ctx, halfW, apexY, baseY) => {
        ctx.moveTo(0, apexY);
        ctx.lineTo(-halfW, baseY);
        ctx.lineTo(halfW, baseY);
        ctx.closePath();
    };

    function sigilPath(ctx, kind, x, y, r, rot) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.beginPath();
        if (kind === 'star') {                     // interlocking equilateral triangles
            for (let t = 0; t < 2; t++) {
                for (let i = 0; i < 3; i++) {
                    // start at -90deg so one triangle points up and the other down,
                    // rather than sitting on a vertex at 3 o'clock
                    const a = -Math.PI / 2 + t * Math.PI + i * (Math.PI * 2 / 3);
                    const px = Math.cos(a) * r, py = Math.sin(a) * r;
                    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
                }
                ctx.closePath();
            }
        } else if (kind === 'stack') {             // twin up-triangles offset by half a height
            tri(ctx, r * .85, -r, r * .33);
            tri(ctx, r * .85, -r * .33, r);
        } else if (kind === 'diamond') {           // up + down sharing a base
            tri(ctx, r * .78, -r, 0);
            tri(ctx, r * .78, r, 0);
        } else if (kind === 'hourglass') {         // down + up meeting at a point
            tri(ctx, r * .95, 0, -r);
            tri(ctx, r * .95, 0, r);
        } else {                                   // pentacle — 5 points, every second one
            for (let i = 0; i <= 5; i++) {
                const a = -Math.PI / 2 + (i * 2 % 5) * (Math.PI * 2 / 5);
                const px = Math.cos(a) * r, py = Math.sin(a) * r;
                i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
            }
            ctx.moveTo(r, 0);
            ctx.arc(0, 0, r, 0, Math.PI * 2);
        }
        ctx.restore();
    }
    function stopViz() {
        cancelAnimationFrame(vizRAF); vizRAF = null;
        const c = $('#vizCanvas');
        if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height);
        $('#vizWrap')?.classList.remove('on');
        // nothing left to look at, so don't strand the user on a blank fullscreen
        if ($('#vizWrap')?.classList.contains('fs')) {
            if (fsEl()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
            else setVizFull(false);
        }
    }

    // park the visualizer directly above whichever track is playing
    /* ---- timed lyrics ----------------------------------------------
       Cues ride the visualizer's existing rAF loop rather than the audio
       element's timeupdate event, which only fires ~4x/sec and would let
       lines land a beat late. */
    const srtCache = new Map();
    let cues = null, cueIdx = -1;
    const LYRIC_HOLD = 1.2;                  // how long a line lingers once nothing follows it

    // SRT puts a comma before the milliseconds; WebVTT uses a period
    function parseSRT(text) {
        const out = [];
        const secs = (t) => {
            const m = t.trim().match(/(\d+):(\d+):(\d+)[,.](\d+)/);
            return m ? (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]) + (+m[4]) / 1000 : NaN;
        };
        String(text).replace(/\r/g, '').split(/\n\s*\n/).forEach(block => {
            const lines = block.split('\n').filter(l => l.trim() !== '');
            const at = lines.findIndex(l => l.includes('-->'));
            if (at < 0) return;
            const [from, to] = lines[at].split('-->');
            const start = secs(from), end = secs(to);
            const body = lines.slice(at + 1).join(' ').trim();
            if (isFinite(start) && isFinite(end) && body) out.push({ start, end, body });
        });
        return out.sort((a, b) => a.start - b.start);
    }

    async function loadCues(src) {
        const el = $('#vizLyric');
        cues = null; cueIdx = -1;
        if (el) { el.textContent = ''; el.classList.remove('on'); }
        if (!src) return;
        if (srtCache.has(src)) { cues = srtCache.get(src); return; }
        try {
            const r = await fetch(src);
            if (!r.ok) throw 0;
            const parsed = parseSRT(await r.text());
            srtCache.set(src, parsed.length ? parsed : null);
            cues = srtCache.get(src);
        } catch (e) { srtCache.set(src, null); }
    }

    function tickLyric(t) {
        const el = $('#vizLyric');
        if (!el || !cues) return;
        // Layered vocals put the next line's start before the previous line's end,
        // so the latest line to have *started* wins and the previous one cuts early.
        // A line then holds until its successor arrives rather than blinking out in
        // the sub-second gaps between stacked takes.
        let i = -1;
        for (let k = cues.length - 1; k >= 0; k--) {
            if (cues[k].start <= t) { i = k; break; }
        }
        let show = i;
        if (i >= 0) {
            const c = cues[i], next = cues[i + 1];
            const until = next ? Math.min(next.start, c.end + LYRIC_HOLD)
                               : c.end + LYRIC_HOLD;
            if (t >= until) show = -1;          // real instrumental gap: let it fade
        }
        if (show === cueIdx) return;
        cueIdx = show;
        if (show < 0) { el.classList.remove('on'); return; }
        el.textContent = cues[show].body;
        el.classList.remove('on');
        void el.offsetWidth;                 // restart the fade for back-to-back lines
        el.classList.add('on');
    }

    /* ---- fullscreen visualizer ---------------------------------------
       Real fullscreen where the browser allows it; iOS Safari refuses it on
       anything but <video>, so fall back to a fixed overlay that covers the
       viewport. Both share the .fs class, so the styling is one path. */
    const VIZ_BASE = { w: 600, h: 110 };
    const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement || null;

    function sizeVizCanvas(full) {
        const canvas = $('#vizCanvas');
        if (!canvas) return;
        if (full) {
            // the wrap animates its height, so measuring the element here catches a
            // mid-transition value; the viewport is the real target either way
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(window.innerWidth * dpr);
            canvas.height = Math.round(window.innerHeight * dpr);
        } else {
            canvas.width = VIZ_BASE.w;
            canvas.height = VIZ_BASE.h;
        }
        hexes.length = 0;                    // they carry absolute coords, so re-scatter
        seedHexes(canvas.width, canvas.height);
    }

    function setVizFull(on) {
        const wrap = $('#vizWrap'), btn = $('#vizFull');
        if (!wrap) return;
        wrap.classList.toggle('fs', on);
        document.documentElement.classList.toggle('viz-fs', on);
        if (btn) {
            btn.innerHTML = `<i class="fas fa-${on ? 'compress' : 'expand'}"></i>`;
            btn.setAttribute('aria-label', (on ? 'Exit fullscreen' : 'Fullscreen') + ' visualizer');
        }
        requestAnimationFrame(() => sizeVizCanvas(on));
    }

    function toggleVizFull() {
        const wrap = $('#vizWrap');
        if (!wrap) return;
        const isOn = wrap.classList.contains('fs');
        if (isOn) {
            if (fsEl()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
            else setVizFull(false);
            return;
        }
        const req = wrap.requestFullscreen || wrap.webkitRequestFullscreen;
        if (req) {
            Promise.resolve(req.call(wrap)).catch(() => setVizFull(true));   // denied: overlay instead
        } else {
            setVizFull(true);
        }
    }

    function initVizFull() {
        $('#vizFull')?.addEventListener('click', toggleVizFull);
        const sync = () => setVizFull(!!fsEl());
        document.addEventListener('fullscreenchange', sync);
        document.addEventListener('webkitfullscreenchange', sync);
        // the overlay fallback has no Esc handling of its own
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !fsEl() && $('#vizWrap')?.classList.contains('fs')) setVizFull(false);
        });
        window.addEventListener('resize', () => {
            if ($('#vizWrap')?.classList.contains('fs')) sizeVizCanvas(true);
        });
    }

    function mountViz(audio) {        const wrap = $('#vizWrap'), row = audio.closest('.demo-item, .cat-row');
        if (!wrap || !row || !row.parentNode) return;
        if (wrap.nextElementSibling !== row) row.parentNode.insertBefore(wrap, row);
        const label = $('#vizLabel'), name = $('.demo-name, .c-title', row);
        if (label && name) label.textContent = '\u25B6 ' + name.textContent.trim();
        wrap.scrollIntoView({ block: 'nearest' });
    }

    /* ---- bridges to the embedded players ---- */
    function initYouTubeBridge() {
        window.addEventListener('message', (e) => {
            if (!/youtube\.com$/.test(new URL(e.origin).hostname.replace(/^www\./, ''))) return;
            let d; try { d = JSON.parse(e.data); } catch (_) { return; }
            const st = d && d.info && typeof d.info.playerState === 'number' ? d.info.playerState : null;
            if (st === 1) audioClaim('youtube');
            else if (st === 2 || st === 0) audioRelease('youtube');
        });
    }
    // Spotify's iframe API calls this once it loads
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
        $$('.spotify-embed').forEach(el => {
            // the API maps theme:'dark' to ?theme=0, Spotify's flat dark player;
            // the default tints the background from the artwork instead
            IFrameAPI.createController(el, { uri: el.dataset.uri, width: '100%', height: 420, theme: 'dark' }, (ctrl) => {
                const entry = { ctrl, playing: false };
                AUDIO.spotify.push(entry);
                ctrl.addListener('playback_update', (ev) => {
                    const playing = !!(ev && ev.data && ev.data.isPaused === false);
                    if (playing === entry.playing) return;
                    entry.playing = playing;
                    if (playing) audioClaim('spotify'); else audioRelease('spotify');
                });
            });
        });
    };

    const clock = (s) => isFinite(s) && s > 0
        ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0')
        : '0:00';

    /* native <audio controls> chrome differs wildly per engine, so we drive a hidden
       element from our own transport and style that instead */
    function bindTransport(row, audio) {
        const play = $('.xp-play', row), seek = $('.xp-seek', row), time = $('.xp-time', row),
              mute = $('.xp-mute', row), vol = $('.xp-vol', row);
        const icon = (btn, name) => { $('i', btn).className = 'fas fa-' + name; };
        const fillTrack = (el, frac) => el.style.setProperty('--fill', (frac * 100).toFixed(2) + '%');
        let scrubbing = false;

        play.addEventListener('click', () => {
            audio.paused ? audio.play().catch(() => {}) : audio.pause();
        });
        audio.addEventListener('play', () => { icon(play, 'pause'); play.setAttribute('aria-label', 'Pause'); });
        ['pause', 'ended'].forEach(ev => audio.addEventListener(ev, () => {
            icon(play, 'play'); play.setAttribute('aria-label', 'Play');
        }));

        const sync = () => {
            const d = audio.duration;
            if (!scrubbing && d) { seek.value = (audio.currentTime / d) * 1000; fillTrack(seek, audio.currentTime / d); }
            time.textContent = clock(audio.currentTime) + ' / ' + clock(d);
        };
        audio.addEventListener('timeupdate', sync);
        audio.addEventListener('loadedmetadata', sync);

        seek.addEventListener('input', () => { scrubbing = true; fillTrack(seek, seek.value / 1000); });
        seek.addEventListener('change', () => {
            if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
            scrubbing = false;
        });

        // state is tracked here rather than read back off the element, because iOS
        // silently ignores writes to .volume and never fires volumechange for them
        let muted = false, level = 1;
        const applyLevel = () => {
            const out = muted ? 0 : level;
            audio.volume = level;            // honoured on desktop, no-op on iOS
            audio.muted = muted;
            setGain(audio, out);             // the part every platform honours
            icon(mute, out ? 'volume-up' : 'volume-mute');
            mute.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
            vol.value = out;
            fillTrack(vol, out);
        };
        mute.addEventListener('click', () => { muted = !muted; applyLevel(); });
        vol.addEventListener('input', () => { level = +vol.value; muted = false; applyLevel(); });
        applyLevel();
    }

    async function streamDemo(file, audio, btn) {
        btn.disabled = true; btn.innerHTML = '&#8230;';
        try {
            const res = await fetch(file);
            if (!res.ok) throw new Error('missing');
            const b64 = (await res.text()).replace(/\s+/g, '');
            const bin = atob(b64);
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            audio.src = URL.createObjectURL(new Blob([bytes], { type: 'audio/mpeg' }));
            $('.xport', btn.closest('.demo-item')).hidden = false;
            btn.remove();
            audio.play().catch(() => {});
        } catch (e) {
            btn.disabled = false; btn.textContent = 'unavailable';
        }
    }

    /* ============================================================
       CATALOG — released tracks from js/catalog-data.js
       Rows with a local master play inline through the shared audio
       bus (so the visualizer works); the rest link out to Apple Music.
       ============================================================ */
    let catSortKey = 'released', catSortDesc = true, catFilter = '';
    const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    /* ── live catalogue ───────────────────────────────────────────────
       iTunes' lookup API is open and CORS-enabled, so releases and tracks can
       be read straight from the browser and a new drop appears without a
       deploy. Play counts can't: Spotify and SoundCloud both refuse
       cross-origin reads, so those stay baked and are merged back in by slug.
       catShape() must keep matching tools/fetch_catalog.py. */
    const CAT_LOOKUP = 'https://itunes.apple.com/lookup?id=1776303110&entity=';
    const CAT_CACHE = 'alter_catalog_feed';
    const CAT_TTL = 6 * 60 * 60 * 1000;

    const catSlug = (s) => s
        .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().replace(/&/g, 'and')
        .replace(/[\u2018\u2019']/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const catHiRes = (u, size = 600) =>
        (u || '').replace(/\/\d+x\d+bb\.(jpg|png)$/, `/${size}x${size}bb.$1`);
    const catBare = (s) => s.replace(/\s*-\s*(Single|EP)$/i, '');

    function catShape(songs, albums, baked) {
        // keep whatever the build could reach that the browser can't
        const prev = {};
        (baked.tracks || []).forEach(t => { prev[t.slug] = t; });

        const tracks = songs.map(s => {
            const title = s.trackName || '';
            const slug = catSlug(title);
            const ms = s.trackTimeMillis || 0;
            const was = prev[slug] || {};
            return {
                slug, title,
                album: catBare(s.collectionName || ''),
                year: (s.releaseDate || '').slice(0, 4),
                released: (s.releaseDate || '').slice(0, 10),
                durationMs: ms,
                duration: ms ? `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}` : '',
                art: catHiRes(s.artworkUrl100 || ''),
                disc: s.discNumber || 1,
                trackNumber: s.trackNumber || 0,
                appleUrl: s.trackViewUrl || '',
                spotifyUrl: was.spotifyUrl || '',
                popularity: was.popularity != null ? was.popularity : null,
                plays: was.plays || '',
                playSources: was.playSources || {},
                local: was.local || ''
            };
        });
        tracks.sort((a, b) => (a.disc - b.disc) || (a.trackNumber - b.trackNumber));
        tracks.sort((a, b) => (b.released || '').localeCompare(a.released || ''));

        const prevRel = {};
        (baked.releases || []).forEach(r => { prevRel[r.slug] = r; });
        const releases = albums.map(a => {
            const raw = a.collectionName || '';
            // the build slugs the raw name, suffix and all ("luv-u-single")
            const slug = catSlug(raw);
            const was = prevRel[slug] || {};
            // python's quote() leaves "/" alone; encodeURIComponent doesn't
            const q = encodeURIComponent(`${catBare(raw)} Jones RX`).replace(/%2F/g, '/');
            return {
                slug,
                title: catBare(raw),
                kind: /-\s*EP$/i.test(raw) ? 'EP' : /-\s*Single$/i.test(raw) ? 'Single' : 'Album',
                year: (a.releaseDate || '').slice(0, 4),
                released: (a.releaseDate || '').slice(0, 10),
                trackCount: a.trackCount || 0,
                art: catHiRes(a.artworkUrl100 || ''),
                appleUrl: a.collectionViewUrl || '',
                spotifyUrl: was.spotifyUrl || 'https://open.spotify.com/search/' + q
            };
        });
        releases.sort((a, b) => (b.released || '').localeCompare(a.released || ''));

        const years = tracks.map(t => t.year).filter(Boolean).sort();
        return {
            generated: true,
            artist: baked.artist || 'Jones RX',
            tracks, releases,
            stats: Object.assign({}, baked.stats, {
                trackCount: tracks.length,
                releaseCount: releases.length,
                firstYear: years[0] || (baked.stats || {}).firstYear,
                latestYear: years[years.length - 1] || (baked.stats || {}).latestYear
            })
        };
    }

    async function catFetchLive(baked) {
        const grab = async (entity) => {
            const r = await fetch(CAT_LOOKUP + entity + '&limit=200');
            if (!r.ok) throw new Error('itunes ' + r.status);
            return (await r.json()).results || [];
        };
        const [songs, albums] = await Promise.all([grab('song'), grab('album')]);
        const data = catShape(
            songs.filter(x => x.wrapperType === 'track'),
            albums.filter(x => x.wrapperType === 'collection'),
            baked);
        if (!data.tracks.length) throw new Error('itunes empty');
        return data;
    }

    // the one stat the browser can read live; Spotify/SoundCloud counts cannot be
    async function catLiveShows() {
        const r = await fetch('https://rest.bandsintown.com/artists/id_15564526/events' +
            '?app_id=26113258b4b0ab3265bf61cdb27edeab&date=past');
        if (!r.ok) throw new Error('bit ' + r.status);
        const j = await r.json();
        return Array.isArray(j) ? j.length : null;
    }

    async function refreshCatalog() {
        const baked = window.ALTER_CATALOG_BAKED || window.CATALOG;
        if (!baked) return;
        window.ALTER_CATALOG_BAKED = baked;
        try {
            const c = JSON.parse(localStorage.getItem(CAT_CACHE) || 'null');
            if (c && Date.now() - c.at < CAT_TTL && c.data && c.data.tracks.length) {
                window.CATALOG = c.data;
                renderCatalog(); renderAbout();
                return;
            }
        } catch (e) {}
        try {
            const data = await catFetchLive(baked);
            try {
                const shows = await catLiveShows();
                if (shows != null) data.stats.showsPlayed = shows;
            } catch (e) {}
            window.CATALOG = data;
            try { localStorage.setItem(CAT_CACHE, JSON.stringify({ at: Date.now(), data })); } catch (e) {}
            renderCatalog(); renderAbout();
        } catch (e) {
            // the baked copy is already on screen
        }
    }

    function initCatalog() {
        const rows = $('#catRows');
        if (!rows) return;
        $('#catFind')?.addEventListener('input', (e) => {
            catFilter = e.target.value.trim().toLowerCase();
            renderCatalog();
        });
        $('#catSort')?.addEventListener('click', () => {
            const order = ['released', 'title', 'plays'];
            const i = order.indexOf(catSortKey);
            if (catSortDesc) { catSortDesc = false; }
            else { catSortKey = order[(i + 1) % order.length]; catSortDesc = true; }
            renderCatalog();
        });
        $$('.pl-tab').forEach(tab => tab.addEventListener('click', () => switchPlaylist(tab.dataset.pl)));
        renderCatalog();
    }

    function switchPlaylist(which) {
        $$('.pl-tab').forEach(t => {
            const on = t.dataset.pl === which;
            t.classList.toggle('is-on', on);
            t.setAttribute('aria-selected', String(on));
        });
        const cat = $('#plCatalog'), vault = $('#plVault');
        if (cat) cat.hidden = which !== 'catalog';
        if (vault) vault.hidden = which !== 'vault';
        parkViz();                       // the pane it was sitting in may now be hidden
    }

    function renderCatalog() {
        const host = $('#catRows'), data = window.CATALOG;
        if (!host) return;
        if (!data || !data.tracks || !data.tracks.length) {
            host.innerHTML = '<p class="vault-locked-msg">Catalog unavailable.</p>';
            return;
        }
        parkViz();
        let list = data.tracks.slice();
        if (catFilter) {
            list = list.filter(t => (t.title + ' ' + t.album).toLowerCase().includes(catFilter));
        }
        const playNum = (v) => {
            const m = String(v || '').trim().replace(/,/g, '').match(/^([\d.]+)\s*([KMB])?$/i);
            if (!m) return -1;
            return parseFloat(m[1]) * ({ k: 1e3, m: 1e6, b: 1e9 }[(m[2] || '').toLowerCase()] || 1);
        };
        list.sort((a, b) => {
            if (catSortKey === 'title') {
                const d = a.title.localeCompare(b.title);
                return catSortDesc ? -d : d;
            }
            if (catSortKey === 'plays') {
                const d = playNum(a.plays) - playNum(b.plays);
                return catSortDesc ? -d : d;
            }
            const d = (a.released || '').localeCompare(b.released || '');
            if (d) return catSortDesc ? -d : d;
            // same release: keep album order rather than whatever the array held
            return (a.disc || 1) - (b.disc || 1) || (a.trackNumber || 0) - (b.trackNumber || 0);
        });

        const label = { released: 'year', title: 'title', plays: 'plays' }[catSortKey];
        const sortBtn = $('#catSort');
        if (sortBtn) sortBtn.textContent = label + (catSortDesc ? ' \u2193' : ' \u2191');
        const count = $('#catCount');
        if (count) count.textContent = list.length + (list.length === 1 ? ' track' : ' tracks');

        // counts are summed across every platform that publishes them; a track with
        // zero everywhere shows "< 1K" rather than a bare 0
        const compact = (n) => n >= 1e9 ? (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B'
            : n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
            : n >= 1e4 ? Math.round(n / 1e3) + 'K'
            : n >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K' : String(n);
        const show = (v) => /^\d+$/.test(String(v)) ? compact(+v) : String(v);
        const SRC = { spotify: 'Spotify', soundcloud: 'SoundCloud', youtube: 'YouTube' };
        const playCell = (t) => {
            const src = t.playSources || {};
            const tip = Object.keys(src).map(k => `${SRC[k] || k} ${(+src[k]).toLocaleString()}`).join(' \u00b7 ');
            return t.plays
                ? { text: show(t.plays), cls: '', tip: tip || '' }
                : { text: '< 1K', cls: ' is-low', tip: 'no public count on any platform' };
        };

        host.innerHTML = '';
        list.forEach((t, i) => {
            const row = document.createElement('div');
            row.className = 'cat-row' + (t.local ? ' has-audio' : '');
            // singles name the release after the track, so the subtitle would just repeat
            const sub = t.album && t.album !== t.title ? `<em class="c-album">${esc(t.album)}</em>` : '';
            const pc = playCell(t);
            row.innerHTML = `
                <span class="c-num">${i + 1}</span>
                <span class="c-title">${esc(t.title)}${sub}</span>
                <span class="c-plays${pc.cls}"${pc.tip ? ` title="${esc(pc.tip)}"` : ''}>${esc(pc.text)}</span>
                <span class="c-year">${esc(t.year)}</span>
                <span class="c-dur">${esc(t.duration)}</span>
                <span class="c-go"></span>`;
            const go = $('.c-go', row);
            if (t.local) {
                go.innerHTML = `<button class="demo-load" type="button">&#9654;</button>
                    <audio preload="none"></audio>
                    <div class="xport" hidden>
                        <button class="xp-btn xp-play" type="button" aria-label="Play"><i class="fas fa-play"></i></button>
                        <input class="xp-seek" type="range" min="0" max="1000" value="0" aria-label="Seek">
                        <span class="xp-time">0:00</span>
                        <button class="xp-btn xp-mute" type="button" aria-label="Mute"><i class="fas fa-volume-up"></i></button>
                        <input class="xp-vol" type="range" min="0" max="1" step=".01" value="1" aria-label="Volume">
                    </div>`;
                const audio = $('audio', row), btn = $('.demo-load', row);
                audio.addEventListener('play', () => audioClaim('demo', audio));
                audio.addEventListener('pause', () => audioRelease('demo', audio));
                audio.addEventListener('ended', () => audioRelease('demo', audio));
                bindTransport(row, audio);
                btn.addEventListener('click', () => {
                    audio.src = t.local;
                    $('.xport', row).hidden = false;
                    btn.remove();
                    audio.play().catch(() => {});
                });
            } else if (t.appleUrl) {
                go.innerHTML = `<a class="cat-out" href="${esc(t.appleUrl)}" target="_blank"
                    rel="noopener" title="Listen on Apple Music"><i class="fas fa-external-link-alt"></i></a>`;
            }
            host.appendChild(row);
        });
    }

    /* ── merch ────────────────────────────────────────────────────────
       The store can't be iframed, so the collection is mirrored locally and
       the cart is ours. Checkout hands everything to Shopify in one cart
       permalink (/cart/<variant>:<qty>,...), which opens a real checkout
       with the whole order already in it. */
    const MR = { q: '', kind: 'all', sort: 'new', max: 0, stock: false, cart: [], pick: null };
    const MR_KEY = 'alter_cart';
    let mrRefresh = () => {};

    function mrLoad() {
        try { MR.cart = JSON.parse(localStorage.getItem(MR_KEY) || '[]') || []; }
        catch (e) { MR.cart = []; }
        if (!Array.isArray(MR.cart)) MR.cart = [];
    }
    const mrSave = () => { try { localStorage.setItem(MR_KEY, JSON.stringify(MR.cart)); } catch (e) {} };
    const mrCount = () => MR.cart.reduce((n, l) => n + l.q, 0);
    const mrTotal = () => MR.cart.reduce((n, l) => n + l.q * parseFloat(l.p), 0);

    const mrMoney = (n) => '$' + (Number.isInteger(n) ? n : n.toFixed(2));

    // the documented Shopify cart permalink; no API key involved
    function mrLink(lines, storefront) {
        const shop = (window.MERCH && window.MERCH.shop) || '';
        const pairs = lines.map(l => `${l.v}:${l.q}`).join(',');
        return `${shop}/cart/${pairs}${storefront ? '?storefront=true' : ''}`;
    }
    const mrGo = (lines, storefront) => {
        if (!lines.length) return;
        window.open(mrLink(lines, storefront), '_blank', 'noopener');
    };

    function mrAdd(line) {
        const hit = MR.cart.find(l => l.v === line.v);
        if (hit) hit.q += line.q; else MR.cart.push(line);
        mrSave(); mrBadge(); mrDrawCart();
    }
    function mrBump(vid, d) {
        const hit = MR.cart.find(l => l.v === vid);
        if (!hit) return;
        hit.q += d;
        if (hit.q < 1) MR.cart = MR.cart.filter(l => l.v !== vid);
        mrSave(); mrBadge(); mrDrawCart();
    }

    function mrBadge() {
        const n = mrCount(), el = $('#mrBagN');
        if (!el) return;
        el.textContent = n;
        el.hidden = n === 0;
        $('#mrBag')?.classList.toggle('has', n > 0);
    }

    function mrDrawCart() {
        const list = $('#mrCartList');
        if (!list) return;
        list.innerHTML = MR.cart.map(l => `
            <li class="mr-line">
                ${l.img ? `<img src="${esc(l.img)}" alt="" loading="lazy">` : '<span class="mr-line-nopic"></span>'}
                <div class="mr-line-txt">
                    <span class="mr-line-name">${esc(l.t)}</span>
                    ${l.vt ? `<span class="mr-line-opt">${esc(l.vt)}</span>` : ''}
                    <span class="mr-line-price">${esc(mrMoney(parseFloat(l.p)))}</span>
                </div>
                <div class="mr-line-qty">
                    <button data-dec="${esc(l.v)}" aria-label="One fewer">&minus;</button>
                    <b>${l.q}</b>
                    <button data-inc="${esc(l.v)}" aria-label="One more">+</button>
                </div>
                <button class="mr-line-x" data-del="${esc(l.v)}" aria-label="Remove">&times;</button>
            </li>`).join('') || '<li class="mr-cart-empty">your cart is empty.</li>';
        $('#mrCartSum').textContent = mrMoney(mrTotal());
        const empty = !MR.cart.length;
        $('#mrCartGo').disabled = empty;
        $('#mrCartView').disabled = empty;
    }

    /* ---- variant picker ---- */
    // variant titles come back as "Black / XS", matching item.opts in order
    const mrParts = (vt) => vt.split(' / ');

    function mrPickOpen(item, intent) {
        MR.pick = { item, sel: item.opts.map(() => null) };
        // preselect the first combination that is actually in stock
        const first = item.vars.find(v => v[3]) || item.vars[0];
        if (first) MR.pick.sel = mrParts(first[1]);
        $('#mrPickImg').src = item.img || '';
        $('#mrPickName').textContent = item.title;
        $('#mrPickLink').href = item.url;
        $('#mrPick').hidden = false;
        mrPickDraw();
        // land on the button they actually pressed, so Enter does what they meant
        const go = intent === 'buy' ? $('#mrPickBuy') : $('#mrPickAdd');
        if (!go.disabled) go.focus();
    }
    const mrPickClose = () => { $('#mrPick').hidden = true; MR.pick = null; };

    function mrPickMatch() {
        const { item, sel } = MR.pick;
        return item.vars.find(v => {
            const p = mrParts(v[1]);
            return sel.every((s, i) => p[i] === s);
        });
    }

    function mrPickDraw() {
        const { item, sel } = MR.pick;
        const box = $('#mrPickOpts');
        box.innerHTML = item.opts.map((name, i) => {
            // only offer values that exist alongside the other picks
            const vals = [...new Set(item.vars.map(v => mrParts(v[1])[i]))];
            return `<label class="mr-opt">${esc(name)}
                <select data-oi="${i}">${vals.map(val => {
                    const live = item.vars.some(v => {
                        const p = mrParts(v[1]);
                        return p[i] === val && v[3] &&
                               sel.every((s, j) => j === i || p[j] === s);
                    });
                    return `<option value="${esc(val)}"${val === sel[i] ? ' selected' : ''}>` +
                        `${esc(val)}${live ? '' : ' \u2014 sold out'}</option>`;
                }).join('')}</select></label>`;
        }).join('');

        const v = mrPickMatch();
        const ok = !!(v && v[3]);
        $('#mrPickPrice').textContent = v ? mrMoney(parseFloat(v[2]))
            : 'that combination isn\u2019t made';
        $('#mrPickAdd').disabled = !ok;
        $('#mrPickBuy').disabled = !ok;
        $('#mrPickAdd').textContent = ok ? 'add to cart'
            : v ? 'sold out' : 'unavailable';
    }

    function mrPickLine() {
        const v = mrPickMatch();
        if (!v || !v[3]) return null;
        const i = MR.pick.item;
        return { v: v[0], t: i.title, vt: v[1], p: v[2], img: i.img, url: i.url, q: 1 };
    }

    // simple products have one variant and nothing to choose
    function mrQuickLine(item) {
        const v = item.vars.find(x => x[3]);
        return v ? { v: v[0], t: item.title, vt: '', p: v[2], img: item.img, url: item.url, q: 1 } : null;
    }

    /* ---- live catalogue -------------------------------------------
       Shopify serves products.json with Access-Control-Allow-Origin: *, so the
       collection can be read straight from the browser. js/merch-data.js is
       only a fallback: it paints instantly and covers the store being
       unreachable, but anything added on Shopify shows up without a deploy.
       mrShape() must keep producing the same records as fetch_merch.py. */
    const MR_FEED = 'https://sweltersounds.com/collections/jones/products.json?limit=250';
    const MR_CACHE = 'alter_merch_feed';
    const MR_TTL = 30 * 60 * 1000;

    const MR_KINDS = [
        ['Hoodie',    /hoodie|zip[- ]?up|sweatshirt|crewneck|jacket/i],
        ['Tee',       /t-?shirt|tee\b|crop top/i],
        ['Pants',     /sweatpants|track pants|joggers|leggings|shorts/i],
        ['Hat',       /\bhat\b|\bcap\b|beanie|visor/i],
        ['Bag',       /tote|backpack|fanny pack|pouch|\bbag\b/i],
        ['Wall Art',  /poster|canvas|flag|tapestry/i],
        ['Sticker',   /sticker|pin set|\bpins?\b|magnet/i],
        ['Drinkware', /mug|tumbler|bottle/i],
        ['Home',      /pillow|blanket|towel|curtain|mouse ?pad|desk ?mat|rug/i],
        ['Case',      /case|skin\b/i]
    ];
    const mrKindOf = (t) => (MR_KINDS.find(([, re]) => re.test(t)) || ['Other'])[0];
    const mrCash = (v) => Number.isInteger(v) ? String(v) : v.toFixed(2);
    const mrThumb = (src, px = 400) =>
        src.replace(/(\.(?:jpg|jpeg|png|webp))(\?|$)/i, `_${px}x$1$2`);
    const mrPlain = (body) => (body || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;|\u00a0/g, ' ')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&#39;|&rsquo;/g, '\u2019').replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ').trim().slice(0, 160);

    function mrShape(products) {
        const base = (window.MERCH && window.MERCH.store) ||
            'https://sweltersounds.com/collections/jones';
        return (products || []).map(p => {
            const vars = p.variants || [];
            const prices = vars.map(v => parseFloat(v.price)).filter(n => !isNaN(n));
            if (!prices.length) return null;
            const lo = Math.min(...prices), hi = Math.max(...prices);
            const title = p.title.replace('Jones - ', '').trim();
            const opts = (p.options || []).map(o => o.name);
            return {
                title,
                url: `${base}/products/${p.handle}`,
                img: p.images && p.images[0] ? mrThumb(p.images[0].src) : '',
                price: mrCash(lo),
                priceMax: hi !== lo ? mrCash(hi) : '',
                low: Math.round(lo * 100) / 100,
                available: vars.some(v => v.available),
                kind: mrKindOf(title),
                added: (p.published_at || p.created_at || '').slice(0, 10),
                // a lone "Title" option means there is no real choice to make
                opts: (opts.length === 1 && opts[0] === 'Title') ? [] : opts,
                vars: vars.map(v => [String(v.id), v.title, mrCash(parseFloat(v.price)),
                                     v.available ? 1 : 0]),
                desc: mrPlain(p.body_html)
            };
        }).filter(Boolean)
          .sort((a, b) => (a.available === b.available)
              ? a.title.localeCompare(b.title) : (a.available ? -1 : 1));
    }

    function mrCached() {
        try {
            const c = JSON.parse(localStorage.getItem(MR_CACHE) || 'null');
            if (c && Date.now() - c.at < MR_TTL && Array.isArray(c.items) && c.items.length) return c.items;
        } catch (e) {}
        return null;
    }

    async function mrFetchLive() {
        const r = await fetch(MR_FEED, { cache: 'no-store' });
        if (!r.ok) throw new Error('feed ' + r.status);
        const items = mrShape((await r.json()).products);
        if (!items.length) throw new Error('feed empty');
        try { localStorage.setItem(MR_CACHE, JSON.stringify({ at: Date.now(), items })); } catch (e) {}
        return items;
    }

    function renderMerch() {
        const grid = $('#mrGrid'), data = window.MERCH;
        if (!grid || !data) return;
        const store = $('#mrStore');
        if (store && data.store) store.href = data.store;
        let items = mrCached() || data.items || [];

        mrLoad(); mrBadge(); mrDrawCart();

        const slider = $('#mrMax');

        function fitControls() {
            const lows = items.map(i => i.low || 0);
            const ceiling = Math.ceil(Math.max(...lows));
            const floor = Math.floor(Math.min(...lows));
            const wasMax = +slider.value === +slider.max || !slider.value;
            slider.min = floor;
            slider.max = ceiling;
            // keep the shopper's ceiling unless the catalogue outgrew it
            if (wasMax || MR.max > ceiling) { slider.value = ceiling; MR.max = ceiling; }
            const keep = $('#mrKind').value || 'all';
            const kinds = [...new Set(items.map(i => i.kind))].sort();
            $('#mrKind').innerHTML = '<option value="all">all</option>' +
                kinds.map(k => `<option value="${esc(k)}">${esc(k)}</option>`).join('');
            if (kinds.includes(keep)) $('#mrKind').value = keep;
            else if (keep !== 'all') MR.kind = 'all';
            return ceiling;
        }
        let ceiling = fitControls();

        const sorters = {
            new: (a, b) => (b.added || '').localeCompare(a.added || '') || a.title.localeCompare(b.title),
            lo: (a, b) => a.low - b.low,
            hi: (a, b) => b.low - a.low,
            az: (a, b) => a.title.localeCompare(b.title)
        };

        function draw() {
            const term = MR.q.trim().toLowerCase();
            const list = items.filter(i =>
                (!term || i.title.toLowerCase().includes(term) ||
                          (i.desc || '').toLowerCase().includes(term)) &&
                (MR.kind === 'all' || i.kind === MR.kind) &&
                (!MR.stock || i.available) &&
                i.low <= MR.max
            ).sort(sorters[MR.sort]);

            $('#mrCount').textContent = `${list.length} item${list.length === 1 ? '' : 's'}`;
            $('#mrMaxOut').textContent = '$' + MR.max;

            grid.innerHTML = list.map(i => {
                const idx = items.indexOf(i);
                const range = i.priceMax ? ' <i>\u2013 $' + esc(i.priceMax) + '</i>' : '';
                return `
                <div class="mr-item${i.available ? '' : ' is-out'}">
                    <a class="mr-link" href="${esc(i.url)}" target="_blank" rel="noopener"
                       title="${esc(i.desc || i.title)}">
                        <span class="mr-shot">
                            ${i.img ? `<img src="${esc(i.img)}" alt="${esc(i.title)}" loading="lazy">` : ''}
                            ${i.available ? '' : '<span class="mr-flag">sold out</span>'}
                            <span class="mr-kind">${esc(i.kind)}</span>
                        </span>
                        <span class="mr-name">${esc(i.title)}</span>
                        <span class="mr-price">$${esc(i.price)}${range}</span>
                    </a>
                    ${i.available ? `<span class="mr-act">
                        <button class="mr-add" data-i="${idx}" data-act="add">add to cart</button>
                        <button class="mr-buy" data-i="${idx}" data-act="buy">buy now</button>
                    </span>` : ''}
                </div>`;
            }).join('') || '<p class="mr-empty">nothing matches that.</p>';
        }

        $('#mrFind').addEventListener('input', (e) => { MR.q = e.target.value; draw(); });
        $('#mrKind').addEventListener('change', (e) => { MR.kind = e.target.value; draw(); });
        $('#mrSort').addEventListener('change', (e) => { MR.sort = e.target.value; draw(); });
        $('#mrMax').addEventListener('input', (e) => { MR.max = +e.target.value; draw(); });
        $('#mrStock').addEventListener('change', (e) => { MR.stock = e.target.checked; draw(); });
        $('#mrReset').addEventListener('click', () => {
            MR.q = ''; MR.kind = 'all'; MR.sort = 'new'; MR.max = ceiling; MR.stock = false;
            $('#mrFind').value = ''; $('#mrKind').value = 'all';
            $('#mrSort').value = 'new'; $('#mrMax').value = ceiling; $('#mrStock').checked = false;
            draw();
        });

        // pull the live collection; the baked copy is already on screen meanwhile
        mrRefresh = async (force) => {
            if (!force && mrCached()) return;
            const tag = $('#mrLive');
            tag.className = 'mr-live'; tag.textContent = 'syncing\u2026'; tag.hidden = false;
            try {
                items = await mrFetchLive();
                ceiling = fitControls();
                draw();
                tag.textContent = 'live'; tag.classList.add('ok');
            } catch (err) {
                tag.textContent = 'offline copy'; tag.classList.add('bad');
            }
        };
        mrRefresh(false);

        grid.addEventListener('click', (e) => {
            const b = e.target.closest('[data-act]');
            if (!b) return;
            const item = items[+b.dataset.i];
            // a size or colour has to be chosen before either action can mean anything
            if (item.opts.length) return mrPickOpen(item, b.dataset.act);
            const line = mrQuickLine(item);
            if (!line) return;
            if (b.dataset.act === 'buy') mrGo([line]);
            else { mrAdd(line); mrFlash(b); }
        });

        $('#mrPickX').addEventListener('click', mrPickClose);
        $('#mrPick').addEventListener('click', (e) => { if (e.target.id === 'mrPick') mrPickClose(); });
        $('#mrPickOpts').addEventListener('change', (e) => {
            const i = +e.target.dataset.oi;
            MR.pick.sel[i] = e.target.value;
            mrPickDraw();
        });
        $('#mrPickAdd').addEventListener('click', () => {
            const line = mrPickLine();
            if (line) { mrAdd(line); mrPickClose(); }
        });
        $('#mrPickBuy').addEventListener('click', () => {
            const line = mrPickLine();
            if (line) { mrGo([line]); mrPickClose(); }
        });

        $('#mrBag').addEventListener('click', () => { $('#mrCart').hidden = false; mrDrawCart(); });
        $('#mrCartX').addEventListener('click', () => { $('#mrCart').hidden = true; });
        $('#mrCart').addEventListener('click', (e) => { if (e.target.id === 'mrCart') $('#mrCart').hidden = true; });
        $('#mrCartList').addEventListener('click', (e) => {
            const t = e.target.closest('button');
            if (!t) return;
            if (t.dataset.inc) mrBump(t.dataset.inc, 1);
            else if (t.dataset.dec) mrBump(t.dataset.dec, -1);
            else if (t.dataset.del) { MR.cart = MR.cart.filter(l => l.v !== t.dataset.del); mrSave(); mrBadge(); mrDrawCart(); }
        });
        $('#mrCartGo').addEventListener('click', () => mrGo(MR.cart));
        $('#mrCartView').addEventListener('click', () => mrGo(MR.cart, true));
        $('#mrCartClear').addEventListener('click', () => { MR.cart = []; mrSave(); mrBadge(); mrDrawCart(); });

        draw();
    }

    function mrFlash(btn) {
        btn.classList.add('ok');
        const was = btn.textContent;
        btn.textContent = 'added \u2713';
        setTimeout(() => { btn.classList.remove('ok'); btn.textContent = was; }, 900);
    }


    function renderAbout() {
        const data = window.CATALOG;
        if (!data) return;
        const s = data.stats || {};
        const years = s.firstYear ? (new Date().getFullYear() - +s.firstYear) || 1 : '';

        const info = $('#sysInfo');
        if (info) {
            const tracks = data.tracks || [];
            const ms = tracks.reduce((n, t) => n + (t.durationMs || 0), 0);
            const mins = Math.round(ms / 60000);
            const runtime = mins ? (mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`) : '';

            // only render figures we actually have; blanks stay out of the panel
            const cells = [
                ['streams', s.streams], ['total followers', s.followers],
                ['tracks', s.trackCount], ['releases', s.releaseCount],
                ['runtime', runtime], ['monthly', s.monthlyListeners],
                ['top track', s.topTrack], ['shows', s.showsPlayed],
                ['active', years ? years + (years === 1 ? ' yr' : ' yrs') : ''],
                ['since', s.firstYear], ['latest', s.latestYear]
            ].filter(([, v]) => v !== '' && v != null);
            info.innerHTML = cells.map(([k, v]) =>
                `<div class="si-cell"><span class="si-val">${esc(v)}</span><span class="si-key">${esc(k)}</span></div>`
            ).join('');
        }

        const grid = $('#discoGrid');
        if (grid) {
            grid.innerHTML = (data.releases || []).map(r => `
                <div class="disco-item">
                    <button class="disco-face" type="button" aria-expanded="false">
                        <img src="${esc(r.art)}" alt="${esc(r.title)} cover" loading="lazy">
                        <span class="disco-pick"><i class="fas fa-play"></i> listen</span>
                    </button>
                    <span class="disco-title">${esc(r.title)}</span>
                    <span class="disco-meta">${esc(r.kind)} \u00b7 ${esc(r.year)}</span>
                    <div class="disco-links" hidden>
                        <a href="${esc(r.appleUrl)}" target="_blank" rel="noopener"><i class="fab fa-apple"></i> Apple Music</a>
                        <a href="${esc(r.spotifyUrl)}" target="_blank" rel="noopener"><i class="fab fa-spotify"></i> Spotify</a>
                    </div>
                </div>`).join('');
            $$('.disco-face', grid).forEach(face => face.addEventListener('click', () => {
                const item = face.closest('.disco-item'), links = $('.disco-links', item);
                const open = links.hidden;
                $$('.disco-links', grid).forEach(l => { l.hidden = true; });
                $$('.disco-face', grid).forEach(f => f.setAttribute('aria-expanded', 'false'));
                links.hidden = !open;
                face.setAttribute('aria-expanded', String(open));
            }));
        }
    }

    /* ============================================================
       FILES — GUI over the terminal's filesystem. It never holds its
       own copy of the tree or its own idea of permissions; both come
       from the ALTERTERM bridge, so root is earned at the prompt only.
       ============================================================ */
    const FB = { path: '/home/jones', grid: true, elev: false };
    const fbFS = () => (window.ALTERTERM && window.ALTERTERM.fs) || null;
    // root's home is /root; jones's is /home/jones
    const fbHome = () => {
        const fs = fbFS();
        return fs && fs.elevated() ? '/root' : '/home/jones';
    };

    /* ── notepad ──────────────────────────────────────────────────────
       A GUI front end on the same storage the terminal editors use, so a
       note written in nano shows up here and vice versa. */
    const NP = { path: null };
    const npAPI = () => window.ALTERTERM && window.ALTERTERM.notes;

    function npStatus(msg, bad) {
        const el = $('#npStatus');
        if (!el) return;
        el.textContent = msg || '';
        el.classList.toggle('bad', !!bad);
    }

    function npRenderList() {
        const api = npAPI(), ul = $('#npList');
        if (!api || !ul) return;
        const files = api.list();
        if (!files.length) {
            ul.innerHTML = '<li class="np-empty">no files yet</li>';
            return;
        }
        ul.innerHTML = files.map(p => {
            const name = p.slice(p.lastIndexOf('/') + 1);
            const dir = p.slice(0, p.lastIndexOf('/'));
            const on = p === NP.path ? ' on' : '';
            return `<li class="np-item${on}" data-path="${esc(p)}">` +
                `<i class="fas fa-file-alt"></i>` +
                `<span class="np-item-name">${esc(name)}</span>` +
                `<span class="np-item-dir">${esc(dir)}</span></li>`;
        }).join('');
    }

    function npOpen(path) {
        const api = npAPI();
        if (!api) return;
        const body = api.read(path);
        if (body == null) return;
        NP.path = path;
        $('#npName').value = path;
        $('#npArea').value = body;
        npRenderList();
        npStatus(`${body.split('\n').length} lines`);
    }

    function npNew() {
        const api = npAPI();
        NP.path = null;
        $('#npName').value = (api ? api.home : '/home/jones') + '/';
        $('#npArea').value = '';
        npRenderList();
        npStatus('');
        $('#npName').focus();
    }

    function npSave() {
        const api = npAPI();
        if (!api) return npStatus('filesystem unavailable', true);
        let path = $('#npName').value.trim();
        if (!path || path.endsWith('/')) return npStatus('name the file first', true);
        if (!path.startsWith('/')) path = api.home + '/' + path;
        // renaming means the old file should go away
        const old = NP.path;
        const err = api.write(path, $('#npArea').value);
        if (err) return npStatus(`${path}: ${err}`, true);
        if (old && old !== path) api.remove(old);
        NP.path = path;
        $('#npName').value = path;
        npRenderList();
        npStatus(`saved ${path}`);
    }

    function npDelete() {
        const api = npAPI();
        if (!api || !NP.path) return npStatus('nothing to delete', true);
        const gone = NP.path;
        if (api.remove(gone)) return npStatus('cannot delete that', true);
        npNew();
        npStatus(`deleted ${gone}`);
    }

    function initNotepad() {
        if (!$('#npArea')) return;
        $('#npNew').addEventListener('click', npNew);
        $('#npSave').addEventListener('click', npSave);
        $('#npDel').addEventListener('click', npDelete);
        $('#npList').addEventListener('click', (e) => {
            const li = e.target.closest('.np-item');
            if (li) npOpen(li.dataset.path);
        });
        $('#npArea').addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); npSave(); }
            if (e.key === 'Tab') {
                e.preventDefault();
                const a = e.target, p = a.selectionStart;
                a.value = a.value.slice(0, p) + '    ' + a.value.slice(a.selectionEnd);
                a.setSelectionRange(p + 4, p + 4);
            }
        });
        // the list can change from under us while the terminal is in use
        $('#win-notepad')?.addEventListener('mouseenter', npRenderList);
        npNew();
    }

    function initFiles() {
        if (!$('#fbBody')) return;
        $('#fbUp')?.addEventListener('click', () => {
            const p = FB.path.replace(/\/[^/]*$/, '');
            fbGo(p || '/');
        });
        $('#fbHome')?.addEventListener('click', () => fbGo(fbHome()));
        $('#fbView')?.addEventListener('click', () => { FB.grid = !FB.grid; fbRender(); });
        $('#fbViewerClose')?.addEventListener('click', fbCloseViewer);
        $('#fbViewer')?.addEventListener('click', (e) => {
            if (e.target.id === 'fbViewer') fbCloseViewer();
        });
    }

    const fbGo = (p) => { FB.path = p; fbRender(); };

    function fbRender() {
        const body = $('#fbBody'), crumbs = $('#fbCrumbs'), status = $('#fbStatus');
        const fs = fbFS();
        if (!body) return;
        if (!fs) {
            body.innerHTML = '<p class="fb-msg">filesystem unavailable.</p>';
            return;
        }

        const parts = FB.path.split('/').filter(Boolean);
        crumbs.innerHTML = `<button class="fb-crumb" data-p="/">/</button>` +
            parts.map((seg, i) => {
                const p = '/' + parts.slice(0, i + 1).join('/');
                return `<button class="fb-crumb" data-p="${esc(p)}">${esc(seg)}</button>`;
            }).join('<span class="fb-sep">/</span>');
        $$('.fb-crumb', crumbs).forEach(b => b.addEventListener('click', () => fbGo(b.dataset.p)));

        const res = fs.list(FB.path);
        if (res.error === 'denied') {
            body.innerHTML = '<div class="fb-msg fb-denied">' +
                '<i class="fas fa-lock"></i>' +
                '<p>permission denied</p>' +
                '<p class="fb-msg-sub">this path answers to root alone. open the Terminal, ' +
                'run <code>sudo</code>, then reopen Files.</p></div>';
            status.textContent = FB.path + ' — denied';
            return;
        }
        if (res.error) {
            body.innerHTML = '<p class="fb-msg">no such directory.</p>';
            status.textContent = FB.path;
            return;
        }

        body.className = 'fb-body ' + (FB.grid ? 'is-grid' : 'is-list');
        if (!res.entries.length) {
            body.innerHTML = '<p class="fb-msg">this folder is empty.</p>';
            status.textContent = FB.path + ' — 0 items';
            return;
        }

        body.innerHTML = res.entries.map(e => {
            const icon = e.denied ? 'fa-lock' : e.dir ? 'fa-folder'
                : e.img ? 'fa-image' : e.bin ? 'fa-file-code' : 'fa-file-alt';
            const thumb = e.img
                ? `<span class="fb-thumb" data-draw="${esc(e.draw)}">`
                  + (e.url ? `<img src="${esc(e.url)}" alt="" loading="lazy">` : '')
                  + '</span>'
                : `<i class="fas ${icon} fb-icon"></i>`;
            return `<button class="fb-item${e.denied ? ' is-denied' : ''}${e.img ? ' is-img' : ''}"
                        data-name="${esc(e.name)}" data-dir="${e.dir}" data-denied="${e.denied}">
                    ${thumb}
                    <span class="fb-name">${esc(e.name)}</span>
                    <span class="fb-meta">${e.dir ? '—' : fbSize(e.size)}</span>
                </button>`;
        }).join('');

        // hexagram thumbnails have no source image; they're drawn
        $$('.fb-thumb[data-draw]', body).forEach(sp => {
            if (sp.dataset.draw) fbDrawSigil(sp, sp.dataset.draw);
        });
        $$('.fb-item', body).forEach(btn => btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            const next = (FB.path === '/' ? '' : FB.path) + '/' + name;
            if (btn.dataset.denied === 'true') return fbDenied(name);
            if (btn.dataset.dir === 'true') return fbGo(next);
            fbOpen(next, name);
        }));
        status.textContent = `${FB.path} — ${res.entries.length} item${res.entries.length === 1 ? '' : 's'}`
            + (fs.elevated() ? '  ·  root' : '');
    }

    const fbSize = (n) => n >= 1048576 ? (n / 1048576).toFixed(1) + 'M'
        : n >= 1024 ? Math.round(n / 1024) + 'K' : n + 'B';

    function fbDenied(name) {
        const v = $('#fbViewer'), inner = $('#fbViewerInner');
        inner.innerHTML = '<div class="fb-msg fb-denied"><i class="fas fa-lock"></i>' +
            '<p>permission denied</p><p class="fb-msg-sub">open the Terminal, run ' +
            '<code>sudo</code>, then reopen Files.</p></div>';
        fbSetDownload(null);
        $('#fbViewerName').textContent = name;
        v.hidden = false;
    }

    async function fbOpen(path, name) {
        const fs = fbFS();
        const res = await fs.read(path);
        const inner = $('#fbViewerInner');
        let dl = null;                       // {href, name} once we know what to offer
        if (res.error === 'denied') return fbDenied(name);
        if (res.error) {
            inner.innerHTML = '<p class="fb-msg">cannot open this item.</p>';
        } else if (res.binary) {
            if (/\.pdf$/i.test(name) && res.url) {
                // render in place rather than handing the file straight to the browser
                inner.innerHTML = `<iframe class="fb-pdf" src="${esc(res.url)}#view=FitH"`
                    + ` title="${esc(name)}"></iframe>`;
                dl = { href: res.url, name };
            } else if (res.url) {
                inner.innerHTML = '<div class="fb-art">'
                    + `<img src="${esc(res.url)}" alt="${esc(name)}"></div>`;
                dl = { href: res.url, name };
            } else if (res.draw) {
                inner.innerHTML = '<canvas class="fb-canvas" width="420" height="420"></canvas>';
                fbDrawSigil(inner, res.draw, 420);
                const c = inner.querySelector('canvas');
                if (c) dl = { href: c.toDataURL('image/png'), name };
            } else {
                inner.innerHTML = `<p class="fb-msg">${esc(res.desc || 'binary file')}</p>`;
            }
        } else {
            const text = res.text || '';
            inner.innerHTML = `<pre class="fb-text">${esc(text)}</pre>`;
            dl = { href: URL.createObjectURL(new Blob([text], { type: 'text/plain' })), name };
        }
        fbSetDownload(dl);
        $('#fbViewerName').textContent = name;
        $('#fbViewer').hidden = false;
    }

    function fbSetDownload(dl) {
        const a = $('#fbViewerDl');
        if (!a) return;
        if (FB.blob) { URL.revokeObjectURL(FB.blob); FB.blob = null; }
        if (!dl) { a.hidden = true; a.removeAttribute('href'); return; }
        if (dl.href.startsWith('blob:')) FB.blob = dl.href;
        a.href = dl.href;
        a.setAttribute('download', dl.name);
        a.hidden = false;
    }

    const fbCloseViewer = () => {
        $('#fbViewer').hidden = true;
        $('#fbViewerInner').innerHTML = '';
        fbSetDownload(null);
    };

    // reuse the visualizer's sigil geometry so the art matches what floats in the bars
    function fbDrawSigil(host, kind, size) {
        let c = host.querySelector('canvas');
        if (!c) {
            c = document.createElement('canvas');
            c.width = c.height = size || 64;
            host.appendChild(c);
        }
        const ctx = c.getContext('2d');
        const r = c.width * 0.36;
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.lineWidth = Math.max(1.5, c.width / 90);
        ctx.strokeStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--neon').trim() || '#00f0ff';
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = c.width / 14;
        sigilPath(ctx, kind, c.width / 2, c.height / 2, r, 0);
        ctx.stroke();
    }

    function unlockAngel(angel) {
        const a = String(angel || '').toLowerCase();
        if (!ANGELS[a]) return false;
        const fresh = !unlocked.has(a);
        unlocked.add(a);
        saveUnlocked();
        setTheme(ANGELS[a].theme);
        refreshSigils();
        refreshTemples();
        refreshVault();
        refreshSettings();
        return fresh;
    }

    /* ============================================================
       SETTINGS
       ============================================================ */
    const GAME_KEYS = [LS.unlocked, LS.theme, 'alter_game'];

    function refreshSettings() {
        const stats = $('#setStats');
        if (!stats) return;
        const names = Object.keys(ANGELS);
        const seals = names.filter(a => unlocked.has(a)).length;
        const demos = DEMOS.filter(d => unlocked.has(d.angel)).length;
        const sessions = (window.ALTERGAME ? window.ALTERGAME.sessions().length : 0);
        stats.innerHTML = `
            <div class="set-stat"><span class="set-k">seals broken</span><span class="set-v">${seals} / ${names.length}</span></div>
            <div class="set-stat"><span class="set-k">demos unlocked</span><span class="set-v">${demos} / ${DEMOS.length}</span></div>
            <div class="set-stat"><span class="set-k">open sessions</span><span class="set-v">${sessions}</span></div>
            <div class="set-stat"><span class="set-k">sigils</span><span class="set-v">${
                names.map(a => `<i class="set-sig ${unlocked.has(a) ? 'on c-' + a : ''}">\u25CE</i>`).join('')
            }</span></div>`;
    }

    // two-step confirmation so progress can't be wiped by a stray click
    function initSettings() {
        const zone = $('#setDanger');
        if (!zone) return;
        const idle = zone.innerHTML;

        const render = (html) => { zone.innerHTML = html; wire(); };
        const toIdle = () => render(idle);

        function wire() {
            $('#resetStep1', zone)?.addEventListener('click', () => render(`
                <div class="set-confirm">
                    <p class="set-warn"><i class="fas fa-triangle-exclamation"></i> Are you sure? All four temples will reseal and every unlocked demo will be locked again.</p>
                    <div class="set-row">
                        <button class="set-btn danger" id="resetStep2">Yes, continue</button>
                        <button class="set-btn" id="resetCancel">Cancel</button>
                    </div>
                </div>`));

            $('#resetStep2', zone)?.addEventListener('click', () => render(`
                <div class="set-confirm final">
                    <p class="set-warn"><i class="fas fa-skull"></i> Final confirmation &mdash; this is permanent and cannot be undone.</p>
                    <div class="set-row">
                        <button class="set-btn danger" id="resetFinal">Wipe my progress</button>
                        <button class="set-btn" id="resetCancel">Cancel</button>
                    </div>
                </div>`));

            $('#resetFinal', zone)?.addEventListener('click', () => {
                GAME_KEYS.forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
                render(`<p class="set-done"><i class="fas fa-check"></i> Progress wiped. Reloading&hellip;</p>`);
                setTimeout(() => location.reload(), 900);
            });

            $('#resetCancel', zone)?.addEventListener('click', toIdle);
        }
        wire();
    }

    /* ============================================================
       MOBILE
       ============================================================ */
    const altarHostMarker = document.createComment('altar-host');
    function isMobileView() {
        return window.matchMedia('(max-width: 820px)').matches ||
               (('ontouchstart' in window) && window.innerWidth <= 900);
    }
    function applyMode() {
        const mobile = isMobileView();
        document.body.classList.toggle('is-mobile', mobile);
        const stage = $('#altarStage'), phoneLock = $('#phoneLock'), desktop = $('#desktop');
        if (!stage) return;
        if (mobile) {
            if (stage.parentNode !== phoneLock) {
                stage.parentNode.insertBefore(altarHostMarker, stage);
                phoneLock.appendChild(stage);
            }
        } else {
            if (altarHostMarker.parentNode) {
                altarHostMarker.parentNode.insertBefore(stage, altarHostMarker);
                altarHostMarker.remove();
            }
        }
        fitAltar();
    }

    // shrink the altar on phones so at least 3 rows of apps stay on screen
    // (2 rows is acceptable on very short viewports)
    const SIGIL_BAR = 62;        // theme switcher pinned under the altar
    function fitAltar() {
        const altar = $('#altar'), lock = $('#phoneLock'), grid = $('#phoneGrid');
        if (!altar || !lock) return;
        if (!document.body.classList.contains('is-mobile')) {
            altar.style.transform = ''; altar.style.transformOrigin = '';
            lock.style.height = '';
            return;
        }
        altar.style.transform = '';                       // measure unscaled
        const natural = altar.getBoundingClientRect().height || 394;
        const app = grid && grid.querySelector('.phone-app');
        const rowH = app ? app.getBoundingClientRect().height : 81;
        const rows = window.innerHeight < 620 ? 2 : 3;
        const gridNeed = rows * rowH + (rows - 1) * 20 + 26;   // gaps + grid padding
        const chrome = ($('#phoneStatus')?.offsetHeight || 37)
                     + ($('#phoneDock')?.offsetHeight || 84) + 34;   // + home indicator
        const avail = window.innerHeight - chrome - gridNeed - SIGIL_BAR;
        const s = Math.max(.28, Math.min(1, avail / natural));
        altar.style.transformOrigin = 'center top';
        altar.style.transform = `scale(${s.toFixed(3)})`;
        lock.style.height = Math.round(natural * s + SIGIL_BAR) + 'px';
    }

    /* ============================================================
       PUBLIC API (used by terminal.js)
       ============================================================ */
    window.ALTER = {
        openApp, closeApp,
        setTheme, resetTheme, unlockAngel,
        isUnlocked: (a) => unlocked.has(String(a).toLowerCase()),
        unlockedList: () => [...unlocked],
        angels: ANGELS
    };

    /* ============================================================
       INIT
       ============================================================ */
    document.addEventListener('DOMContentLoaded', function () {
        runBoot();
        tickClock(); setInterval(tickClock, 15000);
        initWindows();
        buildLaunchers();
        initStart();
        initAltar();
        setDockActive();

        // restore theme + unlocked
        try {
            const t = localStorage.getItem(LS.theme);
            if (t && t !== 'default') document.documentElement.setAttribute('data-theme', t);
            updateNemo(t || 'default');
        } catch (e) {}
        refreshSigils(); refreshTemples(); refreshVault();
        initCatalog();
        renderAbout();
        renderMerch();
        initFiles();
        initNotepad();
        refreshCatalog();
        initVizFull();
        initDesktopSigils();
        initPanelSigils();
        initSettings();
        initYouTubeBridge();
        $('#homeIndicator')?.addEventListener('click', goHome);

        $('#themeReset')?.addEventListener('click', resetTheme);

        applyMode();
        window.addEventListener('resize', applyMode);

        // deep link: /?app=events
        try {
            const want = new URLSearchParams(location.search).get('app');
            if (want && APPS.some(a => a.id === want)) setTimeout(() => openApp(want), 900);
        } catch (e) {}
    });

})();
