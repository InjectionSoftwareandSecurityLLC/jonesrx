const colors = ['red', 'yellow', 'cyan', 'green', 'purple', 'pink', 'orange', 'magenta'];
// Shuffle colors once so each button gets a unique random color
for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [colors[i], colors[j]] = [colors[j], colors[i]];
}
let colorIndex = 0;

function getUniqueRandomColor() {
    if (colorIndex >= colors.length) return null;
    return colors[colorIndex++];
}

document.querySelectorAll('.primary-button').forEach((button) => {
    const color = getUniqueRandomColor();
    if (color) {
        button.style.borderColor = color;
        button.style.color = color;
        button.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}`;
    }
});

function changeSignColor() {
    const neonSign = document.getElementById('neonSign');
    const ttl = document.getElementById('ttl');
    const ttr = document.getElementById('ttr');
    const tbl = document.getElementById('tbl');
    const tbr = document.getElementById('tbr');
    const titl = document.getElementById('titl');
    const titr = document.getElementById('titr');
    const tibl = document.getElementById('tibl');
    const tibr = document.getElementById('tibr');

    const color = colors[Math.floor(Math.random() * colors.length)];
    if (color) {
        neonSign.style.textShadow = `0 0 5px ${color}, 0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}`;

        ttl.style.borderColor = `transparent transparent ${color} transparent`;
        ttr.style.borderColor = `transparent transparent transparent ${color}`;
        tbl.style.borderColor = `${color} transparent transparent transparent`;
        tbr.style.borderColor = `transparent transparent ${color} transparent`;
        titl.style.borderColor = `transparent transparent ${color} transparent`;
        titr.style.borderColor = `transparent transparent transparent ${color}`;
        tibl.style.borderColor = `${color} transparent transparent transparent`;
        tibr.style.borderColor = `transparent transparent ${color} transparent`;
    }
}

document.querySelectorAll('.primary-button').forEach((button) => {
    setInterval(() => {
        if (Math.random() < 0.5) {
            button.classList.toggle('flicker');
        }
    }, 10000);
});

setInterval(() => {
    changeSignColor();
}, 2000);

function setupTvTransition(buttonId, targetUrl) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    btn.addEventListener("click", function(event) {
        event.preventDefault();
        const overlay = document.getElementById("tvOverlay");
        overlay.style.display = "block";
        overlay.style.animation = "tvTurnOff 1s ease-in-out forwards";
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 1000);
    });
}

function styleDropdown(id, color) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.borderColor = color;
    el.style.color = color;
    el.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}`;
}
