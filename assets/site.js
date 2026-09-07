const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const revealElements = [...document.querySelectorAll('.reveal')];

if (reduceMotion.matches || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

const deferredVideos = [...document.querySelectorAll('video[data-deferred-video]')];

function loadVideo(video, shouldPlay) {
  const source = video.querySelector('source[data-src]');
  if (source?.dataset.src) {
    source.src = source.dataset.src;
    source.removeAttribute('data-src');
    video.load();
  }

  if (shouldPlay) {
    video.play().catch(() => {
      video.controls = true;
    });
  }
}

if (reduceMotion.matches) {
  deferredVideos.forEach((video) => {
    video.autoplay = false;
    video.controls = true;
    loadVideo(video, false);
  });
} else if ('IntersectionObserver' in window) {
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        loadVideo(entry.target, true);
        videoObserver.unobserve(entry.target);
      });
    },
    { rootMargin: '320px 0px', threshold: 0.01 },
  );

  deferredVideos.forEach((video) => videoObserver.observe(video));
} else {
  deferredVideos.forEach((video) => loadVideo(video, true));
}

document.querySelectorAll('video:not([data-deferred-video])').forEach((video) => {
  if (reduceMotion.matches) {
    video.pause();
    video.autoplay = false;
    video.controls = true;
  }
});
