(function () {
  var label = document.getElementById('cursor-label');
  if (!label) return;

  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var rows = document.querySelectorAll('.project-row');
  if (!rows.length) return;

  document.addEventListener('mousemove', function (e) {
    label.style.left = e.clientX + 'px';
    label.style.top = e.clientY + 'px';
  });

  rows.forEach(function (row) {
    row.addEventListener('mouseenter', function () {
      label.classList.add('visible');
    });
    row.addEventListener('mouseleave', function () {
      label.classList.remove('visible');
    });
  });
})();