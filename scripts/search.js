(function (global) {
  'use strict';
  const LinuxWiki = global.LinuxWiki || (global.LinuxWiki = {});

  let cachedIndex = null;

  function buildIndex() {
    const inPages = global.location.pathname.includes('/pages/');
    const mods = (global.LinuxWikiData || {}).modules || {};
    const items = [];

    Object.values(mods).forEach(function (mod) {
      const url = inPages ? mod.path.replace('pages/', '') : mod.path;

      items.push({
        type: 'módulo',
        badge: mod.title,
        title: mod.title,
        body: '',
        url: url,
      });

      (mod.flashcards || []).forEach(function (fc) {
        items.push({
          type: 'flashcard',
          badge: mod.title,
          title: fc.question || fc.front || '',
          body: fc.answer || fc.back || '',
          url: url + '#flashcards',
        });
      });

      (mod.quiz || []).forEach(function (q) {
        items.push({
          type: 'quiz',
          badge: mod.title,
          title: q.question || '',
          body: q.explanation || '',
          url: url + '#quiz',
        });
      });
    });

    return items;
  }

  function getIndex() {
    return cachedIndex || (cachedIndex = buildIndex());
  }

  function search(query) {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return getIndex()
      .filter(function (item) {
        const text = (item.title + ' ' + item.body + ' ' + item.badge).toLowerCase();
        return terms.every(function (t) { return text.includes(t); });
      })
      .slice(0, 10);
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function highlight(text, query) {
    let out = esc(text);
    query.trim().split(/\s+/).filter(Boolean).forEach(function (t) {
      out = out.replace(
        new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'),
        '<mark>$1</mark>'
      );
    });
    return out;
  }

  function init() {
    let overlay = null;

    function open() {
      if (document.getElementById('search-overlay')) return;

      overlay = document.createElement('div');
      overlay.id = 'search-overlay';
      overlay.className = 'search-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Buscar conteúdo');
      overlay.innerHTML =
        '<div class="search-box">' +
          '<div class="search-input-row">' +
            '<svg class="search-icon" width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
              '<circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5"/>' +
              '<path d="M11 11l2.5 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
            '</svg>' +
            '<input type="search" id="search-input" class="search-input" ' +
              'placeholder="Buscar módulos, flashcards, quiz…" ' +
              'autocomplete="off" spellcheck="false" aria-label="Buscar" />' +
            '<kbd class="search-esc-key">Esc</kbd>' +
          '</div>' +
          '<div class="search-results" id="search-results" role="listbox" aria-label="Resultados"></div>' +
          '<div class="search-footer">↑↓ navegar · Enter abrir · <kbd>/</kbd> atalho</div>' +
        '</div>';

      document.body.appendChild(overlay);
      requestAnimationFrame(function () { overlay.classList.add('is-open'); });

      var input = document.getElementById('search-input');
      var resultsEl = document.getElementById('search-results');
      var sel = -1;

      function getItems() { return resultsEl.querySelectorAll('.search-result-item'); }

      function updateSel(items) {
        items.forEach(function (el, i) {
          el.classList.toggle('is-selected', i === sel);
          if (i === sel) el.scrollIntoView({ block: 'nearest' });
        });
      }

      function render(matches, q) {
        if (!q.trim()) { resultsEl.innerHTML = ''; return; }
        if (!matches.length) {
          resultsEl.innerHTML =
            '<div class="search-empty">Nenhum resultado para <strong>' + esc(q) + '</strong></div>';
          return;
        }
        resultsEl.innerHTML = matches.map(function (item) {
          return (
            '<a class="search-result-item" href="' + item.url + '" role="option">' +
              '<div class="search-result-meta">' +
                '<span class="search-result-badge">' + esc(item.badge) + '</span>' +
                '<span class="search-result-type">' + esc(item.type) + '</span>' +
              '</div>' +
              '<div class="search-result-title">' + highlight(item.title, q) + '</div>' +
            '</a>'
          );
        }).join('');
      }

      input.addEventListener('input', function () {
        sel = -1;
        render(search(input.value), input.value);
      });

      input.addEventListener('keydown', function (e) {
        var items = getItems();
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          sel = Math.min(sel + 1, items.length - 1);
          updateSel(items);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          sel = Math.max(sel - 1, -1);
          updateSel(items);
        } else if (e.key === 'Enter') {
          if (sel >= 0 && items[sel]) { e.preventDefault(); items[sel].click(); }
        } else if (e.key === 'Escape') {
          close();
        }
      });

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) close();
      });

      setTimeout(function () { input.focus(); }, 30);
    }

    function close() {
      if (!overlay) return;
      overlay.classList.remove('is-open');
      var el = overlay;
      overlay = null;
      setTimeout(function () { el.remove(); }, 200);
    }

    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.btn-search')) open();
    });

    document.addEventListener('keydown', function (e) {
      var tag = document.activeElement ? document.activeElement.tagName : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        open();
      }
    });
  }

  LinuxWiki.Search = { init: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(globalThis);
