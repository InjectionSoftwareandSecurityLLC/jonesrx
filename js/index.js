// Index page: dropdown colors, nav transitions, neon overlay intro
styleDropdown('ddSpotify', 'green');
styleDropdown('ddAppleMusic', 'pink');
styleDropdown('ddTiktok', 'white');
styleDropdown('ddInsta', 'yellow');
styleDropdown('ddYouTube', 'red');
styleDropdown('ddFacebook', 'blue');

setupTvTransition('about-button', '/about');
setupTvTransition('events-button', '/events');
setupTvTransition('videos-button', '/videos');

// Neon overlay intro
const overlayText = document.getElementById('overlayText');
const overlayObj = document.getElementById('neonOverlay');
const overlayColors = ['cyan', 'magenta', 'yellow', 'lime', 'hotpink', 'orange'];

const randomColor = overlayColors[Math.floor(Math.random() * overlayColors.length)];
overlayText.style.textShadow = `
    0 0 10px ${randomColor},
    0 0 20px ${randomColor},
    0 0 40px ${randomColor},
    0 0 60px ${randomColor}`;

window.addEventListener('load', () => {
    setTimeout(() => {
        overlayObj.style.display = 'none';
    }, 3000);
});

// Secret game — click/tap the neon sign to launch
const signContainer = document.querySelector('.neon-sign-container');
const neonSign = document.getElementById('neonSign');
// (hover: hover) is true only on devices with a real mouse pointer
const hasHover = window.matchMedia('(hover: hover)').matches;
let signRevealed = false;
let revealedAt = 0;

signContainer.style.cursor = 'pointer';

function showSkateText(prompt) {
    neonSign.textContent = '';
    neonSign.style.fontSize = '2.8rem';
    neonSign.style.lineHeight = '1.1';
    neonSign.innerHTML = 'Want to<br>skate?<br><span style="font-size:1.2rem">(' + prompt + ')</span>';
}

function resetSign() {
    neonSign.textContent = '';
    neonSign.style.fontSize = '';
    neonSign.style.lineHeight = '';
    neonSign.innerHTML = 'Jones<br/>&nbsp;RX';
    signRevealed = false;
    signContainer.classList.remove('sign-wiggle');
}

function launchGame() {
    resetSign();
    if (typeof startGame === 'function') startGame();
}

if (hasHover) {
    // Desktop: hover reveals, click launches
    signContainer.addEventListener('mouseenter', function () {
        showSkateText('click me');
    });
    signContainer.addEventListener('mouseleave', function () {
        resetSign();
    });
    signContainer.addEventListener('click', function (e) {
        e.stopPropagation();
        launchGame();
    });
} else {
    // Mobile: first tap reveals text + wiggle, second tap launches game
    signContainer.addEventListener('touchend', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!signRevealed) {
            showSkateText('tap here');
            signContainer.classList.add('sign-wiggle');
            signRevealed = true;
            revealedAt = Date.now();
        } else {
            // Only launch if reveal happened on a previous tap (>400ms ago)
            if (Date.now() - revealedAt > 400) {
                launchGame();
            }
        }
    });
    // Tapping elsewhere resets the sign
    document.addEventListener('touchend', function () {
        if (signRevealed) {
            resetSign();
        }
    });
}
