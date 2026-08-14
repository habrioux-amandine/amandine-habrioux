(function () {
  const hero = document.getElementById('heroSlideshow');
  if (!hero) return;

  const slides = hero.querySelectorAll('.hero-slide');
  if (slides.length <= 1) return;

  // Vitesse de défilement réglée en partie admin (en millisecondes), avec un minimum
  // de sécurité pour éviter un diaporama illisible si une valeur invalide est stockée.
  const speed = Math.max(parseInt(hero.dataset.speed, 10) || 5000, 1000);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  let current = 0;

  setInterval(() => {
    const next = (current + 1) % slides.length;
    slides[current].classList.remove('active');
    slides[next].classList.add('active');
    current = next;
  }, speed);
})();
