(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
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
  });

  let scheduled = false;
  const updateParallax = () => {
    const top = opening.getBoundingClientRect().top;
    const shift = Math.max(-32, Math.min(32, -top * 0.08));
    root.style.setProperty('--photo-shift', `${shift}px`);
    scheduled = false;
  };
  window.addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateParallax);
  }, { passive: true });
  updateParallax();

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
