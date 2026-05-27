(function (global) {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    /* Only activate on module pages */
    if (!document.body.dataset.module) return;

    const glossary = global.LinuxWikiGlossary;
    if (!glossary) return;

    /* Sort terms longest-first to match multi-word terms before single words */
    const terms = Object.keys(glossary).sort(function (a, b) {
      return b.length - a.length;
    });

    /* Track which terms have already been wrapped (one per page) */
    const wrapped = new Set();

    /* Selectors to walk */
    const containers = document.querySelectorAll(
      ".content-section p, .content-section li, .section-block p"
    );

    /* Tags to skip */
    const skipTags = new Set(["CODE", "PRE", "KBD", "A", "H1", "H2", "H3", "H4", "SCRIPT", "STYLE"]);

    /* Walk text nodes in an element */
    function walkTextNodes(el, callback) {
      const walker = document.createTreeWalker(
        el,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function (node) {
            /* Skip if any ancestor is a skip tag or gloss-term */
            let parent = node.parentElement;
            while (parent && parent !== el) {
              if (skipTags.has(parent.tagName) || parent.classList.contains("gloss-term")) {
                return NodeFilter.FILTER_REJECT;
              }
              parent = parent.parentElement;
            }
            return NodeFilter.FILTER_ACCEPT;
          },
        }
      );

      const nodes = [];
      let node;
      while ((node = walker.nextNode())) {
        nodes.push(node);
      }
      nodes.forEach(callback);
    }

    /* Wrap a term in a text node */
    function wrapTerm(textNode, term, definition) {
      const text = textNode.nodeValue;
      const lower = text.toLowerCase();
      const termLower = term.toLowerCase();
      const idx = lower.indexOf(termLower);
      if (idx === -1) return false;

      const before = document.createTextNode(text.slice(0, idx));
      const span = document.createElement("span");
      span.className = "gloss-term";
      span.dataset.def = definition;
      span.textContent = text.slice(idx, idx + term.length);
      const after = document.createTextNode(text.slice(idx + term.length));

      const parent = textNode.parentNode;
      parent.insertBefore(before, textNode);
      parent.insertBefore(span, textNode);
      parent.insertBefore(after, textNode);
      parent.removeChild(textNode);

      return true;
    }

    /* Process each container */
    containers.forEach(function (container) {
      terms.forEach(function (term) {
        if (wrapped.has(term)) return;

        walkTextNodes(container, function (textNode) {
          if (wrapped.has(term)) return;
          if (wrapTerm(textNode, term, glossary[term])) {
            wrapped.add(term);
          }
        });
      });
    });

    /* ── Floating tooltip ──────────────────────────────────────── */
    let tooltip = document.getElementById("gloss-tooltip");
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.id = "gloss-tooltip";
      tooltip.setAttribute("role", "tooltip");
      document.body.appendChild(tooltip);
    }

    let hideTimer = null;

    document.addEventListener("mouseover", function (e) {
      const term = e.target.closest(".gloss-term");
      if (!term) return;

      clearTimeout(hideTimer);
      tooltip.textContent = term.dataset.def || "";
      tooltip.style.display = "block";

      /* Position the tooltip */
      const rect = term.getBoundingClientRect();
      const tipHeight = tooltip.offsetHeight || 80;
      const tipWidth = tooltip.offsetWidth || 280;

      let top, left;

      /* Try above first */
      if (rect.top - tipHeight - 8 > 0) {
        top = rect.top - tipHeight - 8;
      } else {
        top = rect.bottom + 8;
      }

      left = Math.max(8, Math.min(rect.left, window.innerWidth - tipWidth - 8));

      tooltip.style.top = top + "px";
      tooltip.style.left = left + "px";
    });

    document.addEventListener("mouseout", function (e) {
      const term = e.target.closest(".gloss-term");
      if (!term) return;

      /* Check if moving to tooltip itself */
      const related = e.relatedTarget;
      if (related && (related === tooltip || tooltip.contains(related))) return;

      hideTimer = setTimeout(function () {
        tooltip.style.display = "none";
      }, 120);
    });

    tooltip.addEventListener("mouseenter", function () {
      clearTimeout(hideTimer);
    });

    tooltip.addEventListener("mouseleave", function () {
      hideTimer = setTimeout(function () {
        tooltip.style.display = "none";
      }, 120);
    });
  });

})(globalThis);
