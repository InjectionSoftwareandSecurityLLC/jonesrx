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
        { id: 'temples',  name: 'Temples',  icon: 'fa-crosshairs' },
        { id: 'exploit',  name: 'Exploit',  icon: 'fa-bug' },
        { id: 'sessions', name: 'Sessions', icon: 'fa-network-wired' },
        { id: 'settings', name: 'Settings', icon: 'fa-sliders-h' },
        { id: 'merch',    name: 'Merch',    icon: 'fa-tshirt', url: 'https://sweltersounds.com/collections/jones' }
    ];
    const PHONE_DOCK = ['tracks', 'videos', 'terminal', 'social'];

    // Raphael unlocks 1, Michael 2, Gabriel 3, Uriel 3 (9 total)
    // tracks are stored base64-encoded (.b64) and decoded to a Blob at play time
    const DEMOS = [
        { name: 'ALTER — Demo 1', file: 'assets/tracks/demo-01.b64', angel: 'raphael' },
        { name: 'ALTER — Demo 2', file: 'assets/tracks/demo-02.b64', angel: 'michael' },
        { name: 'ALTER — Demo 3', file: 'assets/tracks/demo-03.b64', angel: 'michael' },
        { name: 'ALTER — Demo 4', file: 'assets/tracks/demo-04.b64', angel: 'gabriel' },
        { name: 'ALTER — Demo 5', file: 'assets/tracks/demo-05.b64', angel: 'gabriel' },
        { name: 'ALTER — Demo 6', file: 'assets/tracks/demo-06.b64', angel: 'gabriel' },
        { name: 'ALTER — Demo 7', file: 'assets/tracks/demo-07.b64', angel: 'uriel' },
        { name: 'ALTER — Demo 8', file: 'assets/tracks/demo-08.b64', angel: 'uriel' },
        { name: 'ALTER — Demo 9', file: 'assets/tracks/demo-09.b64', angel: 'uriel' }
    ];

    const LS = { unlocked: 'alter_unlocked', theme: 'alter_theme' };

    // set a URL here to make the chest's "nemo" a clickable portal while the white theme is active
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
        if ((id === 'exploit' || id === 'sessions') && window.ALTERGAME) window.ALTERGAME.render();
        if (id === 'settings') refreshSettings();
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
    function saveDock(dock) {
        try {
            localStorage.setItem('alter_dock', JSON.stringify({
                left: dock.style.left, top: dock.style.top, orient: dock.dataset.orient
            }));
        } catch (e) {}
    }
    function restoreDock(dock) {
        try {
            const d = JSON.parse(localStorage.getItem('alter_dock') || 'null');
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

    function refreshVault() {
        const vault = $('#demoVault'), list = $('#demoList'), msg = $('#vaultMsg');
        if (!vault || !list) return;
        const count = DEMOS.filter(d => unlocked.has(d.angel)).length;
        vault.dataset.unlocked = String(count);
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
                    <audio controls preload="none" style="display:none"></audio>`;
                const btn = $('.demo-load', row), audio = $('audio', row);
                btn.addEventListener('click', () => streamDemo(d.file, audio, btn));
            } else {
                const label = ANGELS[d.angel] ? ANGELS[d.angel].label : d.angel;
                row.innerHTML = `<i class="fas fa-lock"></i><span class="demo-name">${d.name}</span>
                    <span class="dim">sealed — invoke ${label}</span>`;
            }
            list.appendChild(row);
        });
    }

    // decode a base64-encoded track into an in-memory Blob and stream it
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
            audio.style.display = '';
            btn.remove();
            audio.play().catch(() => {});
        } catch (e) {
            btn.disabled = false; btn.textContent = 'unavailable';
        }
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
        initDesktopSigils();
        initPanelSigils();
        initSettings();
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
