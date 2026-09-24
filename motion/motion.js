(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const narrowScreen = window.matchMedia('(max-width: 760px)');
  const openingTrack = document.querySelector('.opening-track');
  const opening = document.querySelector('.opening');
  const journey = document.querySelector('.journey');
  const photos = Array.from(document.querySelectorAll('.opening-photo img'));

  if (reducedMotion.matches) {
    root.classList.add('is-ready');
    return;
  }

  root.classList.add('motion-enabled');

  const imageReady = Promise.all(photos.map((photo) => {
    if (photo.complete) return Promise.resolve();
    return new Promise((resolve) => {
      photo.addEventListener('load', resolve, { once: true });
      photo.addEventListener('error', resolve, { once: true });
    });
  }));
  const timeout = new Promise((resolve) => window.setTimeout(resolve, 1800));
  const minimum = new Promise((resolve) => window.setTimeout(resolve, 850));
  Promise.all([Promise.race([imageReady, timeout]), minimum]).then(() => {
    root.classList.add('is-ready');
    updateMotion();
  });

  let scheduled = false;
  const smoothstep = (value) => value * value * (3 - 2 * value);
  const updateMotion = () => {
    if (narrowScreen.matches) {
      root.style.setProperty('--photo-shift', '0px');
      const trackTop = openingTrack.getBoundingClientRect().top + window.scrollY;
      const stickyTop = Number.parseFloat(window.getComputedStyle(opening).top) || 0;
      const travel = Math.max(1, openingTrack.clientHeight - opening.clientHeight);
      const progress = Math.max(0, Math.min(1, (window.scrollY - trackTop + stickyTop) / travel));
      const pan = progress <= 0.5
        ? 0.5 * (1 - smoothstep(progress * 2))
        : smoothstep((progress - 0.5) * 2);

      photos.forEach((photo) => {
        if (!photo.naturalWidth || !photo.naturalHeight) return;
        const frame = photo.parentElement;
        const imageWidth = frame.clientHeight * photo.naturalWidth / photo.naturalHeight;
        const overflow = Math.max(0, imageWidth - frame.clientWidth);
        photo.style.setProperty('--pan-x', `${-overflow * pan}px`);
      });
    } else {
      const top = opening.getBoundingClientRect().top;
      const shift = Math.max(-32, Math.min(32, -top * 0.08));
      root.style.setProperty('--photo-shift', `${shift}px`);
    }
    scheduled = false;
  };
  const scheduleMotion = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateMotion);
  };
  window.addEventListener('scroll', scheduleMotion, { passive: true });
  window.addEventListener('resize', scheduleMotion, { passive: true });
  updateMotion();

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        journey.classList.add('is-visible');
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(journey);
  } else {
    journey.classList.add('is-visible');
  }
})();
