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

      const allCards = this.normalizeCards(cards, moduleId);
      const dueCards = allCards.filter((c) => Flashcards.isDue(c.id));
      const upcomingCards = allCards.filter((c) => !Flashcards.isDue(c.id));
      const hasDue = dueCards.length > 0;

      let normalizedCards = hasDue ? dueCards : allCards;
      let showingUpcoming = !hasDue;
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
          if (hasDue && !showingUpcoming && upcomingCards.length > 0) {
            container.innerHTML = `
              <div class="flashcard-done" role="status" aria-live="polite">
                <h3>✓ Revisão de hoje concluída!</h3>
                <p>Você revisou os <strong>${dueCards.length}</strong> card${dueCards.length !== 1 ? "s" : ""} que venciam hoje.</p>
                <p class="flashcard-sm2-note">${upcomingCards.length} card${upcomingCards.length !== 1 ? "s" : ""} com revisão futura agendada pelo SM-2.</p>
                <button class="btn-ghost with-top-gap" id="fc-see-upcoming">Ver os ${upcomingCards.length} restantes →</button>
              </div>`;
            document.getElementById("fc-see-upcoming")?.addEventListener("click", () => {
              normalizedCards = upcomingCards;
              showingUpcoming = true;
              currentIndex = 0;
              isFlipped = false;
              render();
            });
            return;
          }

          container.innerHTML = `
            <div class="flashcard-done" role="status" aria-live="polite">
              <h3>✓ Flashcards concluídos!</h3>
              <p>Você revisou todos os ${allCards.length} flashcards deste módulo.</p>
              <button class="btn-ghost with-top-gap" onclick="location.reload()">Repetir</button>
            </div>`;
          return;
        }

        const card = normalizedCards[currentIndex];
        const progressPercent = Math.round(
          ((currentIndex + 1) / normalizedCards.length) * 100,
        );
        const totalLabel = hasDue && !showingUpcoming
          ? `${currentIndex + 1} de ${dueCards.length} · vencidos hoje`
          : `${currentIndex + 1} de ${normalizedCards.length}`;
        const upcomingNotice = showingUpcoming && !hasDue
          ? `<div class="flashcard-sm2-notice">Todos os cards estão em dia — revisando para fixar o conteúdo.</div>`
          : "";

        container.innerHTML = `
          ${upcomingNotice}
          <div class="flashcard-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progressPercent}" aria-label="Progresso dos flashcards">
            <div class="fill" style="width:${progressPercent}%"></div>
          </div>
          <p class="flashcard-progress-info" aria-live="polite">Flashcard ${totalLabel}</p>
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
  };

  LinuxWiki.Flashcards = Flashcards;
})(globalThis);
