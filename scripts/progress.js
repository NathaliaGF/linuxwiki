(function (global) {
  'use strict';

  const LinuxWiki = global.LinuxWiki || (global.LinuxWiki = {});
  const Storage = LinuxWiki.Storage;
  const Catalog = LinuxWiki.Catalog;

  LinuxWiki.Progress = {
    getModuleIds() {
      return Catalog.getModules().map(module => module.id);
    },

    getModuleProgress(moduleId) {
      const data = Storage.get();
      return data.progress[moduleId] || { sections: [], percent: 0 };
    },

    markSection(moduleId, sectionId) {
      Storage.set(data => {
        if (!data.progress[moduleId]) {
          data.progress[moduleId] = { sections: [], percent: 0 };
        }
        const progress = data.progress[moduleId];
        if (!progress.sections.includes(sectionId)) {
          progress.sections.push(sectionId);
        }
        return data;
      });
      this.recalc(moduleId);
    },

    unmarkSection(moduleId, sectionId) {
      Storage.set(data => {
        if (data.progress[moduleId]) {
          data.progress[moduleId].sections =
            data.progress[moduleId].sections.filter(section => section !== sectionId);
        }
        return data;
      });
      this.recalc(moduleId);
    },

    isMarked(moduleId, sectionId) {
      return this.getModuleProgress(moduleId).sections.includes(sectionId);
    },

    recalc(moduleId) {
      const allSections = document.querySelectorAll('[data-section]');
      if (!allSections.length) return;

      const total = allSections.length;
      const done = Storage.get().progress[moduleId]?.sections.length || 0;
      const percent = Math.round((done / total) * 100);

      Storage.set(data => {
        if (!data.progress[moduleId]) {
          data.progress[moduleId] = { sections: [], percent: 0 };
        }
        data.progress[moduleId].percent = percent;
        return data;
      });

      this.updateUI(percent);
    },

    updateUI(percent) {
      const bar = document.querySelector('.module-progress-bar .fill');
      if (bar) bar.style.width = `${percent}%`;

      const display = document.getElementById('progress-pct');
      if (display) display.textContent = `${percent}%`;
    },

    overallPercent() {
      const moduleIds = this.getModuleIds();
      if (!moduleIds.length) return 0;

      const data = Storage.get();
      const percents = moduleIds.map(moduleId => data.progress[moduleId]?.percent || 0);
      return Math.round(percents.reduce((sum, value) => sum + value, 0) / percents.length);
    },

    recordStudy(moduleId) {
      Storage.set(data => {
        const today = new Date().toISOString().slice(0, 10);
        const last = data.studyHistory[0];

        if (last && last.date === today) {
          if (!last.modules.includes(moduleId)) {
            last.modules.push(moduleId);
          }
          last.minutes = (last.minutes || 0) + 1;
        } else {
          data.studyHistory.unshift({ date: today, modules: [moduleId], minutes: 1 });
          if (data.studyHistory.length > 30) data.studyHistory.pop();
        }

        return data;
      });
    }
  };
})(globalThis);
