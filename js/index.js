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
