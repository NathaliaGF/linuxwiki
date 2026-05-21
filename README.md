# LinuxWiki — Aprenda Linux do Zero

Wiki educacional estática, gratuita e open-source para aprender Linux. Zero paywall, zero cadastro, zero dependências de build.

## Missão

Democratizar o acesso ao conhecimento de Linux ensinando o **porquê** antes do **o quê**. A maioria dos tutoriais é uma lista de comandos. O LinuxWiki ensina por que o Linux funciona como funciona — permissões, processos, filesystem — para que os comandos façam sentido sozinhos.

## Funcionalidades

- **10 módulos** de conteúdo completo com analogias, exemplos e erros comuns
- **60+ flashcards** com algoritmo SM-2 de repetição espaçada
- **50+ questões** de quiz com feedback e explicações
- **Simulado geral** com 30 questões, cronômetro e breakdown por módulo
- **Terminal simulado** em JavaScript (Módulo 05 — Shell)
- **20 exercícios práticos** com cenários reais e soluções comentadas
- **Cheat sheets** imprimíveis de todos os tópicos
- **PWA** — funciona offline após primeira visita
- **Progresso salvo** em localStorage (sem servidor necessário)

## Stack

- HTML5 + CSS3 + JavaScript puro — zero frameworks, zero npm, zero build step
- Compatível com GitHub Pages sem configuração adicional
- PWA com Service Worker para uso offline

## Estrutura de arquivos

```
linuxwiki/
├── index.html              ← página inicial
├── manifest.json           ← PWA manifest
├── sw.js                   ← service worker
├── 404.html                ← página de erro customizada
├── README.md               ← este arquivo
├── styles/
│   └── main.css            ← todo o CSS (sistema de design completo)
├── data/
│   └── modules/
│       └── index.js        ← fonte única dos módulos ativos (flashcards + quizzes)
├── scripts/
│   ├── catalog.js          ← catálogo derivado dos dados dos módulos
│   ├── storage.js          ← persistência em localStorage
│   ├── progress.js         ← progresso e histórico de estudo
│   ├── flashcards.js       ← SM-2 e widget de flashcards
│   ├── quiz.js             ← quiz por módulo + simulado
│   ├── terminal.js         ← terminal simulado
│   ├── pwa.js              ← install prompt + service worker
│   └── main.js             ← bootstrap e cola de UI
├── pages/
│   ├── filosofia.html      ← Módulo 01: Filosofia Linux
│   ├── filesystem.html     ← Módulo 02: Filesystem
│   ├── permissoes.html     ← Módulo 03: Permissões
│   ├── processos.html      ← Módulo 04: Processos
│   ├── shell.html          ← Módulo 05: Shell + terminal simulado
│   ├── systemctl.html      ← Módulo 06: Serviços com systemctl
│   ├── logs.html           ← Módulo 07: Logs com journalctl e /var/log
│   ├── rede-linux.html     ← Módulo 08: Rede no Linux
│   ├── disco.html          ← Módulo 09: Disco
│   ├── troubleshooting.html ← Módulo 10: Troubleshooting Real
│   ├── revisao.html        ← Central de Revisão SM-2
│   ├── simulado.html       ← Simulado Geral (30 questões, 30 min)
│   ├── exercicios.html     ← Exercícios Práticos (20 cenários reais)
│   └── resumos.html        ← Cheat Sheets imprimíveis
└── icons/
    ├── favicon.svg
    ├── icon-192.png
    └── icon-512.png
```

## Deploy no GitHub Pages

### Método 1 — Interface web (mais simples)

1. Crie um repositório público no GitHub (ex: `linuxwiki`)
2. Faça upload de todos os arquivos para a branch `main`
3. Vá em **Settings → Pages → Source → Deploy from a branch**
4. Selecione `main` e pasta `/` (root)
5. Clique em **Save**

O site estará disponível em `https://seu-usuario.github.io/linuxwiki/`

### Método 2 — Git pela linha de comando

```bash
# Na pasta do projeto
git init
git add .
git commit -m "feat: LinuxWiki inicial"

# Criar repositório no GitHub e conectar
git remote add origin https://github.com/SEU_USUARIO/linuxwiki.git
git branch -M main
git push -u origin main

# Ativar GitHub Pages nas configurações do repositório
# Settings → Pages → Source → main → /
```

### Domínio personalizado (opcional)

Crie um arquivo `CNAME` na raiz com o domínio:
```
linuxwiki.com.br
```

## Como contribuir

### Corrigir erros de conteúdo

1. Fork o repositório
2. Edite o arquivo HTML do módulo correspondente
3. Abra um Pull Request descrevendo a correção

### Adicionar um módulo

1. Copie o template de um módulo existente (ex: `filosofia.html`)
2. Atualize o `data-module` no `<body>`
3. Escreva o conteúdo seguindo a estrutura de cards
4. Adicione flashcards e quiz em `data/modules/index.js`
5. Atualize a navegação (`module-nav`) no módulo anterior e próximo
6. Adicione o card do novo módulo no `index.html`
7. O catálogo e o cache passam a enxergar o módulo automaticamente a partir dos dados

### Padrões de código

- Nenhum framework, nenhuma dependência externa (exceto Google Fonts)
- Conteúdo em português do Brasil
- Flashcards com IDs únicos no formato `MOD01-FC-001`
- Sem Lorem ipsum — todo conteúdo deve ser real e educativo
- CSS classes seguem o sistema de design em `main.css`

## Licença

MIT — use, modifique e distribua livremente. Atribuição apreciada mas não obrigatória.

## Projetos relacionados

- **RedesWiki** — wiki educacional gratuita para aprender redes de computadores (em desenvolvimento)

---

*"Tell me and I forget. Teach me and I remember. Involve me and I learn." — Benjamin Franklin*
