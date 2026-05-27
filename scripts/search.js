(function (global) {
  "use strict";

  /* ── Base path detection ───────────────────────────────────── */
  const isSubPage = location.pathname.includes("/pages/");
  const base = isSubPage ? "../" : "";

  /* ── Build search index from LinuxWikiData ──────────────────── */
  function buildIndex() {
    const index = [];
    const modules = (global.LinuxWikiData || {}).modules || {};

    Object.values(modules).forEach(function (mod) {
      /* Module title entry */
      index.push({
        moduleId: mod.id,
        moduleTitle: mod.title,
        type: "módulo",
        title: mod.title,
        body: "",
        url: base + mod.path,
      });

      /* Flashcard entries */
      (mod.flashcards || []).forEach(function (fc) {
        index.push({
          moduleId: mod.id,
          moduleTitle: mod.title,
          type: "flashcard",
          title: fc.question,
          body: fc.answer,
          url: base + mod.path + "#flashcards",
        });
      });

      /* Quiz entries */
      (mod.quiz || []).forEach(function (q) {
        index.push({
          moduleId: mod.id,
          moduleTitle: mod.title,
          type: "quiz",
          title: q.question,
          body: q.explanation || "",
          url: base + mod.path + "#quiz",
        });
      });
    });

    return index;
  }

  /* ── Highlight matching text ─────────────────────────────────── */
  function highlight(text, query) {
    if (!text) return "";
    const safe = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return safe.replace(new RegExp("(" + escaped + ")", "gi"), "<mark>$1</mark>");
  }

  /* ── Snippet: first 120 chars of body around the match ──────── */
  function snippet(text, query) {
    if (!text) return "";
    const lower = text.toLowerCase();
    const idx = lower.indexOf(query.toLowerCase());
    let start = Math.max(0, idx - 40);
    let chunk = text.slice(start, start + 120);
    if (start > 0) chunk = "…" + chunk;
    if (start + 120 < text.length) chunk += "…";
    return highlight(chunk, query);
  }

  /* ── Run search ──────────────────────────────────────────────── */
  function search(query, index) {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    return index.filter(function (item) {
      return (
        item.title.toLowerCase().includes(q) ||
        item.body.toLowerCase().includes(q) ||
        item.moduleTitle.toLowerCase().includes(q)
      );
    });
  }

  /* ── Group results by module ─────────────────────────────────── */
  function groupByModule(results) {
    const groups = {};
    results.forEach(function (item) {
      if (!groups[item.moduleId]) {
        groups[item.moduleId] = { title: item.moduleTitle, items: [] };
      }
      groups[item.moduleId].items.push(item);
    });
    return groups;
  }

  /* ── Type badge HTML ─────────────────────────────────────────── */
  function typeBadge(type) {
    const map = {
      "módulo": "badge-tipo-modulo",
      "flashcard": "badge-tipo-flashcard",
      "quiz": "badge-tipo-quiz",
    };
    return `<span class="search-result-type ${map[type] || ""}">${type}</span>`;
  }

  /* ── Render results ──────────────────────────────────────────── */
  function renderResults(results, query, container) {
    container.innerHTML = "";
    if (!results.length) {
      container.innerHTML = '<p class="search-no-results">Nenhum resultado encontrado.</p>';
      return;
    }

    const groups = groupByModule(results);

    Object.values(groups).forEach(function (group) {
      const groupEl = document.createElement("div");
      groupEl.className = "search-group";

      const titleEl = document.createElement("div");
      titleEl.className = "search-group-title";
      titleEl.textContent = group.title;
      groupEl.appendChild(titleEl);

      group.items.slice(0, 6).forEach(function (item) {
        const row = document.createElement("a");
        row.href = item.url;
        row.className = "search-result-item";
        row.innerHTML = `
          <div class="search-result-header">
            <span class="search-result-title">${highlight(item.title, query)}</span>
            ${typeBadge(item.type)}
          </div>
          ${item.body ? `<div class="search-result-body">${snippet(item.body, query)}</div>` : ""}
        `;
        row.addEventListener("click", function () {
          closeSearch();
        });
        groupEl.appendChild(row);
      });

      container.appendChild(groupEl);
    });
  }

  /* ── Modal DOM ───────────────────────────────────────────────── */
  function createModal() {
    const overlay = document.createElement("div");
    overlay.className = "search-overlay";
    overlay.id = "search-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Buscar");

    overlay.innerHTML = `
      <div class="search-box">
        <div class="search-input-row">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5"/>
            <path d="M11 11l2.5 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input
            type="search"
            class="search-input"
            id="search-input"
            placeholder="Buscar módulos, flashcards, questões…"
            autocomplete="off"
            spellcheck="false"
          />
          <button class="search-close" aria-label="Fechar busca" title="Fechar">✕</button>
        </div>
        <div class="search-results" id="search-results" role="listbox"></div>
      </div>
    `;

    document.body.appendChild(overlay);
    return overlay;
  }

  /* ── Open / Close ────────────────────────────────────────────── */
  let modal = null;
  let index = null;

  function openSearch() {
    if (!modal) {
      modal = createModal();

      /* Close on overlay click */
      modal.addEventListener("click", function (e) {
        if (e.target === modal) closeSearch();
      });

      /* Close button */
      modal.querySelector(".search-close").addEventListener("click", closeSearch);

      /* Input handler */
      const input = modal.querySelector("#search-input");
      const results = modal.querySelector("#search-results");

      input.addEventListener("input", function () {
        const q = input.value;
        if (!index) index = buildIndex();
        if (q.length < 2) {
          results.innerHTML = "";
          return;
        }
        renderResults(search(q, index), q, results);
      });
    }

    /* Rebuild index fresh each open in case data changed */
    index = buildIndex();
    modal.classList.add("open");
    document.body.style.overflow = "hidden";

    const input = modal.querySelector("#search-input");
    input.value = "";
    modal.querySelector("#search-results").innerHTML = "";
    setTimeout(function () { input.focus(); }, 60);
  }

  function closeSearch() {
    if (!modal) return;
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }

  /* Expose globally */
  global.closeSearch = closeSearch;

  /* ── Esc key ─────────────────────────────────────────────────── */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeSearch();
  });

  /* ── Wire up .btn-search via event delegation ────────────────── */
  document.addEventListener("click", function (e) {
    if (e.target.closest(".btn-search")) openSearch();
  });

})(globalThis);
