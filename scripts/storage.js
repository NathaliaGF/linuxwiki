(function (global) {
  "use strict";

  const LinuxWiki = global.LinuxWiki || (global.LinuxWiki = {});

  LinuxWiki.Storage = {
    KEY: "linuxwiki_data",

    _defaults() {
      return {
        progress: {},
        flashcards: {},
        quizScores: {},
        studyHistory: [],
        favorites: [],
        lastVisit: null,
        readingPositions: {},
        uiPreferences: {},
      };
    },

    load() {
      try {
        const raw = localStorage.getItem(this.KEY);
        return raw
          ? { ...this._defaults(), ...JSON.parse(raw) }
          : this._defaults();
      } catch {
        return this._defaults();
      }
    },

    save(data) {
      try {
        localStorage.setItem(this.KEY, JSON.stringify(data));
      } catch (error) {
        console.warn("LinuxWiki: não foi possível salvar progresso.", error);
      }
    },

    get() {
      return this.load();
    },

    set(updater) {
      const data = this.load();
      const updated = updater(data);
      this.save(updated);
      return updated;
    },

    reset() {
      localStorage.removeItem(this.KEY);
    },

    export() {
      const data = this.load();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `linuxwiki_progresso_${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    },
  };
})(globalThis);
