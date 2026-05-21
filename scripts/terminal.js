(function (global) {
  "use strict";

  const LinuxWiki = global.LinuxWiki || (global.LinuxWiki = {});

  LinuxWiki.Terminal = {
    init(terminalId) {
      const wrapper = document.getElementById(terminalId);
      if (!wrapper) return;

      const output = wrapper.querySelector(".terminal-output");
      const input = wrapper.querySelector(".terminal-input");
      const promptEl = wrapper.querySelector(".terminal-prompt");

      if (!output || !input) return;

      let cwd = "/home/usuario";
      const history = [];
      let histIdx = -1;

      const prompt = () =>
        `<span class="t-prompt">usuario@linuxwiki:${cwd.replace("/home/usuario", "~")}$</span> `;

      const fs = {
        "/home/usuario": {
          type: "dir",
          children: {
            documentos: {
              type: "dir",
              children: {
                "notas.txt": {
                  type: "file",
                  content:
                    "Minhas notas de Linux\nEstudando permissões hoje.\n",
                },
                projetos: { type: "dir", children: {} },
              },
            },
            downloads: {
              type: "dir",
              children: {
                "ubuntu.iso": { type: "file", content: "[arquivo binário]" },
              },
            },
            scripts: {
              type: "dir",
              children: {
                "backup.sh": {
                  type: "file",
                  content:
                    '#!/bin/bash\n# Script de backup\necho "Fazendo backup..."\n',
                },
              },
            },
            ".bashrc": {
              type: "file",
              content:
                '# Configuração do bash\nexport PATH="$HOME/.local/bin:$PATH"\nalias ll="ls -la"\nalias cls="clear"\n',
            },
            ".profile": {
              type: "file",
              content:
                "# Configuração de perfil\n[ -f ~/.bashrc ] && . ~/.bashrc\n",
            },
          },
        },
      };

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

      const commands = {
        help() {
          return `<span class="t-info">Comandos disponíveis:</span>
  ls, pwd, cd, cat, echo, whoami, date, uname, clear, help

<span class="t-out">Dica: use seta ↑ para histórico de comandos.</span>
<span class="t-out">Este é um terminal simulado para prática básica.</span>`;
        },

        ls(args) {
          const target = args[0] || cwd;
          const node = getNode(target);
          if (!node)
            return `<span class="t-err">ls: ${target}: Arquivo ou diretório não encontrado</span>`;
          if (node.type === "file") return target.split("/").pop();

          const showHidden =
            args.includes("-a") || args.includes("-la") || args.includes("-al");
          const longForm =
            args.includes("-l") || args.includes("-la") || args.includes("-al");
          const entries = Object.entries(node.children)
            .filter(([name]) => showHidden || !name.startsWith("."))
            .sort(([left], [right]) => left.localeCompare(right));

          if (!entries.length) return "";

          if (longForm) {
            return entries
              .map(([name, entry]) => {
                const perm = entry.type === "dir" ? "drwxr-xr-x" : "-rw-r--r--";
                const size = entry.type === "dir" ? "4096" : "1024";
                return `${perm} 1 usuario usuario ${size.padStart(5)} Mai 20 10:32 ${renderEntry(name, entry)}`;
              })
              .join("\n");
          }

          return entries
            .map(([name, entry]) => renderEntry(name, entry))
            .join("  ");
        },

        pwd() {
          return cwd;
        },

        cd(args) {
          const target = args[0] || "/home/usuario";
          const abs = resolvePath(target);
          const node = getNode(abs);
          if (!node)
            return `<span class="t-err">cd: ${target}: Arquivo ou diretório não encontrado</span>`;
          if (node.type !== "dir")
            return `<span class="t-err">cd: ${target}: Não é um diretório</span>`;
          cwd = abs;
          if (promptEl) promptEl.innerHTML = prompt();
          return "";
        },

        cat(args) {
          if (!args[0])
            return '<span class="t-err">cat: operando ausente</span>';
          const node = getNode(args[0]);
          if (!node)
            return `<span class="t-err">cat: ${args[0]}: Arquivo ou diretório não encontrado</span>`;
          if (node.type === "dir")
            return `<span class="t-err">cat: ${args[0]}: É um diretório</span>`;
          return node.content
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        },

        echo(args) {
          return args
            .join(" ")
            .replace(/\$USER/g, "usuario")
            .replace(/\$HOME/g, "/home/usuario")
            .replace(/\$PWD/g, cwd);
        },

        whoami() {
          return "usuario";
        },

        date() {
          return new Date().toString();
        },

        uname(args) {
          if (args.includes("-a"))
            return "Linux linuxwiki 5.15.0 #1 SMP x86_64 GNU/Linux";
          if (args.includes("-r")) return "5.15.0";
          return "Linux";
        },

        clear() {
          output.innerHTML = "";
          return null;
        },

        history() {
          return history
            .slice(-20)
            .map(
              (command, index) =>
                `${String(index + 1).padStart(4)}  ${command}`,
            )
            .join("\n");
        },
      };

      const commandNames = Object.keys(commands).sort();

      function renderEntry(name, entry) {
        if (entry.type === "dir") return `<span class="t-dir">${name}/</span>`;
        if (name.endsWith(".sh")) return `<span class="t-exe">${name}</span>`;
        return name;
      }

      function writeLine(html, cls = "") {
        const line = document.createElement("div");
        line.className = "t-line" + (cls ? ` ${cls}` : "");
        line.innerHTML = html;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
      }

      function classifyResult(command, result) {
        if (!result) return "";
        if (command === "help") return "t-state-help";
        if (result.includes("t-err")) return "t-state-error";
        if (result.includes("t-info")) return "t-state-info";
        return "";
      }

      function runCommand(raw) {
        const trimmed = raw.trim();
        if (!trimmed) return;
        history.push(trimmed);
        histIdx = history.length;

        writeLine(
          prompt() +
            `<span class="t-cmd">${trimmed.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>`,
        );

        const parts = trimmed.split(/\s+/);
        const command = parts[0];
        const args = parts.slice(1);

        if (commands[command]) {
          const result = commands[command](args);
          if (result !== null && result !== "")
            writeLine(
              result,
              `t-out ${classifyResult(command, result)}`.trim(),
            );
        } else {
          writeLine(
            `<span class="t-err">bash: ${command}: command not found</span>`,
            "t-state-error",
          );
        }
      }

      writeLine(
        '<span class="t-info">LinuxWiki Terminal Simulado</span>',
        "t-state-info",
      );
      writeLine(
        '<span class="t-out">Digite <strong>help</strong> para ver os comandos disponíveis.</span>',
        "t-state-help",
      );
      writeLine("");

      if (promptEl) promptEl.innerHTML = prompt();

      input.addEventListener("keydown", (event) => {
        if (event.key === "Tab") {
          event.preventDefault();
          const raw = input.value.trim();
          if (!raw || raw.includes(" ")) return;
          const matches = commandNames.filter((name) => name.startsWith(raw));
          if (matches.length === 1) {
            input.value = `${matches[0]} `;
          } else if (matches.length > 1) {
            writeLine(
              `<span class="t-info">Sugestões:</span> ${matches.join(", ")}`,
              "t-state-help",
            );
          }
          return;
        }

        if (event.key === "Enter") {
          const value = input.value;
          input.value = "";
          runCommand(value);
          return;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          if (histIdx > 0) {
            histIdx--;
            input.value = history[histIdx] || "";
          }
          return;
        }

        if (event.key === "ArrowDown") {
          event.preventDefault();
          if (histIdx < history.length - 1) {
            histIdx++;
            input.value = history[histIdx] || "";
          } else {
            histIdx = history.length;
            input.value = "";
          }
          return;
        }

        if (event.key === "l" && event.ctrlKey) {
          event.preventDefault();
          output.innerHTML = "";
        }
      });

      wrapper.addEventListener("click", () => input.focus());
    },
  };
})(globalThis);
