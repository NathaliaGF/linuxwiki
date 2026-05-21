(function (global) {
  'use strict';

  const LinuxWiki = global.LinuxWiki || (global.LinuxWiki = {});
  let deferredPrompt = null;

  function onInstallAccepted() {
    if (LinuxWiki.App?.showToast) {
      LinuxWiki.App.showToast('App instalado!', 'success');
    }
  }

  global.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    document.querySelectorAll('.btn-install-pwa').forEach(button => button.classList.add('visible'));
  });

  document.addEventListener('click', async event => {
    const button = event.target.closest('.btn-install-pwa');
    if (!button || !deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') onInstallAccepted();
    deferredPrompt = null;
    document.querySelectorAll('.btn-install-pwa').forEach(btn => btn.classList.remove('visible'));
  });

  if ('serviceWorker' in navigator) {
    global.addEventListener('load', () => {
      navigator.serviceWorker.register('../sw.js').catch(() => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    });
  }
})(globalThis);
