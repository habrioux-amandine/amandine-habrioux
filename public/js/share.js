(function () {
  var btn = document.getElementById('share-btn');
  if (!btn) return;

  var label = btn.querySelector('.share-label');
  var originalText = label ? label.textContent : '';
  var copiedText = btn.dataset.copiedText || 'Lien copié !';

  btn.addEventListener('click', async function () {
    var shareData = {
      title: document.title,
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // L'utilisateur a annulé le partage, rien à faire
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareData.url);
      if (label) {
        label.textContent = copiedText;
        setTimeout(function () {
          label.textContent = originalText;
        }, 2000);
      }
    } catch (err) {
      window.prompt('Copiez ce lien :', shareData.url);
    }
  });
})();