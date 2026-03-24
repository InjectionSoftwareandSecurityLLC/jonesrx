// Videos page: dropdown colors, nav transitions, YouTube API carousel

// ── Replace with your YouTube Data API v3 key ──
const YT_API_KEY = 'AIzaSyD97_O89-D8OkqrG66ogYcLHdP0okZQZ7E';

const PLAYLIST_IDS = [
    'PLtIJ0xxvR3k_L8mB-h4sRKBoV-3YVkQ77',
    'PLtIJ0xxvR3k9s6VvNn71iR4sA9WMBzOwb',
    'PLtIJ0xxvR3k9ItTNqCuLJimV_SMTiuAYj'
];

// ── Nav styling ──
styleDropdown('ddSpotify', 'green');
styleDropdown('ddAppleMusic', 'pink');
styleDropdown('ddTiktok', 'white');
styleDropdown('ddInsta', 'yellow');
styleDropdown('ddYouTube', 'red');
styleDropdown('ddFacebook', 'blue');

setupTvTransition('home-button', '/index.html');
setupTvTransition('about-button', '/about.html');
setupTvTransition('events-button', '/events.html');

// ── State ──
let allVideos = [];
let currentIndex = 0;
let carouselOffset = 0;

// ── Fetch all playlist items ──
async function fetchPlaylistItems(playlistId) {
    const items = [];
    let pageToken = '';
    do {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?` +
            `part=snippet&maxResults=50&playlistId=${encodeURIComponent(playlistId)}` +
            `&key=${encodeURIComponent(YT_API_KEY)}` +
            (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : '');
        const res = await fetch(url);
        if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
        const data = await res.json();
        for (const item of data.items) {
            const s = item.snippet;
            if (s.resourceId.kind !== 'youtube#video') continue;
            items.push({
                videoId: s.resourceId.videoId,
                title: s.title,
                thumbnail: (s.thumbnails.medium || s.thumbnails.default).url,
                publishedAt: s.publishedAt
            });
        }
        pageToken = data.nextPageToken || '';
    } while (pageToken);
    return items;
}

// ── Fetch actual upload dates from the Videos endpoint ──
async function fetchVideoDetails(videoIds) {
    const details = new Map();
    // API allows up to 50 IDs per request
    for (let i = 0; i < videoIds.length; i += 50) {
        const batch = videoIds.slice(i, i + 50);
        const url = `https://www.googleapis.com/youtube/v3/videos?` +
            `part=snippet&id=${batch.map(encodeURIComponent).join(',')}` +
            `&key=${encodeURIComponent(YT_API_KEY)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
        const data = await res.json();
        for (const item of data.items) {
            details.set(item.id, item.snippet.publishedAt);
        }
    }
    return details;
}

async function loadVideos() {
    const section = document.querySelector('.videos-section');
    section.innerHTML = `
        <div class="neon-loader">
            <div class="loader-eq">
                <div class="loader-eq-bar"></div>
                <div class="loader-eq-bar"></div>
                <div class="loader-eq-bar"></div>
                <div class="loader-eq-bar"></div>
                <div class="loader-eq-bar"></div>
                <div class="loader-eq-bar"></div>
                <div class="loader-eq-bar"></div>
            </div>
            <div class="loader-bar-track"><div class="loader-bar-fill"></div></div>
            <span class="loader-text">LOADING</span>
        </div>
    `;

    try {
        const results = await Promise.all(PLAYLIST_IDS.map(fetchPlaylistItems));
        const merged = results.flat();

        // Deduplicate by videoId
        const seen = new Set();
        allVideos = [];
        for (const v of merged) {
            if (!seen.has(v.videoId)) {
                seen.add(v.videoId);
                allVideos.push(v);
            }
        }

        // Fetch real upload dates (playlist publishedAt is when added to playlist)
        const realDates = await fetchVideoDetails(allVideos.map(v => v.videoId));
        for (const v of allVideos) {
            if (realDates.has(v.videoId)) {
                v.publishedAt = realDates.get(v.videoId);
            }
        }

        // Sort newest first by actual upload date
        allVideos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

        if (allVideos.length === 0) {
            section.innerHTML = '<p class="videos-error">No videos found.</p>';
            return;
        }

        buildUI(section);
        playVideo(0);
    } catch (err) {
        console.error('Failed to load videos:', err);
        section.innerHTML = '<p class="videos-error">Failed to load videos.</p>';
    }
}

// ── Build DOM ──
function buildUI(container) {
    container.innerHTML = `
        <div class="video-player-wrapper">
            <iframe id="ytPlayer" allowfullscreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
            </iframe>
        </div>
        <p class="now-playing-title" id="nowPlaying"></p>
        <div class="video-carousel">
            <button class="carousel-btn prev" id="carPrev" aria-label="Scroll left">&#10094;</button>
            <div class="carousel-track-wrapper">
                <div class="carousel-track" id="carTrack"></div>
            </div>
            <button class="carousel-btn next" id="carNext" aria-label="Scroll right">&#10095;</button>
        </div>
    `;

    const track = document.getElementById('carTrack');
    allVideos.forEach((v, i) => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.dataset.index = i;
        card.innerHTML = `
            <img class="video-card-thumb" src="${v.thumbnail}" alt="${escapeAttr(v.title)}" loading="lazy">
            <div class="video-card-info">
                <p class="video-card-title">${escapeHTML(v.title)}</p>
                <p class="video-card-date">${formatDate(v.publishedAt)}</p>
            </div>
        `;
        card.addEventListener('click', () => playVideo(i));
        track.appendChild(card);
    });

    document.getElementById('carPrev').addEventListener('click', () => scrollCarousel(-1));
    document.getElementById('carNext').addEventListener('click', () => scrollCarousel(1));
}

// ── Play a video ──
function playVideo(index) {
    if (index < 0 || index >= allVideos.length) return;
    currentIndex = index;
    const v = allVideos[index];

    document.getElementById('ytPlayer').src =
        `https://www.youtube.com/embed/${encodeURIComponent(v.videoId)}?autoplay=1&rel=0`;
    document.getElementById('nowPlaying').textContent = v.title;

    // Highlight active card
    document.querySelectorAll('.video-card').forEach((c, i) => {
        c.classList.toggle('active', i === index);
    });

    // Scroll carousel to show active card
    scrollToCard(index);
}

// ── Carousel scrolling ──
function scrollCarousel(direction) {
    const track = document.getElementById('carTrack');
    const wrapper = track.parentElement;
    const cardWidth = track.children[0] ? track.children[0].offsetWidth + 15 : 235;
    const visibleCards = Math.floor(wrapper.offsetWidth / cardWidth);
    const maxOffset = Math.max(0, allVideos.length - visibleCards);

    carouselOffset = Math.max(0, Math.min(maxOffset, carouselOffset + direction * visibleCards));
    track.style.transform = `translateX(-${carouselOffset * cardWidth}px)`;
}

function scrollToCard(index) {
    const track = document.getElementById('carTrack');
    const wrapper = track.parentElement;
    const cardWidth = track.children[0] ? track.children[0].offsetWidth + 15 : 235;
    const visibleCards = Math.floor(wrapper.offsetWidth / cardWidth);

    if (index < carouselOffset) {
        carouselOffset = index;
    } else if (index >= carouselOffset + visibleCards) {
        carouselOffset = index - visibleCards + 1;
    }
    track.style.transform = `translateX(-${carouselOffset * cardWidth}px)`;
}

// ── Helpers ──
function escapeHTML(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatDate(isoStr) {
    const d = new Date(isoStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Keyboard nav ──
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') playVideo(currentIndex + 1);
    else if (e.key === 'ArrowLeft') playVideo(currentIndex - 1);
});

// ── Init ──
loadVideos();
