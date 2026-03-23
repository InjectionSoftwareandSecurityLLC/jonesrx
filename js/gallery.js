document.addEventListener('DOMContentLoaded', function () {
    const thumbnails = document.querySelectorAll('.gallery-thumb');
    const preview = document.getElementById('galleryPreview');
    const previewImg = document.getElementById('galleryPreviewImg');
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');
    const lightbox = document.getElementById('galleryLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxCounter = document.getElementById('lightboxCounter');

    var currentIndex = 0;
    var images = [];

    // Build images array from thumbnails
    thumbnails.forEach(function (thumb, i) {
        images.push(thumb.src);
    });

    function setActive(index) {
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

        // Scroll active thumbnail into view
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

    // Thumbnail click
    thumbnails.forEach(function (thumb, i) {
        thumb.addEventListener('click', function () {
            setActive(i);
        });
    });

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
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
        var isLightboxOpen = lightbox.classList.contains('open');
        if (e.key === 'Escape' && isLightboxOpen) {
            closeLightbox();
        }
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
    var touchEndX = 0;

    lightbox.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
        touchEndX = e.changedTouches[0].screenX;
        var diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                setActive(currentIndex + 1);
            } else {
                setActive(currentIndex - 1);
            }
            lightboxImg.src = images[currentIndex];
        }
    }, { passive: true });

    // Initialize first image
    setActive(0);
});
