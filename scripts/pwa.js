(function (global) {
  'use strict';

  const LinuxWiki = global.LinuxWiki || (global.LinuxWiki = {});
  const PIX_KEY = '7df5585a-0e74-497f-b6ed-143fab35c9e0';

  // --- Service Worker ---
  if ('serviceWorker' in navigator) {
    global.addEventListener('load', () => {
      navigator.serviceWorker.register('../sw.js').catch(() => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    });
  }

  // --- Donation Modal ---
  function buildModal() {
    const el = document.createElement('div');
    el.id = 'pix-modal';
    el.className = 'pix-modal-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'pix-modal-title');
    el.innerHTML = `
      <div class="pix-modal-box">
        <button class="pix-modal-close" aria-label="Fechar">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="pix-modal-coffee" aria-hidden="true">☕</div>
        <h2 class="pix-modal-title" id="pix-modal-title">Apoiar o LinuxWiki</h2>
        <p class="pix-modal-desc">
          Gostou do projeto? Pague um café virtual e ajude a manter tudo
          gratuito e open-source!
        </p>
        <div class="pix-key-block">
          <span class="pix-key-label">Chave Pix — aleatória</span>
          <div class="pix-key-row">
            <code class="pix-key-value">${PIX_KEY}</code>
            <button class="btn-copy-pix" title="Copiar chave Pix" aria-label="Copiar chave Pix">
              <svg class="icon-copy" width="15" height="15" viewBox="0 0 15 15" fill="none">
                <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
                <path d="M10 5V3.5A1.5 1.5 0 008.5 2h-5A1.5 1.5 0 002 3.5v5A1.5 1.5 0 003.5 10H5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
              <svg class="icon-check" width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M2.5 7.5l3.5 3.5 6-7" stroke="var(--cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        <p class="pix-modal-footer">Qualquer valor é bem-vindo. Obrigada! 💚</p>
      </div>
    `;
    return el;
  }

  let modalEl = null;

  function openModal() {
    if (!modalEl) {
      modalEl = buildModal();
      document.body.appendChild(modalEl);

      modalEl.querySelector('.pix-modal-close').addEventListener('click', closeModal);
      modalEl.addEventListener('click', e => { if (e.target === modalEl) closeModal(); });
      document.addEventListener('keydown', onEsc);

      const copyBtn = modalEl.querySelector('.btn-copy-pix');
      copyBtn.addEventListener('click', async function () {
        try {
          await navigator.clipboard.writeText(PIX_KEY);
        } catch {
          const ta = document.createElement('textarea');
          ta.value = PIX_KEY;
          ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
        }
        this.querySelector('.icon-copy').style.display = 'none';
        this.querySelector('.icon-check').style.display = '';
        setTimeout(() => {
          this.querySelector('.icon-copy').style.display = '';
          this.querySelector('.icon-check').style.display = 'none';
        }, 2000);
        if (LinuxWiki.App?.showToast) {
          LinuxWiki.App.showToast('Chave Pix copiada! 💚', 'success');
        }
      });
    }
    // Hide check icon on reopen
    const iconCheck = modalEl.querySelector('.icon-check');
    const iconCopy = modalEl.querySelector('.icon-copy');
    if (iconCheck) iconCheck.style.display = 'none';
    if (iconCopy) iconCopy.style.display = '';

    modalEl.classList.add('open');
    document.body.style.overflow = 'hidden';
    modalEl.querySelector('.pix-modal-close').focus();
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.classList.remove('open');
    document.body.style.overflow = '';
  }

  function onEsc(e) {
    if (e.key === 'Escape') closeModal();
  }

  // Open modal when any coffee button is clicked
  document.addEventListener('click', e => {
    if (e.target.closest('.btn-coffee')) openModal();
  });

})(globalThis);
