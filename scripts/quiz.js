(function (global) {
  "use strict";

  const LinuxWiki = global.LinuxWiki || (global.LinuxWiki = {});
  const Storage = LinuxWiki.Storage;

  LinuxWiki.Quiz = {
    initWidget(questions, moduleId) {
      const container = document.getElementById("quiz-widget");
      if (!container || !questions?.length) return;

      let current = 0;
      let score = 0;
      let answered = false;
      const wrongs = [];

      const render = () => {
        if (current >= questions.length) {
          const pct = Math.round((score / questions.length) * 100);
          let breakdown = "";

          if (wrongs.length) {
            breakdown = `<div class="quiz-result-breakdown"><strong>Questões erradas:</strong><br>${wrongs.map((item) => `• ${item}`).join("<br>")}</div>`;
          }

          container.innerHTML = `
            <div class="quiz-result" role="status" aria-live="polite">
              <div class="quiz-result-score">${score}/${questions.length}</div>
              <div class="quiz-result-label">${pct >= 80 ? "🎉 Excelente domínio do conteúdo!" : pct >= 60 ? "👍 Bom resultado — revise os pontos fracos." : "📚 Revise o módulo e tente novamente."}</div>
              ${breakdown}
              <button class="btn-retry-quiz" id="quiz-retry">Tentar novamente</button>
            </div>`;

          const retryBtn = document.getElementById("quiz-retry");
          if (retryBtn) {
            retryBtn.addEventListener("click", () =>
              this.initWidget(questions, moduleId),
            );
          }

          Storage.set((data) => {
            data.quizScores[moduleId] = {
              score,
              total: questions.length,
              date: new Date().toISOString().slice(0, 10),
            };
            return data;
          });
          return;
        }

        const question = questions[current];
        answered = false;
        const progressPercent = Math.round(
          ((current + 1) / questions.length) * 100,
        );

        container.innerHTML = `
          <div class="quiz-container">
            <div class="quiz-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progressPercent}" aria-label="Progresso do quiz">
              <div class="fill" style="width:${progressPercent}%"></div>
            </div>
            <div class="quiz-header">
              <span class="quiz-counter">Questão ${current + 1} de ${questions.length}</span>
              <span class="quiz-score">Pontos: ${score}</span>
            </div>
            <div class="quiz-body">
              <div class="quiz-question">${question.question}</div>
              <div class="quiz-options">
                ${question.options
                  .map(
                    (option, index) => `
                  <button class="quiz-option" data-idx="${index}">
                    <span class="quiz-option-letter">${String.fromCharCode(65 + index)}</span>
                    ${option}
                  </button>`,
                  )
                  .join("")}
              </div>
              <div class="quiz-feedback" id="quiz-fb" role="status" aria-live="polite"></div>
            </div>
            <div class="quiz-footer">
              <button class="btn-next-question" id="quiz-next">
                ${current + 1 < questions.length ? "Próxima →" : "Ver resultado →"}
              </button>
            </div>
          </div>`;

        container.querySelectorAll(".quiz-option").forEach((button) => {
          button.addEventListener("click", () => {
            if (answered) return;
            answered = true;
            const idx = parseInt(button.dataset.idx, 10);
            const correct = idx === question.correct;

            if (correct) score++;
            else
              wrongs.push(
                question.question.slice(0, 60) +
                  (question.question.length > 60 ? "…" : ""),
              );

            container
              .querySelectorAll(".quiz-option")
              .forEach((optionButton, optionIndex) => {
                optionButton.disabled = true;
                if (optionIndex === question.correct)
                  optionButton.classList.add("correct");
                else if (optionIndex === idx && !correct)
                  optionButton.classList.add("wrong");
              });

            const feedback = document.getElementById("quiz-fb");
            feedback.className = `quiz-feedback show ${correct ? "correct-fb" : "wrong-fb"}`;
            feedback.innerHTML = `<strong>${correct ? "✓ Correto!" : "✗ Incorreto"}</strong>${question.explanation}`;

            document.getElementById("quiz-next").classList.add("show");
          });
        });

        document.getElementById("quiz-next").addEventListener("click", () => {
          current++;
          render();
        });
      };

      render();
    },

    initSimulado(questions) {
      const startBtn = document.getElementById("btn-start-simulado");
      const simuladoArea = document.getElementById("simulado-area");
      const introArea = document.getElementById("simulado-intro");
      if (!startBtn || !simuladoArea || !questions?.length) return;

      let current = 0;
      let score = 0;
      let timerInterval = null;
      let secondsLeft = 30 * 60;
      const userAnswers = [];

      function startTimer() {
        const timerEl = document.getElementById("simulado-timer");
        timerInterval = setInterval(() => {
          secondsLeft--;
          const minutes = Math.floor(secondsLeft / 60)
            .toString()
            .padStart(2, "0");
          const seconds = (secondsLeft % 60).toString().padStart(2, "0");

          if (timerEl) {
            timerEl.textContent = `${minutes}:${seconds}`;
            timerEl.className =
              "timer-display" +
              (secondsLeft < 300
                ? " danger"
                : secondsLeft < 600
                  ? " warning"
                  : "");
          }

          if (secondsLeft <= 0) {
            clearInterval(timerInterval);
            showResult();
          }
        }, 1000);
      }

      function showResult() {
        clearInterval(timerInterval);
        const pct = Math.round((score / questions.length) * 100);
        const breakdown = {};

        questions.forEach((question, index) => {
          const module = question.module || "Geral";
          if (!breakdown[module]) breakdown[module] = { total: 0, correct: 0 };
          breakdown[module].total++;
          if (userAnswers[index] === question.correct)
            breakdown[module].correct++;
        });

        const breakdownHtml = Object.entries(breakdown)
          .map(([module, result]) => {
            const modulePct = Math.round((result.correct / result.total) * 100);
            const cls =
              modulePct >= 75 ? "good" : modulePct >= 50 ? "ok" : "bad";
            return `<div class="breakdown-item"><div class="breakdown-module">${module}</div><div class="breakdown-score ${cls}">${result.correct}/${result.total}</div></div>`;
          })
          .join("");

        simuladoArea.innerHTML = `
          <div class="quiz-result" role="status" aria-live="polite">
            <div class="quiz-result-score">${score}/${questions.length}</div>
            <div class="quiz-result-label">${pct >= 75 ? "🎉 Aprovado! Excelente resultado." : pct >= 50 ? "📚 Precisa revisar alguns tópicos." : "📖 Continue estudando — você chega lá!"}</div>
            <div class="simulado-result-breakdown">${breakdownHtml}</div>
            <button class="btn-start-simulado with-top-gap" onclick="location.reload()">Tentar novamente</button>
          </div>`;
      }

      const renderQuestion = () => {
        if (current >= questions.length) {
          showResult();
          return;
        }

        const question = questions[current];
        const progressEl = document.getElementById("simulado-progress");
        if (progressEl)
          progressEl.textContent = `${current + 1} / ${questions.length}`;
        const progressPercent = Math.round(
          ((current + 1) / questions.length) * 100,
        );

        simuladoArea.innerHTML = `
          <div class="quiz-container">
            <div class="quiz-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progressPercent}" aria-label="Progresso do simulado">
              <div class="fill" style="width:${progressPercent}%"></div>
            </div>
            <div class="quiz-header">
              <span class="quiz-counter">Questão ${current + 1} de ${questions.length}</span>
              <span class="quiz-score">${score} pontos</span>
            </div>
            <div class="quiz-body">
              <div class="quiz-question">${question.question}</div>
              <div class="quiz-options">
                ${question.options.map((option, index) => `<button class="quiz-option" data-idx="${index}"><span class="quiz-option-letter">${String.fromCharCode(65 + index)}</span>${option}</button>`).join("")}
              </div>
              <div class="quiz-feedback" id="sim-fb" role="status" aria-live="polite"></div>
            </div>
            <div class="quiz-footer">
              <button class="btn-next-question" id="sim-next">${current + 1 < questions.length ? "Próxima →" : "Ver resultado →"}</button>
            </div>
          </div>`;

        let answered = false;

        simuladoArea.querySelectorAll(".quiz-option").forEach((button) => {
          button.addEventListener("click", () => {
            if (answered) return;
            answered = true;
            const idx = parseInt(button.dataset.idx, 10);
            userAnswers[current] = idx;
            const correct = idx === question.correct;

            if (correct) score++;

            simuladoArea
              .querySelectorAll(".quiz-option")
              .forEach((optionButton, optionIndex) => {
                optionButton.disabled = true;
                if (optionIndex === question.correct)
                  optionButton.classList.add("correct");
                else if (optionIndex === idx && !correct)
                  optionButton.classList.add("wrong");
              });

            const feedback = document.getElementById("sim-fb");
            feedback.className = `quiz-feedback show ${correct ? "correct-fb" : "wrong-fb"}`;
            feedback.innerHTML = `<strong>${correct ? "✓ Correto!" : "✗ Incorreto"}</strong>${question.explanation}`;
            document.getElementById("sim-next").classList.add("show");
          });
        });

        document.getElementById("sim-next").addEventListener("click", () => {
          current++;
          renderQuestion();
        });
      };

      startBtn.addEventListener("click", () => {
        if (introArea) introArea.classList.add("is-hidden");
        startBtn.style.display = "none";
        simuladoArea.classList.remove("is-hidden");
        simuladoArea.style.display = "block";
        startTimer();
        renderQuestion();
      });
    },
  };
})(globalThis);
