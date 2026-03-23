document.addEventListener('DOMContentLoaded', function () {
    var GALLERY_DIR = 'img/promo/';
    var EXTENSIONS = ['jpg', 'png'];
    var MAX_PROBE  = 50; // probe promo1 through promo50

    var thumbsContainer = document.getElementById('galleryThumbs');
    var preview         = document.getElementById('galleryPreview');
    var previewImg      = document.getElementById('galleryPreviewImg');
    var prevBtn         = document.getElementById('galleryPrev');
    var nextBtn         = document.getElementById('galleryNext');
    var lightbox        = document.getElementById('galleryLightbox');
    var lightboxImg     = document.getElementById('lightboxImg');
    var lightboxClose   = document.getElementById('lightboxClose');
    var lightboxPrev    = document.getElementById('lightboxPrev');
    var lightboxNext    = document.getElementById('lightboxNext');
    var lightboxCounter = document.getElementById('lightboxCounter');

    var currentIndex = 0;
    var images     = [];
    var thumbnails = [];

    // ── Auto-discover images by probing promo1..MAX_PROBE with each extension ──
    function probeImage(src) {
        return new Promise(function (resolve) {
            var img = new Image();
            img.onload  = function () { resolve(src); };
            img.onerror = function () { resolve(null); };
            img.src = src;
        });
    }

    function discoverImages() {
        var probes = [];
        for (var n = 1; n <= MAX_PROBE; n++) {
            for (var e = 0; e < EXTENSIONS.length; e++) {
                probes.push({ num: n, src: GALLERY_DIR + 'promo' + n + '.' + EXTENSIONS[e] });
            }
        }

        var promises = probes.map(function (p) {
            return probeImage(p.src).then(function (result) {
                return result ? { num: p.num, src: p.src } : null;
            });
        });

        return Promise.all(promises).then(function (results) {
            // Keep only found images, one per number (first extension wins)
            var seen = {};
            var found = [];
            results.forEach(function (r) {
                if (r && !seen[r.num]) {
                    seen[r.num] = true;
                    found.push(r);
                }
            });
            // Sort descending by number
            found.sort(function (a, b) { return b.num - a.num; });
            return found.map(function (r) { return r.src; });
        });
    }

    // ── Build gallery once images are discovered ──
    function buildGallery(srcs) {
        images = srcs;

        srcs.forEach(function (src, i) {
            var img = document.createElement('img');
            img.className = 'gallery-thumb';
            img.src = src;
            img.alt = 'Photo ' + (i + 1);
            thumbsContainer.appendChild(img);
            thumbnails.push(img);
        });

        // Attach thumbnail click handlers
        thumbnails.forEach(function (thumb, i) {
            thumb.addEventListener('click', function () { setActive(i); });
        });

        if (images.length) setActive(0);
    }

    // ── Gallery controls ──
    function setActive(index) {
        if (images.length === 0) return;
        if (index < 0) index = images.length - 1;
        if (index >= images.length) index = 0;
        currentIndex = index;
        previewImg.src = images[currentIndex];

        thumbnails.forEach(function (thumb, i) {
            if (i === currentIndex) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });

        var activeThumb = thumbnails[currentIndex];
        if (activeThumb) {
            activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }

        updateCounter();
    }

    function updateCounter() {
        if (lightboxCounter) {
            lightboxCounter.textContent = (currentIndex + 1) + ' / ' + images.length;
        }
    }

    function openLightbox() {
        lightboxImg.src = images[currentIndex];
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
        updateCounter();
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
    }

    // Preview navigation
    prevBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        setActive(currentIndex - 1);
    });

    nextBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        setActive(currentIndex + 1);
    });

    // Click preview to open lightbox
    preview.addEventListener('click', function (e) {
        if (e.target === prevBtn || e.target === nextBtn) return;
        openLightbox();
    });

    // Lightbox controls
    lightboxClose.addEventListener('click', function (e) {
        e.stopPropagation();
        closeLightbox();
    });

    lightboxPrev.addEventListener('click', function (e) {
        e.stopPropagation();
        setActive(currentIndex - 1);
        lightboxImg.src = images[currentIndex];
    });

    lightboxNext.addEventListener('click', function (e) {
        e.stopPropagation();
        setActive(currentIndex + 1);
        lightboxImg.src = images[currentIndex];
    });

    // Click backdrop to close
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
        var isLightboxOpen = lightbox.classList.contains('open');
        if (e.key === 'Escape' && isLightboxOpen) closeLightbox();
        if (e.key === 'ArrowLeft') {
            setActive(currentIndex - 1);
            if (isLightboxOpen) lightboxImg.src = images[currentIndex];
        }
        if (e.key === 'ArrowRight') {
            setActive(currentIndex + 1);
            if (isLightboxOpen) lightboxImg.src = images[currentIndex];
        }
    });

    // Touch/swipe support for lightbox
    var touchStartX = 0;
    lightbox.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
        var diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
            setActive(currentIndex + (diff > 0 ? 1 : -1));
            lightboxImg.src = images[currentIndex];
        }
    }, { passive: true });

    // ── Kick off discovery ──
    discoverImages().then(buildGallery);
});
