(function (global) {
  "use strict";

  const LinuxWiki = global.LinuxWiki || (global.LinuxWiki = {});
  const Catalog = LinuxWiki.Catalog;
  const Storage = LinuxWiki.Storage;
  const Progress = LinuxWiki.Progress;
  const Flashcards = LinuxWiki.Flashcards;
  const Quiz = LinuxWiki.Quiz;
  const Terminal = LinuxWiki.Terminal;

  function getModuleNames() {
    return Catalog.getModuleNames();
  }

  function getModuleSequence(moduleId) {
    const modules = Catalog.getModules();
    const index = modules.findIndex((module) => module.id === moduleId);
    return {
      index,
      modules,
      previous: index > 0 ? modules[index - 1] : null,
      current: index >= 0 ? modules[index] : null,
      next:
        index >= 0 && index < modules.length - 1 ? modules[index + 1] : null,
    };
  }

  function showToast(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
    }
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "true");
    container.setAttribute("role", "status");

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${type === "success" ? "✓" : "!"}</span><span class="toast-msg">${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(20px)";
      toast.style.transition = "all 0.25s ease";
      setTimeout(() => toast.remove(), 250);
    }, 2500);
  }

  function renderContinueBanner() {
    const banner = document.getElementById('continue-banner');
    if (!banner) return;

    const data = Storage.get();
    const positions = data.readingPositions || {};

    let latestModuleId = null;
    let latestTime = '';

    for (const [moduleId, pos] of Object.entries(positions)) {
      if (pos.updatedAt && pos.updatedAt > latestTime) {
        latestTime = pos.updatedAt;
        latestModuleId = moduleId;
      }
    }

    if (!latestModuleId) return;

    const progress = Progress.getModuleProgress(latestModuleId);
    if (progress.percent >= 100) return;

    const mod = Catalog.getModule(latestModuleId);
    if (!mod) return;

    const pos = positions[latestModuleId];
    const href = mod.path + (pos.sectionId ? '#' + pos.sectionId : '');

    banner.hidden = false;
    banner.className = 'continue-banner';
    banner.innerHTML = `
      <div class="continue-banner-inner">
        <div class="continue-banner-text">
          <span class="continue-banner-label">// continuar estudando</span>
          <strong class="continue-banner-module">${mod.title}</strong>
          <span class="continue-banner-progress">${progress.percent}% concluído · ${progress.sections.length} seção(ões) marcadas</span>
        </div>
        <a href="${href}" class="continue-banner-btn">Retomar →</a>
      </div>`;
  }

  function renderStudyHistory() {
    const container = document.getElementById("study-history-list");
    if (!container) return;

    const data = Storage.get();
    const history = data.studyHistory.slice(0, 7);
    if (!history.length) {
      container.innerHTML =
        '<p class="history-empty">Nenhuma sessão registrada ainda. Comece a estudar!</p>';
      return;
    }

    const moduleNames = getModuleNames();
    container.innerHTML = history
      .map(
        (entry) => `
      <div class="history-item">
        <span class="history-date">${entry.date}</span>
        <span class="history-modules">${entry.modules.map((moduleId) => moduleNames[moduleId] || moduleId).join(", ")}</span>
        <span class="history-time">${entry.minutes || 1} min</span>
      </div>`,
      )
      .join("");
  }

  function syncCompletionPanel(moduleId) {
    const existing = document.getElementById('module-completion-panel');
    const progress = Progress.getModuleProgress(moduleId);

    if (progress.percent < 100) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;

    const { next } = getModuleSequence(moduleId);
    const moduleData = Catalog.getModule(moduleId);
    const quizScore = Storage.get().quizScores?.[moduleId];

    let statsHtml = `
      <div class="completion-stat">
        <span class="completion-stat-value">${progress.sections.length}</span>
        <span class="completion-stat-label">seções</span>
      </div>`;

    const fcCount = moduleData?.flashcards?.length || 0;
    if (fcCount > 0) {
      statsHtml += `
      <div class="completion-stat">
        <span class="completion-stat-value">${fcCount}</span>
        <span class="completion-stat-label">flashcards</span>
      </div>`;
    }

    if (quizScore) {
      const pct = Math.round((quizScore.score / quizScore.total) * 100);
      statsHtml += `
      <div class="completion-stat">
        <span class="completion-stat-value">${pct}%</span>
        <span class="completion-stat-label">no quiz</span>
      </div>`;
    }

    const nextHref = next ? next.path.replace('pages/', '') : '../index.html';
    const nextLabel = next ? `Próximo: ${next.title} →` : 'Ver todos os módulos →';

    const panel = document.createElement('div');
    panel.id = 'module-completion-panel';
    panel.className = 'module-completion-panel';
    panel.setAttribute('role', 'status');
    panel.setAttribute('aria-live', 'polite');
    panel.innerHTML = `
      <div class="completion-check" aria-hidden="true">✓</div>
      <h3 class="completion-title">Módulo concluído!</h3>
      <p class="completion-subtitle">Você marcou todas as seções. Bom trabalho.</p>
      <div class="completion-stats">${statsHtml}</div>
      <a href="${nextHref}" class="btn-primary">${nextLabel}</a>`;

    const moduleNav = document.querySelector('.module-nav');
    if (moduleNav) moduleNav.parentNode.insertBefore(panel, moduleNav);
  }

  function initMarkStudied(moduleId) {
    const buttons = document.querySelectorAll(".mark-studied");

    buttons.forEach((button) => {
      const sectionId = button.dataset.section;
      const isMarked = Progress.isMarked(moduleId, sectionId);
      button.textContent = isMarked ? "★ Estudado" : "☆ Marcar como estudado";
      if (isMarked) button.classList.add("studied");
      button.setAttribute("aria-pressed", isMarked ? "true" : "false");

      button.addEventListener("click", () => {
        const marked = Progress.isMarked(moduleId, sectionId);
        if (marked) {
          Progress.unmarkSection(moduleId, sectionId);
          button.textContent = "☆ Marcar como estudado";
          button.classList.remove("studied");
          button.setAttribute("aria-pressed", "false");
          showToast("Seção desmarcada", "success");
        } else {
          Progress.markSection(moduleId, sectionId);
          button.textContent = "★ Estudado";
          button.classList.add("studied");
          button.setAttribute("aria-pressed", "true");
          showToast("Seção marcada como estudada!", "success");
          Progress.recordStudy(moduleId);
        }

        document.dispatchEvent(
          new CustomEvent("linuxwiki:section-study-change"),
        );
      });
    });

    const progress = Progress.getModuleProgress(moduleId);
    Progress.updateUI(progress.percent);
  }

  function initHighlighting() {
    const SHELL_KW = new Set([
      'if', 'then', 'else', 'elif', 'fi', 'for', 'do', 'done', 'while',
      'until', 'case', 'esac', 'in', 'function', 'return', 'exit', 'break',
      'continue', 'local', 'export', 'source', 'readonly', 'declare', 'unset',
      'shift', 'trap', 'sudo', 'chmod', 'chown', 'ls', 'mkdir', 'rm', 'cp',
      'mv', 'grep', 'find', 'cat', 'echo', 'cd', 'pwd', 'ssh', 'git', 'curl',
      'wget', 'tar', 'touch', 'sed', 'awk', 'sort', 'head', 'tail', 'wc',
      'systemctl', 'journalctl', 'apt', 'apt-get', 'yum', 'dnf', 'pacman',
      'df', 'du', 'ps', 'kill', 'killall', 'man', 'which', 'type', 'env',
      'alias', 'history', 'jobs', 'fg', 'bg', 'nohup', 'chgrp', 'stat',
      'ln', 'file', 'less', 'more', 'mount', 'umount', 'lsblk', 'fdisk',
      'dd', 'rsync', 'useradd', 'usermod', 'userdel', 'groupadd', 'passwd',
      'id', 'whoami', 'ping', 'netstat', 'ss', 'ip', 'ifconfig', 'hostname',
      'dig', 'iptables', 'ufw', 'crontab', 'screen', 'tmux', 'vim', 'nano',
      'vi', 'diff', 'patch', 'make', 'bash', 'sh', 'zsh', 'python', 'python3',
      'node', 'npm', 'pip', 'set', 'unset', 'read', 'printf', 'test',
    ]);

    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const wrap = (cls, val) => cls ? `<span class="${cls}">${esc(val)}</span>` : esc(val);

    function tokenizeLine(line) {
      let out = '';
      let i = 0;
      let isCmd = true;

      while (i < line.length) {
        if (/[ \t]/.test(line[i])) {
          let j = i;
          while (j < line.length && /[ \t]/.test(line[j])) j++;
          out += esc(line.slice(i, j));
          i = j;
          continue;
        }
        if (line[i] === '#') { out += wrap('sh-cmt', line.slice(i)); break; }
        if (line[i] === '"') {
          let j = i + 1;
          while (j < line.length) {
            if (line[j] === '\\') { j += 2; continue; }
            if (line[j] === '"') { j++; break; }
            j++;
          }
          out += wrap('sh-str', line.slice(i, j)); i = j; isCmd = false; continue;
        }
        if (line[i] === "'") {
          let j = i + 1;
          while (j < line.length && line[j] !== "'") j++;
          if (j < line.length) j++;
          out += wrap('sh-str', line.slice(i, j)); i = j; isCmd = false; continue;
        }
        if (line[i] === '$') {
          if (line[i + 1] === '{') {
            let j = i + 2;
            while (j < line.length && line[j] !== '}') j++;
            if (j < line.length) j++;
            out += wrap('sh-var', line.slice(i, j)); i = j;
          } else {
            let j = i + 1;
            while (j < line.length && /[\w]/.test(line[j])) j++;
            out += wrap('sh-var', line.slice(i, j || i + 2)); i = j || i + 2;
          }
          isCmd = false; continue;
        }
        if (line[i] === '-' && /[a-zA-Z-]/.test(line[i + 1] || '')) {
          let j = i + 1;
          while (j < line.length && /[\w-]/.test(line[j])) j++;
          out += wrap('sh-flag', line.slice(i, j)); i = j; isCmd = false; continue;
        }
        if (line[i] === '/' && i > 0 && /[\w.~_-]/.test(line[i + 1] || '')) {
          let j = i + 1;
          while (j < line.length && /[^\s"'#|;&<>!()\[\]{}]/.test(line[j])) j++;
          out += wrap('sh-path', line.slice(i, j)); i = j; isCmd = false; continue;
        }
        if (/[|;&><!()\[\]{}]/.test(line[i])) {
          let val = line[i];
          if (
            (val === '|' && line[i + 1] === '|') || (val === '&' && line[i + 1] === '&') ||
            (val === '>' && line[i + 1] === '>') || (val === '<' && line[i + 1] === '<')
          ) val += line[i + 1];
          out += wrap('sh-op', val);
          i += val.length;
          if (/[|;&]/.test(val[0])) isCmd = true;
          continue;
        }
        if (/\S/.test(line[i])) {
          let j = i;
          while (j < line.length && /[^\s"'#|;&><!()\[\]{}]/.test(line[j])) j++;
          const word = line.slice(i, j);
          let cls = null;
          if (/^\d+$/.test(word)) cls = 'sh-num';
          else if (isCmd) cls = 'sh-cmd';
          else if (SHELL_KW.has(word)) cls = 'sh-kw';
          out += wrap(cls, word); i = j; isCmd = false; continue;
        }
        out += esc(line[i]); i++;
      }
      return out;
    }

    document.querySelectorAll('pre code, pre').forEach((el) => {
      if (el.tagName === 'PRE' && el.querySelector('code')) return;
      if (el.dataset.highlighted) return;
      el.dataset.highlighted = '1';
      el.innerHTML = el.textContent.split('\n').map(tokenizeLine).join('\n');
    });
  }

  function initCopyButtons() {
    document.querySelectorAll("pre, .code-block").forEach((block) => {
      if (block.parentElement?.classList.contains("code-wrapper")) return;

      const wrapper = document.createElement("div");
      wrapper.className = "code-wrapper";
      block.parentNode.insertBefore(wrapper, block);
      wrapper.appendChild(block);

      const button = document.createElement("button");
      button.className = "copy-btn";
      button.textContent = "Copiar";
      wrapper.appendChild(button);

      button.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(block.textContent);
          button.textContent = "Copiado!";
          button.classList.add("copied");
          setTimeout(() => {
            button.textContent = "Copiar";
            button.classList.remove("copied");
          }, 2000);
        } catch {
          button.textContent = "Erro";
          setTimeout(() => {
            button.textContent = "Copiar";
          }, 2000);
        }
      });
    });
  }

  function initAccordions() {
    document
      .querySelectorAll(".accordion-header, .exercise-header")
      .forEach((header) => {
        header.setAttribute("role", "button");
        header.setAttribute("tabindex", "0");

        const item = header.closest(".accordion-item, .exercise-item");
        if (item) {
          header.setAttribute(
            "aria-expanded",
            item.classList.contains("open") ? "true" : "false",
          );
        }

        const toggle = () => {
          const item = header.closest(".accordion-item, .exercise-item");
          if (!item) return;

          const isOpen = item.classList.contains("open");
          const parent = item.parentElement;
          parent
            .querySelectorAll(".accordion-item.open, .exercise-item.open")
            .forEach((element) => {
              if (element !== item) {
                element.classList.remove("open");
                const elementHeader = element.querySelector(
                  ".accordion-header, .exercise-header",
                );
                if (elementHeader)
                  elementHeader.setAttribute("aria-expanded", "false");
              }
            });
          item.classList.toggle("open", !isOpen);
          header.setAttribute("aria-expanded", isOpen ? "false" : "true");
        };

        header.addEventListener("click", () => {
          toggle();
        });

        header.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          toggle();
        });
      });
  }

  function initHomePage() {
    const overallEl = document.getElementById("overall-progress-pct");
    const overallBar = document.querySelector("#overall-progress .fill");
    const percent = Progress.overallPercent();

    if (overallEl) overallEl.textContent = `${percent}%`;
    if (overallBar) overallBar.style.width = `${percent}%`;

    document.querySelectorAll("[data-module-id]").forEach((card) => {
      const moduleId = card.dataset.moduleId;
      const progress = Progress.getModuleProgress(moduleId);
      const bar = card.querySelector(".module-card-progress .fill");
      const status = card.querySelector(".module-card-status");
      let completeBadge = card.querySelector(".module-complete-badge");
      let progressBadge = card.querySelector(".module-progress-badge");

      if (bar) bar.style.width = `${progress.percent}%`;
      if (status) {
        status.textContent =
          progress.percent === 100
            ? "Trilha concluída"
            : progress.percent > 0
              ? `${progress.percent}% em andamento`
              : "Não iniciado";
      }
      card.classList.toggle(
        "is-in-progress",
        progress.percent > 0 && progress.percent < 100,
      );
      card.classList.toggle("is-complete", progress.percent === 100);

      if (progress.percent === 100 && !completeBadge) {
        completeBadge = document.createElement("span");
        completeBadge.className = "module-complete-badge";
        completeBadge.textContent = "Concluído";
        const footer = card.querySelector(".module-card-footer");
        if (footer) footer.appendChild(completeBadge);
      }

      if (progress.percent > 0 && progress.percent < 100 && !progressBadge) {
        progressBadge = document.createElement("span");
        progressBadge.className = "module-progress-badge";
        progressBadge.textContent = "Em andamento";
        const footer = card.querySelector(".module-card-footer");
        if (footer) footer.appendChild(progressBadge);
      }

      if (progress.percent < 100 && completeBadge) completeBadge.remove();
      if ((progress.percent === 0 || progress.percent === 100) && progressBadge)
        progressBadge.remove();
    });

    renderContinueBanner();
    renderStudyHistory();

    const btnExport = document.getElementById("btn-export");
    if (btnExport) {
      btnExport.addEventListener("click", () => {
        Storage.export();
        showToast("Progresso exportado!", "success");
      });
    }

    const btnReset = document.getElementById("btn-reset");
    if (btnReset) {
      btnReset.addEventListener("click", () => {
        if (
          !confirm("Resetar todo o progresso? Esta ação não pode ser desfeita.")
        )
          return;
        Storage.reset();
        showToast("Progresso resetado.", "success");
        setTimeout(() => location.reload(), 800);
      });
    }
  }

  function initRevisao() {
    const dueEl = document.getElementById("due-cards-count");
    const due = Flashcards.getAllDue();
    if (dueEl) dueEl.textContent = due.length;

    const dueModulesContainer = document.getElementById("due-modules-list");
    if (dueModulesContainer) {
      const dueByModule = Flashcards.getDueCountByModule().filter(
        (module) => module.dueCount > 0,
      );

      if (!dueByModule.length) {
        dueModulesContainer.innerHTML =
          '<p class="history-empty">Nenhum card pendente agora. Quando novas revisões vencerem, elas aparecem aqui.</p>';
      } else {
        dueModulesContainer.innerHTML = dueByModule
          .map(
            (module) => `
          <a class="history-item" href="${module.path.replace("pages/", "")}">
            <span class="history-modules">${module.title}</span>
            <span class="history-time">${module.dueCount} card${module.dueCount > 1 ? "s" : ""}</span>
          </a>`,
          )
          .join("");
      }
    }

    const moduleNames = getModuleNames();
    const weakContainer = document.getElementById("weak-topics");
    if (weakContainer) {
      const scores = Object.entries(Storage.get().quizScores)
        .map(([moduleId, score]) => ({
          moduleId,
          pct: Math.round((score.score / score.total) * 100),
        }))
        .sort((left, right) => left.pct - right.pct)
        .slice(0, 3);

      if (!scores.length) {
        weakContainer.innerHTML =
          '<p class="history-empty">Complete os quizzes para identificar pontos fracos.</p>';
      } else {
        weakContainer.innerHTML = scores
          .map(
            (score) => `
          <div class="history-item">
            <span class="history-modules">${moduleNames[score.moduleId] || score.moduleId}</span>
            <span class="history-time ${score.pct < 60 ? "metric-danger" : "metric-warning"}">${score.pct}%</span>
          </div>`,
          )
          .join("");
      }
    }

    renderStudyHistory();
  }

  function initModuleLayout(moduleId) {
    const container = document.querySelector(".container--narrow");
    const sections = Array.from(
      document.querySelectorAll(".content-section[id]"),
    );
    const header = document.querySelector(".module-header");
    if (!container || !sections.length || !header) return;

    if (!container.querySelector(".module-shell")) {
      const shell = document.createElement("div");
      shell.className = "module-shell";

      const main = document.createElement("div");
      main.className = "module-main";

      const sidebar = document.createElement("aside");
      sidebar.className = "module-sidebar";
      sidebar.innerHTML = `
        <div class="module-toc">
          <div class="module-toc-toolbar">
            <div class="module-toc-title">Neste módulo</div>
            <button type="button" class="module-toc-toggle" id="module-toc-toggle" aria-expanded="true">Ocultar</button>
          </div>
          <div class="module-summary">
            <div class="module-summary-label">Progresso por seção</div>
            <div class="module-summary-count" id="module-summary-count">0/${sections.length}</div>
            <p class="module-summary-copy" id="module-summary-copy">Nenhuma seção marcada ainda.</p>
            <a href="#${sections[0].id}" class="module-summary-link is-hidden" id="module-summary-link">Retomar leitura</a>
          </div>
          <nav class="module-toc-list" id="module-toc-list" aria-label="Sumário do módulo"></nav>
        </div>
      `;

      while (container.firstChild) {
        main.appendChild(container.firstChild);
      }

      shell.appendChild(main);
      shell.appendChild(sidebar);
      container.appendChild(shell);
    }

    const tocList = document.getElementById("module-toc-list");
    const summaryCount = document.getElementById("module-summary-count");
    const summaryCopy = document.getElementById("module-summary-copy");
    const summaryLink = document.getElementById("module-summary-link");
    const tocWrapper = container.querySelector(".module-toc");
    const tocToggle = document.getElementById("module-toc-toggle");
    const { previous, next } = getModuleSequence(moduleId);
    let lastActiveId = null;

    if (tocList && !tocList.children.length) {
      tocList.innerHTML = sections
        .map((section, index) => {
          const title =
            section.querySelector("h2")?.textContent?.trim() ||
            `Seção ${index + 1}`;
          return `
          <a href="#${section.id}" class="module-toc-link" data-target="${section.id}">
            <span class="module-toc-dot" aria-hidden="true"></span>
            <span>${title}</span>
            <span class="module-toc-index">${String(index + 1).padStart(2, "0")}</span>
          </a>
        `;
        })
        .join("");
    }

    sections.forEach((section) => {
      const heading = section.querySelector(".section-header h2");
      if (
        !heading ||
        heading.parentElement.classList.contains("section-header-main")
      )
        return;

      const wrapper = document.createElement("div");
      wrapper.className = "section-header-main";
      const state = document.createElement("span");
      state.className = "section-state";
      state.setAttribute("aria-hidden", "true");

      heading.parentNode.insertBefore(wrapper, heading);
      wrapper.appendChild(state);
      wrapper.appendChild(heading);
    });

    const flashcardsSection = document.querySelector(".flashcards-section");
    const quizSection = document.querySelector(".quiz-section");
    const moduleNav = document.querySelector(".module-nav");

    if (flashcardsSection) {
      flashcardsSection.setAttribute("aria-label", "Flashcards do módulo");
      flashcardsSection.classList.add("reveal-on-scroll");
    }

    if (quizSection) {
      quizSection.setAttribute("aria-label", "Quiz do módulo");
      quizSection.classList.add("reveal-on-scroll");
    }

    if (moduleNav) {
      moduleNav.setAttribute("aria-label", "Navegação entre módulos");
      const prevLink = moduleNav.querySelector(".module-nav-link.prev");
      const nextLink = moduleNav.querySelector(".module-nav-link.next");

      if (prevLink && previous) {
        prevLink.href = previous.path.replace("pages/", "");
        prevLink.textContent = `← ${previous.title}`;
      } else if (prevLink) {
        prevLink.classList.add("is-hidden");
      }

      if (nextLink && next) {
        nextLink.href = next.path.replace("pages/", "");
        nextLink.textContent = `${next.title} →`;
      } else if (nextLink) {
        nextLink.classList.add("is-hidden");
      }
    }

    const savedCollapsed =
      Storage.get().uiPreferences?.moduleTocCollapsed === true;
    if (tocWrapper && savedCollapsed) tocWrapper.classList.add("is-collapsed");
    if (tocToggle) {
      tocToggle.setAttribute(
        "aria-expanded",
        tocWrapper?.classList.contains("is-collapsed") ? "false" : "true",
      );
      tocToggle.textContent = tocWrapper?.classList.contains("is-collapsed")
        ? "Mostrar"
        : "Ocultar";
      tocToggle.addEventListener("click", () => {
        if (!tocWrapper) return;
        const collapsed = tocWrapper.classList.toggle("is-collapsed");
        tocToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
        tocToggle.textContent = collapsed ? "Mostrar" : "Ocultar";
        Storage.set((data) => {
          data.uiPreferences = data.uiPreferences || {};
          data.uiPreferences.moduleTocCollapsed = collapsed;
          return data;
        });
      });
    }

    const updateSectionUI = () => {
      const doneCount = sections.filter((section) =>
        Progress.isMarked(moduleId, section.id),
      ).length;
      if (summaryCount)
        summaryCount.textContent = `${doneCount}/${sections.length}`;
      if (summaryCopy) {
        summaryCopy.textContent =
          doneCount === sections.length
            ? "Módulo concluído. Revise flashcards e faça o quiz."
            : `${sections.length - doneCount} seção(ões) faltando para concluir este módulo.`;
      }

      const readingPosition = Storage.get().readingPositions?.[moduleId];
      if (summaryLink) {
        if (readingPosition?.sectionId) {
          const targetSection = sections.find(
            (section) => section.id === readingPosition.sectionId,
          );
          const targetTitle =
            targetSection?.querySelector("h2")?.textContent?.trim() ||
            "último ponto";
          summaryLink.href = `#${readingPosition.sectionId}`;
          summaryLink.textContent = `Retomar de: ${targetTitle}`;
          summaryLink.classList.remove("is-hidden");
        } else {
          summaryLink.classList.add("is-hidden");
        }
      }

      sections.forEach((section) => {
        const done = Progress.isMarked(moduleId, section.id);
        const state = section.querySelector(".section-state");
        const tocLink = document.querySelector(
          `.module-toc-link[data-target="${section.id}"]`,
        );
        if (state) state.classList.toggle("is-done", done);
        if (tocLink) tocLink.classList.toggle("is-done", done);
      });
    };

    const updateActiveSection = () => {
      const offset = window.innerHeight * 0.25;
      let activeId = sections[0].id;

      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top - offset <= 0) activeId = section.id;
      }

      document.querySelectorAll(".module-toc-link").forEach((link) => {
        link.classList.toggle("is-active", link.dataset.target === activeId);
      });

      if (activeId !== lastActiveId) {
        lastActiveId = activeId;
        Storage.set((data) => {
          data.readingPositions = data.readingPositions || {};
          data.readingPositions[moduleId] = {
            sectionId: activeId,
            updatedAt: new Date().toISOString(),
          };
          return data;
        });
      }
    };

    updateSectionUI();
    updateActiveSection();
    document.addEventListener(
      "linuxwiki:section-study-change",
      updateSectionUI,
    );
    window.addEventListener("scroll", updateActiveSection, { passive: true });
  }

  function initModulePage(moduleId) {
    initMarkStudied(moduleId);
    initModuleLayout(moduleId);
    syncCompletionPanel(moduleId);

    document.addEventListener('linuxwiki:section-study-change', () => {
      syncCompletionPanel(moduleId);
    });

    const moduleData = Catalog.getModule(moduleId);
    if (!moduleData) return;
    Flashcards.initWidget(moduleData.flashcards, moduleId);
    Quiz.initWidget(moduleData.quiz, moduleId);
  }

  function initHeroTypewriter() {
    const terminal = document.querySelector(".hero-terminal-body");
    if (!terminal) return;
    if (global.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Flatten grouped structure (hero-cmd-group > lines) into ordered list
    const allLines = [];
    Array.from(terminal.children).forEach((child) => {
      if (child.classList.contains("hero-cmd-group")) {
        Array.from(child.children).forEach((line) => allLines.push(line));
      } else {
        allLines.push(child);
      }
    });

    allLines.forEach((line) => { line.style.opacity = "0"; });

    const CHAR_DELAY = 42;
    const CMD_PAUSE = 260;
    const OUT_PAUSE = 160;
    let t = 480;

    allLines.forEach((line) => {
      const isCmd = line.classList.contains("hero-line");
      const cmdSpan = isCmd ? line.querySelector(".hero-cmd") : null;
      const cmdText = cmdSpan ? cmdSpan.textContent : "";

      if (cmdSpan) cmdSpan.textContent = "";

      setTimeout(() => {
        line.style.transition = "opacity 0.15s ease";
        line.style.opacity = "1";
        if (cmdSpan && cmdText) {
          let i = 0;
          const tick = () => {
            cmdSpan.textContent += cmdText[i++];
            if (i < cmdText.length) setTimeout(tick, CHAR_DELAY);
          };
          tick();
        }
      }, t);

      t += isCmd && cmdText ? CMD_PAUSE + cmdText.length * CHAR_DELAY : OUT_PAUSE;
    });
  }

  function initRevealMotion() {
    if (global.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Assign stagger delays to grid cards before observing
    document.querySelectorAll(".modules-grid, .tools-grid").forEach((grid) => {
      grid.querySelectorAll(".module-card, .tool-card").forEach((card, i) => {
        card.style.setProperty("--stagger-delay", `${i * 48}ms`);
      });
    });

    const candidates = document.querySelectorAll(
      ".section-block, .content-section, .tool-card, .module-card, .card, .exercise-item, .cheatsheet-section, .module-header",
    );
    if (!candidates.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("reveal-on-scroll", "is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );

    candidates.forEach((element) => {
      element.classList.add("reveal-on-scroll");
      observer.observe(element);
    });
  }

  LinuxWiki.App = {
    showToast,
    renderStudyHistory,
  };

  global.initFlashcards = (cards, moduleId) =>
    Flashcards.initWidget(cards, moduleId);
  global.initQuiz = (questions, moduleId) =>
    Quiz.initWidget(questions, moduleId);
  global.initSimulado = (questions) => Quiz.initSimulado(questions);

  document.addEventListener("DOMContentLoaded", () => {
    initHighlighting();
    initCopyButtons();
    initAccordions();
    initRevealMotion();

    const body = document.body;
    const page = body.dataset.page;
    const moduleId = body.dataset.module;

    if (page === "home") { initHomePage(); initHeroTypewriter(); }
    if (page === "revisao") initRevisao();
    if (page === "simulado" && global.simuladoQuestions)
      Quiz.initSimulado(global.simuladoQuestions);
    if (moduleId) initModulePage(moduleId);
    if (document.getElementById("terminal-simulado"))
      Terminal.init("terminal-simulado");
  });
})(globalThis);
