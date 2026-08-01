(function () {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;

  const figures = gallery.querySelectorAll('figure');
  const dots = gallery.querySelectorAll('.gallery-dot');
  const prevBtn = gallery.querySelector('.gallery-arrow.prev');
  const nextBtn = gallery.querySelector('.gallery-arrow.next');
  let current = 0;

  function goTo(index) {
    if (index < 0) index = figures.length - 1;
    if (index >= figures.length) index = 0;
    current = index;
    figures[current].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  // Met à jour le point actif quand on scroll manuellement (trackpad, tactile)
  let scrollTimeout;
  gallery.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const scrollLeft = gallery.scrollLeft;
      const width = gallery.clientWidth;
      const index = Math.round(scrollLeft / width);
      current = index;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }, 100);
  });
})();
