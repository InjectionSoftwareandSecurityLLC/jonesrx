// Events page: dropdown colors, nav transitions, Bandsintown API
styleDropdown('ddSpotify', 'green');
styleDropdown('ddAppleMusic', 'pink');
styleDropdown('ddSoundCloud', 'orange');
styleDropdown('ddTiktok', 'white');
styleDropdown('ddInsta', 'yellow');
styleDropdown('ddYouTube', 'red');
styleDropdown('ddFacebook', 'blue');

setupTvTransition('home-button', '/index.html');
setupTvTransition('videos-button', '/videos.html');

/* ── Bandsintown ──────────────────────────────────────────────────────
   Look up by artist id, not name: the name endpoint serves a stale cache
   that misses newly added shows and reports outdated venue names.
   One call with date=all, split into upcoming and played locally.     */
const BIT_ARTIST = 'id_15564526';
const BIT_APP_ID = '26113258b4b0ab3265bf61cdb27edeab';

// promoter pages that should win over the Bandsintown link. Keyed on date:
// a listing gets renamed, a show's date does not.
const EVENT_LINKS = {
    '2026-04-22': 'https://bridgingmusic.com/event/atlanta-minifest-4-22-26/',
    '2026-05-06': 'https://bridgingmusic.com/event/austin-minifest-5-6-26/'
};

// layout sampler, shown only with ?demoevents=1 — never for a normal visitor
const DEMO_EVENTS = [
    { datetime: new Date(Date.now() + 864e5 * 12).toISOString().slice(0, 19),
      url: 'https://www.bandsintown.com/a/15564526',
      venue: { name: 'The Masquerade \u2014 Hell', location: 'Atlanta, GA', country: 'United States' } },
    { datetime: new Date(Date.now() + 864e5 * 47).toISOString().slice(0, 19),
      url: 'https://www.bandsintown.com/a/15564526',
      venue: { name: 'Hi-Tone', location: 'Memphis, TN', country: 'United States' } },
    // no url: exercises the "announced" state
    { datetime: new Date(Date.now() + 864e5 * 96).toISOString().slice(0, 19), url: '',
      venue: { name: 'Lost Lake Lounge', location: 'Denver, CO', country: 'United States' } }
];

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// how many played shows to reveal before the expander
const PLAYED_VISIBLE = 4;

/* Bandsintown sends venue-local wall time with no offset ("2026-04-22T18:00:00"),
   and no timezone field — so the clock is already correct and must NOT be
   converted; it only needs the right label. Zones come from the state, with a
   longitude check for the states that straddle two of them. */
const STATE_TZ = {
    AL: 'America/Chicago', AK: 'America/Anchorage', AZ: 'America/Phoenix', AR: 'America/Chicago',
    CA: 'America/Los_Angeles', CO: 'America/Denver', CT: 'America/New_York', DC: 'America/New_York',
    DE: 'America/New_York', FL: 'America/New_York', GA: 'America/New_York', HI: 'Pacific/Honolulu',
    IA: 'America/Chicago', ID: 'America/Boise', IL: 'America/Chicago',
    IN: 'America/Indiana/Indianapolis', KS: 'America/Chicago', KY: 'America/New_York',
    LA: 'America/Chicago', MA: 'America/New_York', MD: 'America/New_York', ME: 'America/New_York',
    MI: 'America/Detroit', MN: 'America/Chicago', MO: 'America/Chicago', MS: 'America/Chicago',
    MT: 'America/Denver', NC: 'America/New_York', ND: 'America/Chicago', NE: 'America/Chicago',
    NH: 'America/New_York', NJ: 'America/New_York', NM: 'America/Denver', NV: 'America/Los_Angeles',
    NY: 'America/New_York', OH: 'America/New_York', OK: 'America/Chicago', OR: 'America/Los_Angeles',
    PA: 'America/New_York', RI: 'America/New_York', SC: 'America/New_York', SD: 'America/Chicago',
    TN: 'America/Chicago', TX: 'America/Chicago', UT: 'America/Denver', VA: 'America/New_York',
    VT: 'America/New_York', WA: 'America/Los_Angeles', WI: 'America/Chicago',
    WV: 'America/New_York', WY: 'America/Denver'
};
const STATE_NAMES = {
    ALABAMA: 'AL', ALASKA: 'AK', ARIZONA: 'AZ', ARKANSAS: 'AR', CALIFORNIA: 'CA', COLORADO: 'CO',
    CONNECTICUT: 'CT', DELAWARE: 'DE', FLORIDA: 'FL', GEORGIA: 'GA', HAWAII: 'HI', IDAHO: 'ID',
    ILLINOIS: 'IL', INDIANA: 'IN', IOWA: 'IA', KANSAS: 'KS', KENTUCKY: 'KY', LOUISIANA: 'LA',
    MAINE: 'ME', MARYLAND: 'MD', MASSACHUSETTS: 'MA', MICHIGAN: 'MI', MINNESOTA: 'MN',
    MISSISSIPPI: 'MS', MISSOURI: 'MO', MONTANA: 'MT', NEBRASKA: 'NE', NEVADA: 'NV',
    'NEW HAMPSHIRE': 'NH', 'NEW JERSEY': 'NJ', 'NEW MEXICO': 'NM', 'NEW YORK': 'NY',
    'NORTH CAROLINA': 'NC', 'NORTH DAKOTA': 'ND', OHIO: 'OH', OKLAHOMA: 'OK', OREGON: 'OR',
    PENNSYLVANIA: 'PA', 'RHODE ISLAND': 'RI', 'SOUTH CAROLINA': 'SC', 'SOUTH DAKOTA': 'SD',
    TENNESSEE: 'TN', TEXAS: 'TX', UTAH: 'UT', VERMONT: 'VT', VIRGINIA: 'VA', WASHINGTON: 'WA',
    'WEST VIRGINIA': 'WV', WISCONSIN: 'WI', WYOMING: 'WY', 'DISTRICT OF COLUMBIA': 'DC'
};
// states split across zones: longitude decides
const TZ_SPLITS = {
    FL: (lon) => (lon < -85.0 ? 'America/Chicago' : 'America/New_York'),
    TX: (lon) => (lon < -105.0 ? 'America/Denver' : 'America/Chicago'),
    TN: (lon) => (lon > -85.6 ? 'America/New_York' : 'America/Chicago'),
    KY: (lon) => (lon < -85.6 ? 'America/Chicago' : 'America/New_York'),
    IN: (lon) => (lon < -87.3 ? 'America/Chicago' : 'America/Indiana/Indianapolis'),
    MI: (lon) => (lon < -87.0 ? 'America/Chicago' : 'America/Detroit'),
    KS: (lon) => (lon < -101.5 ? 'America/Denver' : 'America/Chicago'),
    NE: (lon) => (lon < -101.5 ? 'America/Denver' : 'America/Chicago'),
    ND: (lon) => (lon < -100.8 ? 'America/Denver' : 'America/Chicago'),
    SD: (lon) => (lon < -100.3 ? 'America/Denver' : 'America/Chicago')
};

function venueZone(venue) {
    const country = String((venue || {}).country || '').trim().toUpperCase();
    if (country && country !== 'UNITED STATES' && country !== 'US' && country !== 'USA') return null;
    const raw = String((venue || {}).region || '').trim().toUpperCase();
    const code = STATE_TZ[raw] ? raw : STATE_NAMES[raw];
    if (!code) return null;
    const lon = Number((venue || {}).longitude);
    if (TZ_SPLITS[code] && isFinite(lon)) return TZ_SPLITS[code](lon);
    return STATE_TZ[code] || null;
}

// the abbreviation is date-sensitive (EST vs EDT), so resolve it on the show's own date
function zoneAbbr(zone, y, mo, d, h, mi) {
    if (!zone) return '';
    try {
        const at = new Date(Date.UTC(y, mo - 1, d, h, mi));
        const part = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'short' })
            .formatToParts(at).find(p => p.type === 'timeZoneName');
        return part ? part.value : '';
    } catch (e) { return ''; }
}

const evEsc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function eventRow(ev, past) {
    // read the wall-clock parts straight off the string: putting a naive datetime
    // through Date() reinterprets it in the viewer's zone and can shift the day
    const [datePart, timePart = '00:00:00'] = String(ev.datetime || '').split('T');
    const [Y, Mo, D] = datePart.split('-').map(Number);
    const [H, Mi] = timePart.split(':').map(Number);
    const dow = DAYS[new Date(Y, Mo - 1, D).getDay()];
    const h12 = ((H + 11) % 12) + 1;
    const wall = `${h12}:${String(Mi).padStart(2, '0')} ${H >= 12 ? 'PM' : 'AM'}`;
    const abbr = zoneAbbr(venueZone(ev.venue), Y, Mo, D, H, Mi);

    const v = ev.venue || {};
    const venue = v.name || 'TBA';
    const where = [v.location || [v.city, v.region].filter(Boolean).join(', '), v.country]
        .filter(Boolean).join(' \u00b7 ');
    const href = EVENT_LINKS[datePart] || ev.url || '';
    return `
        <article class="ev-row${past ? ' is-past' : ''}">
            <div class="ev-when" aria-hidden="true">
                <span class="ev-mon">${MONTHS[Mo - 1]}</span>
                <span class="ev-day">${String(D).padStart(2, '0')}</span>
                <span class="ev-yr">${Y}</span>
            </div>
            <div class="ev-what">
                <h4 class="ev-venue">${evEsc(venue)}</h4>
                ${where ? `<p class="ev-where">${evEsc(where)}</p>` : ''}
                <p class="ev-time">${dow} \u00b7 ${evEsc(wall)}${
                    abbr ? ` <span class="ev-tz" title="venue local time">${evEsc(abbr)}</span>` : ''}</p>
            </div>
            <div class="ev-go">${past
                ? '<span class="ev-done">played</span>'
                : (href && href !== '#'
                    ? `<a class="ev-tix" href="${evEsc(href)}" target="_blank" rel="noopener">tickets</a>`
                    : '<span class="ev-done">announced</span>')}</div>
        </article>`;
}

const eventsSkeleton = (n) => `<div class="ev-load" role="status" aria-label="Loading shows">${
    Array.from({ length: n }, () => `
    <div class="ev-row is-skeleton" aria-hidden="true">
        <div class="ev-when"><span class="sk sk-sm"></span><span class="sk sk-lg"></span><span class="sk sk-sm"></span></div>
        <div class="ev-what"><span class="sk sk-line"></span><span class="sk sk-line short"></span></div>
        <div class="ev-go"><span class="sk sk-pill"></span></div>
    </div>`).join('')}</div>`;

async function fetchEvents() {
    const host = document.getElementById('events');
    if (!host) return;
    host.innerHTML = eventsSkeleton(3);

    const url = `https://rest.bandsintown.com/artists/${encodeURIComponent(BIT_ARTIST)}`
              + `/events?app_id=${BIT_APP_ID}&date=all`;
    let events;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        events = await res.json();
        if (!Array.isArray(events)) throw new Error('unexpected payload');
    } catch (err) {
        console.error('Error fetching events:', err);
        host.innerHTML = '<p class="ev-msg is-err">'
            + '<i class="fas fa-triangle-exclamation"></i> couldn\u2019t reach the booking feed. try again shortly.</p>';
        return;
    }

    if (new URLSearchParams(location.search).has('demoevents')) events = events.concat(DEMO_EVENTS);

    const now = Date.now();
    const upcoming = events.filter(e => new Date(e.datetime).getTime() >= now)
                           .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    const played = events.filter(e => new Date(e.datetime).getTime() < now)
                         .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

    const section = (label, rows, past) => rows.length
        ? `<section class="ev-group"><h3 class="ev-head">${label}<span class="ev-n">${rows.length}</span></h3>`
          + rows.map(e => eventRow(e, past)).join('') + '</section>'
        : '';

    // played history only grows, so keep it short and let the curious open it
    const playedSection = (rows) => {
        if (!rows.length) return '';
        const head = `<h3 class="ev-head">played<span class="ev-n">${rows.length}</span></h3>`;
        if (rows.length <= PLAYED_VISIBLE) {
            return `<section class="ev-group">${head}${rows.map(e => eventRow(e, true)).join('')}</section>`;
        }
        const shown = rows.slice(0, PLAYED_VISIBLE);
        const rest = rows.slice(PLAYED_VISIBLE);
        return `<section class="ev-group">${head}
            ${shown.map(e => eventRow(e, true)).join('')}
            <div class="ev-more" id="evMore" hidden>${rest.map(e => eventRow(e, true)).join('')}</div>
            <button class="ev-expand" id="evExpand" type="button" aria-expanded="false" aria-controls="evMore">
                <span class="ev-expand-label">show ${rest.length} more</span>
                <i class="fas fa-chevron-down"></i>
            </button>
        </section>`;
    };

    host.innerHTML = (upcoming.length
        ? section('upcoming', upcoming, false)
        : '<p class="ev-msg"><i class="fas fa-calendar-xmark"></i> no dates on the books right now \u2014 '
          + '<a href="mailto:sweltersounds@gmail.com">book a show</a>.</p>')
        + playedSection(played);

    const btn = document.getElementById('evExpand');
    if (btn) btn.addEventListener('click', () => {
        const more = document.getElementById('evMore');
        const open = more.hidden;
        more.hidden = !open;
        btn.setAttribute('aria-expanded', String(open));
        btn.classList.toggle('is-open', open);
        btn.querySelector('.ev-expand-label').textContent =
            open ? 'show fewer' : `show ${more.children.length} more`;
    });
}

fetchEvents();
