(function (global) {
  "use strict";

  const LinuxWiki = global.LinuxWiki || (global.LinuxWiki = {});

  /* ── Shared factory so both init() and initScenario() use the same logic ── */
  function createTerminal(wrapper, options) {
    options = options || {};

    const output = wrapper.querySelector(".terminal-output");
    const input = wrapper.querySelector(".terminal-input");
    const promptEl = wrapper.querySelector(".terminal-prompt");

    if (!output || !input) return null;

    let cwd = "/home/usuario";
    const cmdHistory = [];
    let histIdx = -1;
    let lastCmd = "";

    /* ── Virtual process table ───────────────────────────────── */
    let processes = [
      { pid: 1,    user: "root",    cpu: 0.0,  mem: 0.1, cmd: "/sbin/init" },
      { pid: 312,  user: "root",    cpu: 0.0,  mem: 0.4, cmd: "/usr/lib/systemd/systemd-journald" },
      { pid: 891,  user: "usuario", cpu: 0.2,  mem: 1.2, cmd: "bash" },
      { pid: 1042, user: "usuario", cpu: 99.8, mem: 0.8, cmd: "stress --cpu 4" },
      { pid: 1105, user: "usuario", cpu: 0.0,  mem: 0.3, cmd: "vim notas.txt" },
    ];

    /* ── Virtual filesystem ──────────────────────────────────── */
    const fs = options.fs || {
      "/home/usuario": {
        type: "dir",
        children: {
          documentos: {
            type: "dir",
            children: {
              "notas.txt": {
                type: "file",
                content: "Minhas notas de Linux\nEstudando permissões hoje.\n",
                perm: "-rw-r--r--",
              },
              projetos: { type: "dir", children: {} },
            },
          },
          downloads: {
            type: "dir",
            children: {
              "ubuntu.iso": { type: "file", content: "[arquivo binário]", perm: "-rw-r--r--" },
            },
          },
          scripts: {
            type: "dir",
            children: {
              "backup.sh": {
                type: "file",
                content: "#!/bin/bash\n# Script de backup\necho \"Fazendo backup...\"\n",
                perm: "-rwxr-xr-x",
              },
            },
          },
          ".bashrc": {
            type: "file",
            content: "# Configuração do bash\nexport PATH=\"$HOME/.local/bin:$PATH\"\nalias ll=\"ls -la\"\nalias cls=\"clear\"\n",
            perm: "-rw-r--r--",
          },
          ".profile": {
            type: "file",
            content: "# Configuração de perfil\n[ -f ~/.bashrc ] && . ~/.bashrc\n",
            perm: "-rw-r--r--",
          },
        },
      },
    };

    /* ── Path helpers ────────────────────────────────────────── */
    function resolvePath(path) {
      if (path === "~") return "/home/usuario";
      if (path.startsWith("~/")) return "/home/usuario/" + path.slice(2);
      if (path.startsWith("/")) return path;
      const parts = (cwd + "/" + path).split("/").filter(Boolean);
      const resolved = [];
      for (const part of parts) {
        if (part === ".") continue;
        if (part === "..") resolved.pop();
        else resolved.push(part);
      }
      return "/" + resolved.join("/");
    }

    function getNode(path) {
      const abs = resolvePath(path);
      if (abs === "/home/usuario") return fs["/home/usuario"];
      const rel = abs.slice("/home/usuario/".length);
      if (!rel) return fs["/home/usuario"];
      const parts = rel.split("/");
      let node = fs["/home/usuario"];
      for (const part of parts) {
        if (!node || node.type !== "dir" || !node.children[part]) return null;
        node = node.children[part];
      }
      return node;
    }

    function getParentAndName(path) {
      const abs = resolvePath(path);
      const parts = abs.split("/");
      const name = parts.pop();
      const parentPath = parts.join("/") || "/";
      const parent = getNode(parentPath);
      return { parent, name, abs };
    }

    const prompt = () =>
      `<span class="t-prompt">usuario@linuxwiki:${cwd.replace("/home/usuario", "~")}$</span> `;

    function renderEntry(name, entry) {
      if (entry.type === "dir") return `<span class="t-dir">${name}/</span>`;
      if (name.endsWith(".sh")) return `<span class="t-exe">${name}</span>`;
      return name;
    }

    /* ── Man pages ───────────────────────────────────────────── */
    const manPages = {
      ls: "ls — lista conteúdo de diretórios. Uso: ls [-la] [dir]",
      pwd: "pwd — exibe o diretório atual. Uso: pwd",
      cd: "cd — muda o diretório. Uso: cd [dir]",
      cat: "cat — exibe conteúdo de arquivos. Uso: cat <arquivo>",
      echo: "echo — exibe texto. Uso: echo [texto]",
      mkdir: "mkdir — cria diretório. Uso: mkdir <dir>",
      touch: "touch — cria arquivo vazio ou atualiza timestamp. Uso: touch <arquivo>",
      rm: "rm — remove arquivos ou diretórios. Uso: rm [-r] <caminho>",
      cp: "cp — copia arquivo. Uso: cp <origem> <destino>",
      mv: "mv — move ou renomeia. Uso: mv <origem> <destino>",
      chmod: "chmod — altera permissões. Uso: chmod <modo> <arquivo>",
      grep: "grep — busca padrão em arquivo. Uso: grep <padrão> <arquivo>",
      head: "head — primeiras N linhas. Uso: head [-n N] <arquivo>",
      tail: "tail — últimas N linhas. Uso: tail [-n N] <arquivo>",
      wc: "wc — conta linhas/palavras/chars. Uso: wc [-l|-w|-c] <arquivo>",
      find: "find — busca arquivos. Uso: find <dir> [-name padrão]",
      df: "df — uso de disco. Uso: df -h",
      free: "free — uso de memória. Uso: free -h",
      uptime: "uptime — tempo de atividade do sistema.",
      ps: "ps — lista processos. Uso: ps [aux]",
      kill: "kill — encerra processo. Uso: kill [-9] <pid>",
      top: "top — monitor de processos em tempo real.",
      man: "man — exibe manual de um comando. Uso: man <cmd>",
      whoami: "whoami — exibe o usuário atual.",
      date: "date — exibe data e hora atuais.",
      uname: "uname — informações do sistema. Uso: uname [-a|-r]",
      clear: "clear — limpa o terminal.",
      history: "history — exibe histórico de comandos.",
    };

    /* ── Commands ────────────────────────────────────────────── */
    const commands = {
      help() {
        return `<span class="t-info">Comandos disponíveis:</span>
  ls, pwd, cd, cat, echo, whoami, date, uname, clear, history
  mkdir, touch, rm, cp, mv, chmod, grep, head, tail, wc
  find, df, free, uptime, ps, kill, top, man

<span class="t-out">Dica: use seta ↑ para histórico · Tab para autocompletar</span>`;
      },

      ls(args) {
        const flagArgs = args.filter(a => a.startsWith("-"));
        const pathArgs = args.filter(a => !a.startsWith("-"));
        const target = pathArgs[0] || cwd;
        const node = getNode(target);
        if (!node)
          return `<span class="t-err">ls: ${target}: Arquivo ou diretório não encontrado</span>`;
        if (node.type === "file") return target.split("/").pop();

        const showHidden = flagArgs.some(f => f.includes("a"));
        const longForm = flagArgs.some(f => f.includes("l"));

        const entries = Object.entries(node.children)
          .filter(([name]) => showHidden || !name.startsWith("."))
          .sort(([a], [b]) => a.localeCompare(b));

        if (!entries.length) return "";

        if (longForm) {
          return entries.map(([name, entry]) => {
            const perm = entry.perm || (entry.type === "dir" ? "drwxr-xr-x" : "-rw-r--r--");
            const size = entry.type === "dir" ? "4096" : String((entry.content || "").length).padStart(5);
            return `${perm} 1 usuario usuario ${size} Mai 20 10:32 ${renderEntry(name, entry)}`;
          }).join("\n");
        }

        return entries.map(([name, entry]) => renderEntry(name, entry)).join("  ");
      },

      pwd() { return cwd; },

      cd(args) {
        const target = args[0] || "/home/usuario";
        const abs = resolvePath(target);
        const node = getNode(abs);
        if (!node) return `<span class="t-err">cd: ${target}: Arquivo ou diretório não encontrado</span>`;
        if (node.type !== "dir") return `<span class="t-err">cd: ${target}: Não é um diretório</span>`;
        cwd = abs;
        if (promptEl) promptEl.innerHTML = prompt();
        return "";
      },

      cat(args) {
        if (!args[0]) return '<span class="t-err">cat: operando ausente</span>';
        const node = getNode(args[0]);
        if (!node) return `<span class="t-err">cat: ${args[0]}: Arquivo ou diretório não encontrado</span>`;
        if (node.type === "dir") return `<span class="t-err">cat: ${args[0]}: É um diretório</span>`;
        return node.content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      },

      echo(args) {
        return args.join(" ")
          .replace(/\$USER/g, "usuario")
          .replace(/\$HOME/g, "/home/usuario")
          .replace(/\$PWD/g, cwd);
      },

      whoami() { return "usuario"; },

      date() { return new Date().toString(); },

      uname(args) {
        if (args.includes("-a")) return "Linux linuxwiki 5.15.0 #1 SMP x86_64 GNU/Linux";
        if (args.includes("-r")) return "5.15.0";
        return "Linux";
      },

      clear() { output.innerHTML = ""; return null; },

      history() {
        return cmdHistory.slice(-20)
          .map((cmd, i) => `${String(i + 1).padStart(4)}  ${cmd}`)
          .join("\n");
      },

      /* ── New commands ─────────────────────────────────────── */

      mkdir(args) {
        if (!args[0]) return '<span class="t-err">mkdir: operando ausente</span>';
        const { parent, name } = getParentAndName(args[0]);
        if (!parent || parent.type !== "dir")
          return `<span class="t-err">mkdir: ${args[0]}: Diretório pai não encontrado</span>`;
        if (parent.children[name])
          return `<span class="t-err">mkdir: ${args[0]}: Arquivo já existe</span>`;
        parent.children[name] = { type: "dir", children: {} };
        return "";
      },

      touch(args) {
        if (!args[0]) return '<span class="t-err">touch: operando ausente</span>';
        const { parent, name } = getParentAndName(args[0]);
        if (!parent || parent.type !== "dir")
          return `<span class="t-err">touch: ${args[0]}: Diretório pai não encontrado</span>`;
        if (!parent.children[name]) {
          parent.children[name] = { type: "file", content: "", perm: "-rw-r--r--" };
        }
        return "";
      },

      rm(args) {
        const flags = args.filter(a => a.startsWith("-"));
        const paths = args.filter(a => !a.startsWith("-"));
        if (!paths[0]) return '<span class="t-err">rm: operando ausente</span>';
        const recursive = flags.some(f => f.includes("r") || f.includes("R") || f.includes("f"));
        const { parent, name } = getParentAndName(paths[0]);
        if (!parent || !parent.children[name])
          return `<span class="t-err">rm: ${paths[0]}: Arquivo ou diretório não encontrado</span>`;
        const node = parent.children[name];
        if (node.type === "dir" && !recursive)
          return `<span class="t-err">rm: ${paths[0]}: é um diretório (use -r)</span>`;
        delete parent.children[name];
        return "";
      },

      cp(args) {
        const flags = args.filter(a => a.startsWith("-"));
        const paths = args.filter(a => !a.startsWith("-"));
        if (paths.length < 2) return '<span class="t-err">cp: operandos insuficientes</span>';
        const [src, dst] = paths;
        const srcNode = getNode(src);
        if (!srcNode) return `<span class="t-err">cp: ${src}: Arquivo não encontrado</span>`;
        if (srcNode.type === "dir") return `<span class="t-err">cp: ${src}: É um diretório (use -r)</span>`;
        const { parent, name } = getParentAndName(dst);
        if (!parent || parent.type !== "dir")
          return `<span class="t-err">cp: ${dst}: Destino inválido</span>`;
        parent.children[name] = { type: "file", content: srcNode.content, perm: srcNode.perm || "-rw-r--r--" };
        return "";
      },

      mv(args) {
        const paths = args.filter(a => !a.startsWith("-"));
        if (paths.length < 2) return '<span class="t-err">mv: operandos insuficientes</span>';
        const [src, dst] = paths;
        const srcInfo = getParentAndName(src);
        if (!srcInfo.parent || !srcInfo.parent.children[srcInfo.name])
          return `<span class="t-err">mv: ${src}: Arquivo não encontrado</span>`;
        const srcNode = srcInfo.parent.children[srcInfo.name];
        const dstInfo = getParentAndName(dst);
        if (!dstInfo.parent || dstInfo.parent.type !== "dir")
          return `<span class="t-err">mv: ${dst}: Destino inválido</span>`;
        dstInfo.parent.children[dstInfo.name] = srcNode;
        delete srcInfo.parent.children[srcInfo.name];
        return "";
      },

      chmod(args) {
        const paths = args.filter(a => !a.startsWith("-"));
        if (paths.length < 2) return '<span class="t-err">chmod: operandos insuficientes</span>';
        const [mode, target] = paths;
        const node = getNode(target);
        if (!node) return `<span class="t-err">chmod: ${target}: Arquivo ou diretório não encontrado</span>`;

        /* Convert octal mode to permission string */
        function octalToPerm(oct, isDir) {
          const val = parseInt(oct, 8);
          if (isNaN(val)) return null;
          const chars = ["---", "--x", "-w-", "-wx", "r--", "r-x", "rw-", "rwx"];
          const prefix = isDir ? "d" : "-";
          return prefix + chars[(val >> 6) & 7] + chars[(val >> 3) & 7] + chars[val & 7];
        }

        const perm = octalToPerm(mode, node.type === "dir");
        if (perm) {
          node.perm = perm;
        } else {
          /* Symbolic mode fallback: just store the string */
          node.perm = mode;
        }
        return "";
      },

      grep(args) {
        const paths = args.filter(a => !a.startsWith("-"));
        if (paths.length < 2) return '<span class="t-err">grep: uso: grep <padrão> <arquivo></span>';
        const [pattern, filePath] = paths;
        const node = getNode(filePath);
        if (!node) return `<span class="t-err">grep: ${filePath}: Arquivo não encontrado</span>`;
        if (node.type === "dir") return `<span class="t-err">grep: ${filePath}: É um diretório</span>`;
        const lines = node.content.split("\n");
        const matches = lines.filter(l => l.toLowerCase().includes(pattern.toLowerCase()));
        if (!matches.length) return "";
        return matches.map(l => l.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")).join("\n");
      },

      head(args) {
        let n = 10;
        const paths = [];
        for (let i = 0; i < args.length; i++) {
          if (args[i] === "-n" && args[i + 1]) { n = parseInt(args[++i]) || 10; }
          else if (args[i].startsWith("-n")) { n = parseInt(args[i].slice(2)) || 10; }
          else if (!args[i].startsWith("-")) paths.push(args[i]);
        }
        if (!paths[0]) return '<span class="t-err">head: arquivo não especificado</span>';
        const node = getNode(paths[0]);
        if (!node) return `<span class="t-err">head: ${paths[0]}: Arquivo não encontrado</span>`;
        if (node.type === "dir") return `<span class="t-err">head: ${paths[0]}: É um diretório</span>`;
        return node.content.split("\n").slice(0, n).join("\n")
          .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      },

      tail(args) {
        let n = 10;
        const paths = [];
        for (let i = 0; i < args.length; i++) {
          if (args[i] === "-n" && args[i + 1]) { n = parseInt(args[++i]) || 10; }
          else if (args[i].startsWith("-n")) { n = parseInt(args[i].slice(2)) || 10; }
          else if (!args[i].startsWith("-")) paths.push(args[i]);
        }
        if (!paths[0]) return '<span class="t-err">tail: arquivo não especificado</span>';
        const node = getNode(paths[0]);
        if (!node) return `<span class="t-err">tail: ${paths[0]}: Arquivo não encontrado</span>`;
        if (node.type === "dir") return `<span class="t-err">tail: ${paths[0]}: É um diretório</span>`;
        const lines = node.content.split("\n");
        return lines.slice(Math.max(0, lines.length - n)).join("\n")
          .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      },

      wc(args) {
        const flags = args.filter(a => a.startsWith("-"));
        const paths = args.filter(a => !a.startsWith("-"));
        if (!paths[0]) return '<span class="t-err">wc: arquivo não especificado</span>';
        const node = getNode(paths[0]);
        if (!node) return `<span class="t-err">wc: ${paths[0]}: Arquivo não encontrado</span>`;
        if (node.type === "dir") return `<span class="t-err">wc: ${paths[0]}: É um diretório</span>`;
        const content = node.content;
        const lines = content.split("\n").length - 1;
        const words = content.trim() ? content.trim().split(/\s+/).length : 0;
        const chars = content.length;
        if (flags.includes("-l")) return String(lines);
        if (flags.includes("-w")) return String(words);
        if (flags.includes("-c")) return String(chars);
        return `${String(lines).padStart(4)} ${String(words).padStart(4)} ${String(chars).padStart(4)} ${paths[0]}`;
      },

      find(args) {
        const nonFlag = args.filter(a => !a.startsWith("-"));
        const startPath = nonFlag[0] || cwd;
        const nameIdx = args.indexOf("-name");
        const pattern = nameIdx !== -1 ? args[nameIdx + 1] : null;

        const results = [];

        function walk(node, path) {
          if (!node || node.type !== "dir") return;
          Object.entries(node.children).forEach(([name, child]) => {
            const fullPath = path + "/" + name;
            const match = !pattern || name.includes(pattern.replace(/\*/g, ""));
            if (match) results.push(fullPath);
            if (child.type === "dir") walk(child, fullPath);
          });
        }

        const startNode = getNode(startPath);
        if (!startNode) return `<span class="t-err">find: ${startPath}: Não encontrado</span>`;
        walk(startNode, resolvePath(startPath));
        return results.join("\n") || "";
      },

      "df"(args) {
        return `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G   12G   38G  24% /
tmpfs           2,0G     0  2,0G   0% /dev/shm
/dev/sdb1       200G   45G  155G  23% /data`;
      },

      free(args) {
        return `               total        usado        livre
Mem.:           4096         2150         1946
Swap:           2048          128         1920`;
      },

      uptime() {
        return " 14:32:17 up 3 days,  6:44,  1 user,  load average: 1.02, 0.89, 0.78";
      },

      ps(args) {
        const all = args.includes("aux") || args.includes("-aux") || args.join("").includes("a");
        const header = "USER         PID  %CPU %MEM COMMAND";
        const rows = processes.map(p =>
          `${p.user.padEnd(12)} ${String(p.pid).padStart(4)}  ${p.cpu.toFixed(1).padStart(4)} ${p.mem.toFixed(1).padStart(4)} ${p.cmd}`
        );
        return header + "\n" + rows.join("\n");
      },

      kill(args) {
        const flags = args.filter(a => a.startsWith("-"));
        const pids = args.filter(a => !a.startsWith("-")).map(Number);
        if (!pids.length) return '<span class="t-err">kill: especifique um PID</span>';

        const results = [];
        pids.forEach(pid => {
          const idx = processes.findIndex(p => p.pid === pid);
          if (idx === -1) {
            results.push(`<span class="t-err">kill: (${pid}) - Processo não encontrado</span>`);
          } else {
            processes.splice(idx, 1);
          }
        });
        return results.join("\n");
      },

      top() {
        const rows = processes.slice(0, 5).map(p =>
          `${String(p.pid).padStart(5)} ${p.user.padEnd(8)} ${p.cpu.toFixed(1).padStart(5)} ${p.mem.toFixed(1).padStart(4)}  ${p.cmd}`
        );
        return `top - ${new Date().toLocaleTimeString()} up 3 days
Tasks: ${processes.length} total

  PID USER     %CPU  %MEM COMMAND
${rows.join("\n")}`;
      },

      man(args) {
        if (!args[0]) return '<span class="t-err">man: especifique um comando</span>';
        const page = manPages[args[0]];
        if (!page) return `<span class="t-err">man: ${args[0]}: Página de manual não encontrada</span>`;
        return `<span class="t-info">${page}</span>`;
      },
    };

    const commandNames = Object.keys(commands).sort();

    /* ── Output helpers ──────────────────────────────────────── */
    function writeLine(html, cls) {
      const line = document.createElement("div");
      line.className = "t-line" + (cls ? " " + cls : "");
      line.innerHTML = html;
      output.appendChild(line);
      output.scrollTop = output.scrollHeight;
    }

    function classifyResult(cmd, result) {
      if (!result) return "";
      if (cmd === "help") return "t-state-help";
      if (result.includes("t-err")) return "t-state-error";
      if (result.includes("t-info")) return "t-state-info";
      return "";
    }

    /* ── runCommand ──────────────────────────────────────────── */
    function runCommand(raw) {
      const trimmed = raw.trim();
      if (!trimmed) return;
      cmdHistory.push(trimmed);
      histIdx = cmdHistory.length;
      lastCmd = trimmed;

      writeLine(
        prompt() +
          `<span class="t-cmd">${trimmed.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>`
      );

      /* Handle ./script.sh execution */
      if (trimmed.startsWith("./")) {
        const scriptName = trimmed.slice(2).split(" ")[0];
        const node = getNode(scriptName);
        if (node && node.type === "file") {
          const perm = node.perm || "-rw-r--r--";
          if (!perm.includes("x")) {
            writeLine(
              `<span class="t-err">bash: ./${scriptName}: Permissão negada</span>`,
              "t-state-error"
            );
          } else {
            /* Simulate running the script — execute echo lines */
            const lines = node.content.split("\n");
            lines.forEach(line => {
              const m = line.match(/^echo\s+"?(.+?)"?\s*$/);
              if (m) writeLine(m[1], "t-out");
            });
          }
        } else {
          writeLine(
            `<span class="t-err">bash: ./${scriptName}: Arquivo não encontrado</span>`,
            "t-state-error"
          );
        }
      } else {
        const parts = trimmed.split(/\s+/);
        const cmd = parts[0];
        const args = parts.slice(1);

        if (commands[cmd]) {
          const result = commands[cmd](args);
          if (result !== null && result !== "") {
            writeLine(result, ("t-out " + classifyResult(cmd, result)).trim());
          }
        } else {
          writeLine(
            `<span class="t-err">bash: ${cmd}: command not found</span>`,
            "t-state-error"
          );
        }
      }

      /* ── Scenario step validation ────────────────────────── */
      if (scenarioData && currentStep < scenarioData.steps.length) {
        const step = scenarioData.steps[currentStep];
        try {
          if (step.validate(processes, fs, cwd, lastCmd)) {
            currentStep++;
            updateScenarioUI();
            if (currentStep >= scenarioData.steps.length) {
              writeLine(
                '<span class="t-info">✓ Cenário concluído! Parabéns!</span>',
                "t-state-info"
              );
            }
          }
        } catch (e) { /* ignore validation errors */ }
      }
    }

    /* ── Scenario state ──────────────────────────────────────── */
    let scenarioData = null;
    let currentStep = 0;
    let scenarioUI = null;

    function updateScenarioUI() {
      if (!scenarioUI) return;
      const steps = scenarioUI.querySelectorAll(".scenario-step");
      steps.forEach((el, i) => {
        el.classList.toggle("done", i < currentStep);
        el.classList.toggle("active", i === currentStep);
      });

      const hintEl = scenarioUI.querySelector(".scenario-hint");
      if (hintEl) {
        if (currentStep < scenarioData.steps.length) {
          hintEl.textContent = scenarioData.steps[currentStep].hint;
        } else {
          hintEl.textContent = "Todos os passos concluídos!";
        }
      }

      if (currentStep >= scenarioData.steps.length) {
        /* scenarioUI IS the panel div */
        if (scenarioUI && scenarioUI.classList) {
          scenarioUI.classList.add("complete");
        }
      }
    }

    /* ── Key bindings ────────────────────────────────────────── */
    input.addEventListener("keydown", function (e) {
      if (e.key === "Tab") {
        e.preventDefault();
        const raw = input.value.trim();
        if (!raw || raw.includes(" ")) return;
        const matches = commandNames.filter(n => n.startsWith(raw));
        if (matches.length === 1) {
          input.value = matches[0] + " ";
        } else if (matches.length > 1) {
          writeLine(`<span class="t-info">Sugestões:</span> ${matches.join(", ")}`, "t-state-help");
        }
        return;
      }

      if (e.key === "Enter") {
        const value = input.value;
        input.value = "";
        runCommand(value);
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (histIdx > 0) { histIdx--; input.value = cmdHistory[histIdx] || ""; }
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (histIdx < cmdHistory.length - 1) { histIdx++; input.value = cmdHistory[histIdx] || ""; }
        else { histIdx = cmdHistory.length; input.value = ""; }
        return;
      }

      if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        output.innerHTML = "";
      }
    });

    wrapper.addEventListener("click", () => input.focus());

    /* ── Welcome message ─────────────────────────────────────── */
    writeLine('<span class="t-info">LinuxWiki Terminal Simulado</span>', "t-state-info");
    writeLine(
      '<span class="t-out">Digite <strong>help</strong> para ver os comandos disponíveis.</span>',
      "t-state-help"
    );
    writeLine("");

    if (promptEl) promptEl.innerHTML = prompt();

    /* Return interface for scenario mode */
    return {
      setScenario(data, ui) {
        scenarioData = data;
        scenarioUI = ui;
        currentStep = 0;
        updateScenarioUI();
      },
      getFS() { return fs; },
      getProcesses() { return processes; },
    };
  }

  /* ── Public API ──────────────────────────────────────────────── */
  LinuxWiki.Terminal = {
    init(terminalId) {
      const wrapper = document.getElementById(terminalId);
      if (!wrapper) return;
      createTerminal(wrapper, {});
    },

    initScenario(wrapperId, scenario) {
      const wrapper = document.getElementById(wrapperId);
      if (!wrapper) return;

      /* Build scenario UI panel above terminal */
      const container = wrapper.parentElement || wrapper;

      /* Create panel */
      const panel = document.createElement("div");
      panel.className = "scenario-panel";
      panel.innerHTML = `
        <div class="scenario-desc">${scenario.description}</div>
        <div class="scenario-steps-row">
          ${scenario.steps.map((s, i) => `
            <div class="scenario-step" data-step="${i}">
              <span class="scenario-step-num">${i + 1}</span>
              <span class="scenario-step-label">${s.label || ("Passo " + (i + 1))}</span>
            </div>
          `).join("")}
        </div>
        <div class="scenario-hint-row">
          <span class="scenario-hint-icon">💡</span>
          <span class="scenario-hint"></span>
        </div>
      `;

      /* Set up fs from scenario if provided */
      const fsOverride = scenario.fs || undefined;

      /* Insert panel before wrapper */
      wrapper.parentElement.insertBefore(panel, wrapper);

      const terminal = createTerminal(wrapper, { fs: fsOverride });
      if (terminal) {
        terminal.setScenario(scenario, panel);

        /* Apply scenario-specific FS modifications */
        if (scenario.setupFS) {
          scenario.setupFS(terminal.getFS());
        }
      }
    },
  };

})(globalThis);
