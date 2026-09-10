if (window.location.pathname.startsWith('/protocolos')) {
  const closingSection = document.querySelector('.closing#cierre');

  if (closingSection && !document.querySelector('#creador')) {
    const creatorSection = document.createElement('section');
    creatorSection.className = 'section';
    creatorSection.id = 'creador';
    creatorSection.innerHTML = `
      <div class="wrap">
        <div class="reveal visible" style="display:flex;flex-wrap:wrap;gap:28px;align-items:center;justify-content:space-between;padding:32px;border-radius:26px;border:1px solid rgba(255,255,255,.1);background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.018));box-shadow:var(--shadow)">
          <div style="flex:1 1 760px;min-width:0">
            <div class="eyebrow">Detrás de TramaClínicaMed</div>
            <h2 style="font-size:clamp(28px,3vw,44px);margin:0 0 12px">Fabián Moauro</h2>
            <p style="max-width:850px;color:#aebdca;line-height:1.7;margin:0"><strong>Fundador · Analista de Sistemas.</strong> TramaClínicaMed nace de más de 40 años de experiencia en desarrollo de software y bases de datos, combinados con las nuevas posibilidades de la inteligencia artificial. El proyecto se construye con aportes de profesionales de tecnología, producto, experiencia de usuario y comunicación, trabajando junto a profesionales médicos para desarrollar herramientas orientadas a resolver problemas concretos de la práctica cotidiana.</p>
          </div>
          <a href="mailto:contacto@tramaclinicamed.com" style="flex:0 1 auto;padding:13px 18px;border-radius:999px;border:1px solid rgba(94,231,255,.3);background:rgba(94,231,255,.08);color:#dffaff;font-weight:700;overflow-wrap:anywhere">contacto@tramaclinicamed.com</a>
        </div>
      </div>
    `;
    closingSection.before(creatorSection);
  }
}

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
