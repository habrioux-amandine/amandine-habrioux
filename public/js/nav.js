(function () {
  var nav = document.getElementById('site-nav');
  if (!nav) return;

  var lastScrollY = window.scrollY;
  var navHeight = nav.offsetHeight;

  window.addEventListener('scroll', function () {
    var currentScrollY = window.scrollY;

    if (currentScrollY <= navHeight) {
      nav.classList.remove('nav-hidden');
    } else if (currentScrollY > lastScrollY) {
      nav.classList.add('nav-hidden');
    } else {
      nav.classList.remove('nav-hidden');
    }

    lastScrollY = currentScrollY;
  }, { passive: true });
})();