(function (global) {
  'use strict';

  const LinuxWiki = global.LinuxWiki || (global.LinuxWiki = {});
  const dataRoot = global.LinuxWikiData || (global.LinuxWikiData = { modules: {} });
  let cachedModules = null;

  function normalizeFlashcards(cards, moduleId) {
    return (cards || []).map((card, index) => ({
      id: card.id || `${moduleId}-${index + 1}`,
      question: card.question || card.front || '',
      answer: card.answer || card.back || ''
    }));
  }

  function buildModule(rawModule) {
    const module = { ...rawModule };
    module.flashcards = normalizeFlashcards(rawModule.flashcards, rawModule.id);
    module.quiz = rawModule.quiz || [];
    module.flashcardIds = module.flashcards.map(card => card.id);
    return module;
  }

  function getModules() {
    if (!cachedModules) {
      cachedModules = Object.values(dataRoot.modules || {}).map(buildModule);
    }
    return cachedModules.slice();
  }

  function getModule(moduleId) {
    return getModules().find(module => module.id === moduleId) || null;
  }

  function getModuleNames() {
    return Object.fromEntries(getModules().map(module => [module.id, module.title]));
  }

  function getPrecacheUrls() {
    const staticUrls = [
      './',
      './index.html',
      './styles/main.css',
      './scripts/catalog.js',
      './scripts/storage.js',
      './scripts/progress.js',
      './scripts/flashcards.js',
      './scripts/quiz.js',
      './scripts/terminal.js',
      './scripts/pwa.js',
      './scripts/main.js',
      './scripts/search.js',
      './data/modules/index.js',
      './manifest.json',
      './404.html',
      './pages/revisao.html',
      './pages/simulado.html',
      './pages/exercicios.html',
      './pages/resumos.html',
      './icons/favicon.svg',
      './icons/icon-192.png',
      './icons/icon-512.png'
    ];

    return staticUrls.concat(getModules().map(module => `./${module.path}`));
  }

  LinuxWiki.Catalog = {
    getModules,
    getModule,
    getModuleNames,
    getPrecacheUrls
  };
})(globalThis);
