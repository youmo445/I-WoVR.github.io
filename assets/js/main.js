(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const SPEED = 2;
  const demoVideos = [...document.querySelectorAll('.demo-video')];
  const hero = $('#hero-video');
  const dialog = $('#video-dialog');
  const enlarged = $('#dialog-video');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const visible = new Set();
  const pausedByUser = new Set();
  const internalPause = new WeakSet();
  let modalSource = null;
  let heroVisible = true;
  const tryPlay = video => { const promise = video.play(); if (promise) promise.catch(() => {}); };
  const setSpeed = video => {
    if (video.defaultPlaybackRate !== SPEED) video.defaultPlaybackRate = SPEED;
    if (video.playbackRate !== SPEED) video.playbackRate = SPEED;
  };
  // All playback surfaces, including the enlarged player, use the same fixed rate.
  [...demoVideos, hero, enlarged].forEach(video => {
    setSpeed(video);
    video.addEventListener('loadedmetadata', () => setSpeed(video));
    video.addEventListener('ratechange', () => setSpeed(video));
  });
  const pauseQuietly = video => {
    if (!video.paused) { internalPause.add(video); video.pause(); }
  };
  const loadVideo = video => {
    if (!video.getAttribute('src') && video.dataset.src) {
      video.src = video.dataset.src;
      video.load();
    }
    setSpeed(video);
  };
  for (const video of demoVideos) {
    video.addEventListener('pause', () => {
      if (internalPause.has(video)) internalPause.delete(video);
      else if (visible.has(video) && !dialog.open && !document.hidden) pausedByUser.add(video);
    });
    video.addEventListener('play', () => pausedByUser.delete(video));
    video.addEventListener('error', () => {
      const frame = video.closest('.video-frame');
      if (!frame.querySelector('.video-error')) {
        const error = document.createElement('p');
        error.className = 'video-error';
        error.textContent = 'The video could not load. Please refresh to try again.';
        frame.append(error);
      }
    });
  }
  const observer = new IntersectionObserver(entries => {
    for (const {target:video,isIntersecting} of entries) {
      if (isIntersecting) {
        visible.add(video);
        loadVideo(video);
        if (!reducedMotion && !pausedByUser.has(video) && !dialog.open && !document.hidden) tryPlay(video);
      } else {
        visible.delete(video);
        pauseQuietly(video);
      }
    }
  }, {threshold:0.25});
  demoVideos.forEach(video => observer.observe(video));
  hero.addEventListener('loadedmetadata', () => { if (reducedMotion) hero.pause(); });
  if (reducedMotion) hero.pause();
  new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    if (!heroVisible) hero.pause();
    else if (!reducedMotion && !document.hidden && !dialog.open) tryPlay(hero);
  }, {threshold:0.08}).observe(hero);

  document.querySelectorAll('[data-expand]').forEach(button => button.addEventListener('click', () => {
    modalSource = document.getElementById(button.dataset.expand);
    loadVideo(modalSource);
    const start = modalSource.currentTime;
    demoVideos.forEach(pauseQuietly);
    hero.pause();
    $('#dialog-title').textContent = modalSource.getAttribute('aria-label');
    enlarged.poster = modalSource.poster;
    enlarged.onloadedmetadata = () => {
      enlarged.currentTime = Math.min(start, Math.max(0, enlarged.duration - 0.05));
      setSpeed(enlarged);
      tryPlay(enlarged);
    };
    enlarged.src = modalSource.currentSrc || modalSource.src;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  }));
  $('#close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (modalSource && Number.isFinite(enlarged.currentTime)) modalSource.currentTime = enlarged.currentTime;
    enlarged.pause();
    enlarged.removeAttribute('src');
    enlarged.load();
    document.body.style.overflow = '';
    if (!reducedMotion) visible.forEach(video => { if (!pausedByUser.has(video)) tryPlay(video); });
    if (heroVisible && !reducedMotion) tryPlay(hero);
    modalSource = null;
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { demoVideos.forEach(pauseQuietly); hero.pause(); enlarged.pause(); }
    else if (!dialog.open && !reducedMotion) {
      visible.forEach(video => { if (!pausedByUser.has(video)) tryPlay(video); });
      if (heroVisible) tryPlay(hero);
    }
  });
  const topbar = $('.topbar');
  const progress = $('#reading-progress');
  const backToTop = $('#back-to-top');
  const updateScroll = () => {
    // The opening screen contains only the paper title and background video.
    topbar.classList.toggle('scrolled', scrollY >= $('#top').offsetHeight - 96);
    backToTop.classList.toggle('show', scrollY >= $('#top').offsetHeight);
    const scrollable = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (scrollable > 0 ? 100 * scrollY / scrollable : 0) + '%';
  };
  addEventListener('scroll', updateScroll, {passive:true});
  addEventListener('resize', updateScroll);
  updateScroll();
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const sectionObserver = new IntersectionObserver(entries => {
    const entry = entries.filter(item => item.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
    if (entry) navLinks.forEach(link => link.classList.toggle('active', link.hash === '#' + entry.target.id));
  }, {rootMargin:'-15% 0px -60% 0px',threshold:0});
  navLinks.forEach(link => sectionObserver.observe(document.querySelector(link.hash)));
})();
