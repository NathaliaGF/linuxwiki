(function (global) {
  "use strict";

  const LinuxWiki = global.LinuxWiki || (global.LinuxWiki = {});
  const Storage = LinuxWiki.Storage;
  const Catalog = LinuxWiki.Catalog;

  const Flashcards = {
    normalizeCards(cards, moduleId = "module") {
      return (cards || []).map((card, index) => ({
        id: card.id || `${moduleId}-${index + 1}`,
        question: card.question || card.front || "",
        answer: card.answer || card.back || "",
      }));
    },

    sm2(card, quality) {
      let { interval = 1, easeFactor = 2.5, repetitions = 0 } = card;

      if (quality < 3) {
        repetitions = 0;
        interval = 1;
      } else {
        if (repetitions === 0) interval = 1;
        else if (repetitions === 1) interval = 6;
        else interval = Math.round(interval * easeFactor);
        repetitions++;
      }

      easeFactor = Math.max(
        1.3,
        easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02),
      );

      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + interval);

      return {
        interval,
        easeFactor,
        repetitions,
        nextReview: nextDate.toISOString().slice(0, 10),
      };
    },

    saveResult(cardId, quality) {
      Storage.set((data) => {
        const existing = data.flashcards[cardId] || {};
        data.flashcards[cardId] = {
          ...existing,
          ...this.sm2(existing, quality),
        };
        return data;
      });
    },

    isDue(cardId) {
      const data = Storage.get();
      const card = data.flashcards[cardId];
      if (!card || !card.nextReview) return true;
      return card.nextReview <= new Date().toISOString().slice(0, 10);
    },

    getAllDue() {
      const today = new Date().toISOString().slice(0, 10);
      const data = Storage.get();

      return Catalog.getModules()
        .flatMap((module) => module.flashcards.map((card) => card.id))
        .filter((cardId) => {
          const saved = data.flashcards[cardId];
          return !saved || !saved.nextReview || saved.nextReview <= today;
        });
    },

    getDueCountByModule() {
      const dueIds = new Set(this.getAllDue());
      return Catalog.getModules().map((module) => ({
        ...module,
        dueCount: module.flashcards.filter((card) => dueIds.has(card.id))
          .length,
      }));
    },

    initWidget(cards, moduleId) {
      const container = document.getElementById("flashcard-widget");
      if (!container || !cards?.length) return;

      const normalizedCards = this.normalizeCards(cards, moduleId);
      let currentIndex = 0;
      let isFlipped = false;
      let keyHandler = null;

      function removeKeyHandler() {
        if (keyHandler) {
          document.removeEventListener("keydown", keyHandler);
          keyHandler = null;
        }
      }

      function render() {
        removeKeyHandler();
        if (currentIndex >= normalizedCards.length) {
          container.innerHTML = `
            <div class="flashcard-done" role="status" aria-live="polite">
              <h3>✓ Flashcards concluídos!</h3>
              <p>Você revisou todos os ${normalizedCards.length} flashcards deste módulo.</p>
              <button class="btn-ghost with-top-gap" onclick="location.reload()">Repetir</button>
            </div>`;
          return;
        }

        const card = normalizedCards[currentIndex];
        const isDue = Flashcards.isDue(card.id);
        const progressPercent = Math.round(
          ((currentIndex + 1) / normalizedCards.length) * 100,
        );

        container.innerHTML = `
          <div class="flashcard-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progressPercent}" aria-label="Progresso dos flashcards">
            <div class="fill" style="width:${progressPercent}%"></div>
          </div>
          <p class="flashcard-progress-info" aria-live="polite">Flashcard ${currentIndex + 1} de ${normalizedCards.length}${isDue ? "" : " · próxima revisão agendada"}</p>
          <div class="flashcard-container">
            <div class="flashcard" id="fc-card" tabindex="0" role="button" aria-expanded="false" aria-label="Virar flashcard para ver a resposta">
              <div class="flashcard-front">
                <div class="card-side-label">Pergunta</div>
                <div class="flashcard-question">${card.question}</div>
                <div class="flashcard-hint">Clique para ver a resposta</div>
              </div>
              <div class="flashcard-back">
                <div class="card-side-label">Resposta</div>
                <div class="flashcard-answer">${card.answer}</div>
              </div>
            </div>
          </div>
          <div class="flashcard-actions is-hidden" id="fc-actions" role="group" aria-label="Avalie sua resposta">
            <button class="btn-flashcard no" data-q="0"><kbd>1</kbd> Não sei</button>
            <button class="btn-flashcard maybe" data-q="3"><kbd>2</kbd> Mais ou menos</button>
            <button class="btn-flashcard yes" data-q="5"><kbd>3</kbd> Sei bem</button>
          </div>
        `;

        const cardEl = document.getElementById("fc-card");
        const actionsEl = document.getElementById("fc-actions");
        isFlipped = false;

        cardEl.addEventListener("click", () => {
          if (!isFlipped) {
            cardEl.classList.add("flipped");
            cardEl.setAttribute("aria-expanded", "true");
            actionsEl.classList.remove("is-hidden");
            isFlipped = true;
          }
        });

        cardEl.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          cardEl.click();
        });

        actionsEl.querySelectorAll(".btn-flashcard").forEach((button) => {
          button.addEventListener("click", () => {
            const quality = parseInt(button.dataset.q, 10);
            Flashcards.saveResult(card.id, quality);
            currentIndex++;
            render();
          });
        });

        keyHandler = (event) => {
          if (!isFlipped) return;
          const qualityMap = { "1": 0, "2": 3, "3": 5 };
          if (qualityMap[event.key] !== undefined) {
            event.preventDefault();
            const btn = actionsEl.querySelector(`[data-q="${qualityMap[event.key]}"]`);
            if (btn) btn.click();
          }
        };
        document.addEventListener("keydown", keyHandler);
      }

      render();
    },

    initInfinite(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      function getAllCards() {
        const mods = (global.LinuxWikiData || {}).modules || {};
        const cards = [];
        Object.values(mods).forEach(function (mod) {
          (mod.flashcards || []).forEach(function (fc) {
            cards.push({ id: fc.id, question: fc.question, answer: fc.answer, moduleTitle: mod.title });
          });
        });
        return cards;
      }

      function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
      }

      let deck = shuffle(getAllCards());
      let idx = 0;
      let total = 0;
      let correct = 0;
      let isFlipped = false;
      let stopped = false;
      let keyHandler = null;

      function removeKeyHandler() {
        if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
      }

      function renderStopped() {
        removeKeyHandler();
        container.innerHTML = `
          <div class="flashcard-done">
            <h3>Sessão encerrada</h3>
            <p>Você revisou <strong>${total}</strong> flashcard${total !== 1 ? 's' : ''} nesta sessão.</p>
            <p style="color:var(--text-muted);font-size:0.9rem;">${correct} sabia bem · ${total - correct} para reforçar</p>
            <button class="btn-ghost with-top-gap" onclick="location.reload()">Nova sessão</button>
          </div>`;
      }

      function renderCard() {
        removeKeyHandler();
        if (stopped) { renderStopped(); return; }
        if (idx >= deck.length) { deck = shuffle(deck); idx = 0; }
        const card = deck[idx];
        isFlipped = false;
        container.innerHTML = `
          <div class="inf-session-bar">
            <div class="inf-session-info">
              <span class="inf-count"><strong>${total}</strong> revisados</span>
              <span class="inf-correct">${correct} certos</span>
              <span class="inf-module-tag">${card.moduleTitle}</span>
            </div>
            <button class="btn-stop-infinite" id="btn-stop-inf">&#9632; Parar</button>
          </div>
          <div class="flashcard-container">
            <div class="flashcard" id="fc-inf-card" tabindex="0" role="button" aria-expanded="false" aria-label="Virar flashcard">
              <div class="flashcard-front">
                <div class="card-side-label">Pergunta</div>
                <div class="flashcard-question">${card.question}</div>
                <div class="flashcard-hint">Clique para ver a resposta</div>
              </div>
              <div class="flashcard-back">
                <div class="card-side-label">Resposta</div>
                <div class="flashcard-answer">${card.answer}</div>
              </div>
            </div>
          </div>
          <div class="flashcard-actions is-hidden" id="fc-inf-actions">
            <button class="btn-flashcard no" data-q="0"><kbd>1</kbd> Não sei</button>
            <button class="btn-flashcard maybe" data-q="3"><kbd>2</kbd> Mais ou menos</button>
            <button class="btn-flashcard yes" data-q="5"><kbd>3</kbd> Sei bem</button>
          </div>`;

        const cardEl = document.getElementById('fc-inf-card');
        const actionsEl = document.getElementById('fc-inf-actions');

        document.getElementById('btn-stop-inf').addEventListener('click', function () {
          stopped = true; renderStopped();
        });

        cardEl.addEventListener('click', function () {
          if (!isFlipped) {
            cardEl.classList.add('flipped');
            cardEl.setAttribute('aria-expanded', 'true');
            actionsEl.classList.remove('is-hidden');
            isFlipped = true;
          }
        });

        cardEl.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cardEl.click(); }
        });

        actionsEl.querySelectorAll('.btn-flashcard').forEach(function (btn) {
          btn.addEventListener('click', function () {
            const q = parseInt(btn.dataset.q, 10);
            Flashcards.saveResult(card.id, q);
            idx++; total++;
            if (q >= 3) correct++;
            renderCard();
          });
        });

        keyHandler = function (e) {
          if (!isFlipped) return;
          const map = { '1': 0, '2': 3, '3': 5 };
          if (map[e.key] !== undefined) {
            e.preventDefault();
            actionsEl.querySelector(`[data-q="${map[e.key]}"]`)?.click();
          }
        };
        document.addEventListener('keydown', keyHandler);
      }

      if (deck.length === 0) {
        container.innerHTML = '<p class="search-no-results">Nenhum flashcard encontrado.</p>';
        return;
      }
      renderCard();
    },
  };

  LinuxWiki.Flashcards = Flashcards;
})(globalThis);
