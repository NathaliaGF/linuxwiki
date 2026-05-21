/**
 * LinuxWiki data registry
 * Conteúdo versionado dos módulos ativos.
 */
(function (global) {
  const root = global.LinuxWikiData || (global.LinuxWikiData = {});
  const modules = root.modules || (root.modules = {});

  modules['filosofia'] = {
    id: 'filosofia',
    title: "Filosofia Linux",
    path: 'pages/filosofia.html',
    flashcards: [
  {
    id: 'FIL-FC-001',
    question: 'O que é o kernel Linux?',
    answer: 'O núcleo do sistema operacional. Gerencia hardware (CPU, memória, disco, rede), processos e o sistema de arquivos. Você não interage com ele diretamente — o shell e os programas fazem isso por você.'
  },
  {
    id: 'FIL-FC-002',
    question: 'Qual a diferença entre kernel e distro?',
    answer: 'O kernel é o núcleo — gerencia o hardware. A distro é o kernel + ferramentas GNU + gerenciador de pacotes + (opcional) interface gráfica. Ubuntu, Fedora e Arch são distros; Linux é o kernel.'
  },
  {
    id: 'FIL-FC-003',
    question: 'O que é o shell?',
    answer: 'O programa que interpreta seus comandos e pede ao kernel que os execute. O bash é o mais comum. Outros: zsh, fish, sh. O shell é o que você vê quando abre um terminal.'
  },
  {
    id: 'FIL-FC-004',
    question: 'O que é GPL (General Public License)?',
    answer: 'Licença de software open-source criada por Richard Stallman. Qualquer software GPL que você modificar e distribuir deve também ser disponibilizado com código-fonte sob a GPL. O kernel Linux usa a GPLv2.'
  },
  {
    id: 'FIL-FC-005',
    question: 'Quando usar Ubuntu vs Arch Linux?',
    answer: 'Ubuntu: iniciantes, servidores com suporte comercial, quando você quer estabilidade e não quer configurar tudo do zero. Arch: quando você quer aprender Linux a fundo, monta tudo você mesmo — documentação excelente (Arch Wiki).'
  },
  {
    id: 'FIL-FC-006',
    question: 'O que foi o projeto GNU?',
    answer: 'Iniciativa de Richard Stallman (1983) para criar um sistema operacional livre. Criou ferramentas essenciais como gcc, bash, glibc. Faltava o kernel — que Linus completou em 1991. Por isso o correto seria "GNU/Linux".'
  }
],
    quiz: [
  {
    question: 'Linus Torvalds publicou o primeiro anúncio do Linux em:',
    options: ['1985', '1991', '1995', '2001'],
    correct: 1,
    explanation: 'Em agosto de 1991, com 21 anos, Linus postou na newsgroup comp.os.minix anunciando seu projeto hobby. O sistema foi liberado em outubro do mesmo ano.'
  },
  {
    question: 'O kernel Linux é responsável por:',
    options: [
      'Renderizar a interface gráfica',
      'Interpretar comandos do usuário',
      'Gerenciar hardware, memória e processos',
      'Instalar e remover pacotes'
    ],
    correct: 2,
    explanation: 'O kernel é o núcleo — gerencia diretamente o hardware. A interface gráfica fica no Desktop Environment; comandos são interpretados pelo shell; pacotes são gerenciados por ferramentas como apt.'
  },
  {
    question: 'O que diferencia uma distro Linux de outra?',
    options: [
      'O kernel, que é diferente em cada distro',
      'A linguagem de programação usada',
      'O gerenciador de pacotes, ferramentas e filosofia de design',
      'O tipo de processador suportado'
    ],
    correct: 2,
    explanation: 'O kernel Linux é praticamente o mesmo em todas as distros. O que as diferencia é o gerenciador de pacotes (apt, dnf, pacman), as ferramentas padrão, ciclos de atualização e filosofia.'
  },
  {
    question: 'A licença GPL exige que:',
    options: [
      'O software seja gratuito em dinheiro',
      'O código-fonte de modificações também seja disponibilizado',
      'Empresas não possam usar o software',
      'O software não possa ser vendido'
    ],
    correct: 1,
    explanation: 'GPL (copyleft) exige que qualquer versão modificada distribuída também seja open-source. Não impede cobrar por serviços, suporte ou distribuição — a Red Hat faz exatamente isso.'
  },
  {
    question: 'Qual distro é mais recomendada para aprender Linux a fundo, configurando tudo manualmente?',
    options: ['Ubuntu', 'Debian', 'Fedora', 'Arch Linux'],
    correct: 3,
    explanation: 'Arch Linux tem instalação manual (você monta cada parte do sistema), o que obriga a entender cada componente. A Arch Wiki é considerada a melhor documentação Linux existente.'
  },
  {
    question: 'Servidores Linux tipicamente rodam:',
    options: [
      'Com GNOME por padrão',
      'Sem ambiente gráfico (headless)',
      'Com Windows como fallback',
      'Com KDE Plasma'
    ],
    correct: 1,
    explanation: 'Servidores não precisam de interface gráfica — isso economiza RAM, CPU e reduz superfície de ataque. Toda administração é feita via SSH/terminal.'
  }
]
  };

  modules['filesystem'] = {
    id: 'filesystem',
    title: "Filesystem",
    path: 'pages/filesystem.html',
    flashcards: [
  {
    id: 'FS-FC-001',
    question: 'O que é um inode?',
    answer: 'Estrutura de dados que armazena metadados de um arquivo: permissões, dono, timestamps, localização dos blocos de dados no disco. O nome do arquivo fica no diretório, não no inode. Cada arquivo tem exatamente um inode.'
  },
  {
    id: 'FS-FC-002',
    question: 'Qual a diferença entre hard link e symbolic link?',
    answer: 'Hard link: outro nome para o mesmo inode (mesmos dados no disco). Deletar um não afeta o outro — dados existem enquanto houver ao menos um link. Symlink: arquivo que contém um caminho — como um atalho. Se o destino for deletado, o symlink quebra.'
  },
  {
    id: 'FS-FC-003',
    question: 'O que é /dev/null?',
    answer: 'Arquivo de dispositivo especial que descarta tudo que é escrito nele. Leitura retorna EOF imediatamente. Útil para silenciar output: comando > /dev/null 2>&1 descarta stdout e stderr.'
  },
  {
    id: 'FS-FC-004',
    question: 'O que o /proc contém?',
    answer: 'Sistema de arquivos virtual criado pelo kernel na memória RAM — não existe no disco. Expõe informações de processos (/proc/PID/) e do sistema (/proc/cpuinfo, /proc/meminfo). Leitura mostra estado atual do kernel.'
  },
  {
    id: 'FS-FC-005',
    question: 'Para que serve o diretório /etc?',
    answer: 'Armazena arquivos de configuração do sistema e dos programas instalados. /etc/passwd (usuários), /etc/fstab (partições montadas no boot), /etc/hosts (resolução local de nomes), /etc/ssh/sshd_config (configuração do SSH).'
  },
  {
    id: 'FS-FC-006',
    question: 'O que é o FHS (Filesystem Hierarchy Standard)?',
    answer: 'Padrão que define a estrutura de diretórios em sistemas Linux/Unix — onde cada tipo de arquivo deve ficar. A maioria das distros segue o FHS, o que torna o conhecimento transferível entre elas.'
  }
],
    quiz: [
  {
    question: 'Qual diretório contém arquivos de configuração do sistema?',
    options: ['/var', '/etc', '/usr', '/opt'],
    correct: 1,
    explanation: '/etc vem de "etcetera" — historicamente onde ficava tudo que não cabia em outro lugar. Hoje é exclusivamente para configurações: /etc/passwd, /etc/fstab, /etc/nginx/nginx.conf.'
  },
  {
    question: 'O que acontece quando você escreve dados em /dev/null?',
    options: [
      'Dados são comprimidos',
      'Dados são salvos em memória',
      'Dados são descartados permanentemente',
      'Dados são enviados para /tmp'
    ],
    correct: 2,
    explanation: '/dev/null é o "buraco negro" do Linux — aceita qualquer dado e descarta. Essencial para silenciar outputs indesejados em scripts.'
  },
  {
    question: 'Qual a diferença entre o número de hard links de um arquivo e um symlink para ele?',
    options: [
      'Hard links aumentam o contador de inodes; symlinks não',
      'Symlinks aumentam o contador; hard links não',
      'Ambos aumentam o contador',
      'Nenhum afeta o contador'
    ],
    correct: 0,
    explanation: 'Hard links apontam diretamente para o mesmo inode e incrementam seu link count. Symlinks são arquivos separados com inode próprio — não incrementam o link count do arquivo original.'
  },
  {
    question: 'Em qual diretório ficam informações sobre processos em execução?',
    options: ['/sys', '/dev', '/var/run', '/proc'],
    correct: 3,
    explanation: '/proc é um sistema de arquivos virtual criado pelo kernel na memória. /proc/1234/ contém tudo sobre o processo com PID 1234: /proc/1234/cmdline, /proc/1234/status, /proc/1234/fd/ (file descriptors abertos).'
  },
  {
    question: 'Qual comando mostra o inode de um arquivo, timestamps e tamanho em bytes?',
    options: ['ls -la', 'file', 'stat', 'find'],
    correct: 2,
    explanation: 'stat exibe todas as informações do inode: inode number, tamanho, blocos usados, permissões em octal, UID/GID, e os três timestamps: atime (último acesso), mtime (última modificação), ctime (última mudança de metadados).'
  }
]
  };

  modules['permissoes'] = {
    id: 'permissoes',
    title: "Permissões",
    path: 'pages/permissoes.html',
    flashcards: [
  {
    id: 'PERM-FC-001',
    question: 'O que significa chmod 755?',
    answer: 'Dono: leitura+escrita+execução (7=4+2+1). Grupo: leitura+execução (5=4+0+1). Outros: leitura+execução (5). Representado como rwxr-xr-x. Padrão para executáveis e diretórios públicos.'
  },
  {
    id: 'PERM-FC-002',
    question: 'Para que serve o SUID bit?',
    answer: 'Quando ativado em um executável (-rwsr-xr-x), o programa roda com as permissões do dono, não de quem executou. Exemplo: /usr/bin/passwd tem SUID de root — permite que qualquer usuário mude sua própria senha sem ter acesso root direto.'
  },
  {
    id: 'PERM-FC-003',
    question: "Qual a diferença entre permissão 'x' em arquivo vs diretório?",
    answer: 'Em arquivo: permite executar como programa. Em diretório: permite entrar (cd) e acessar arquivos dentro. Sem x no diretório, você não consegue nem fazer cd, mesmo tendo r (que só permite listar nomes).'
  },
  {
    id: 'PERM-FC-004',
    question: 'O que é o sticky bit em /tmp?',
    answer: 'Em diretórios, impede que usuários deletem arquivos de outros, mesmo tendo permissão w no diretório. /tmp tem sticky bit (drwxrwxrwt) — qualquer um pode criar arquivos, mas só o dono (ou root) pode deletar o próprio arquivo.'
  },
  {
    id: 'PERM-FC-005',
    question: 'Como funciona a umask 022?',
    answer: 'A umask é subtraída das permissões máximas (666 para arquivos, 777 para diretórios). umask 022: arquivos novos ficam com 644 (rw-r--r--), diretórios com 755 (rwxr-xr-x). Umask 027 resultaria em 640/750.'
  },
  {
    id: 'PERM-FC-006',
    question: 'Como dar permissão de escrita ao grupo sem alterar outras permissões?',
    answer: 'chmod g+w arquivo.txt — a notação simbólica adiciona (+) ou remove (-) permissões específicas sem afetar as demais. Diferente do octal, que sempre define as 9 permissões de uma vez.'
  }
],
    quiz: [
  {
    question: 'O arquivo tem permissões -rwxr-x---. Qual é sua representação octal?',
    options: ['754', '750', '755', '740'],
    correct: 1,
    explanation: 'rwx=7, r-x=5, ---=0. Logo 750. O terceiro grupo (others) tem todas as permissões negadas.'
  },
  {
    question: 'Um script.sh tem permissões 644. Um usuário comum tenta executá-lo com ./script.sh. O que acontece?',
    options: [
      'Executa normalmente',
      'Erro: Permission denied',
      'Executa como root',
      'Executa somente se for root'
    ],
    correct: 1,
    explanation: '644 = rw-r--r--. Nenhum grupo tem permissão de execute (x). Para executar, pelo menos o usuário precisa de x: chmod u+x script.sh ou chmod 755 script.sh.'
  },
  {
    question: "O diretório /tmp tem permissões drwxrwxrwt. O 't' no final significa:",
    options: [
      'Arquivo temporário',
      'Sticky bit — usuários só deletam seus próprios arquivos',
      'SUID bit ativo',
      'Que o diretório está cheio'
    ],
    correct: 1,
    explanation: 'O sticky bit em diretório (t no lugar do x de others) impede que usuários deletem arquivos uns dos outros, mesmo tendo permissão w no diretório.'
  },
  {
    question: 'Para que serve o SUID bit em /usr/bin/passwd?',
    options: [
      'Para que root possa mudar senhas de outros',
      'Para que qualquer usuário possa mudar a própria senha sem ser root',
      'Para proteger o arquivo de ser modificado',
      'Para que o arquivo seja executado mais rápido'
    ],
    correct: 1,
    explanation: 'passwd precisa escrever em /etc/shadow (que só root pode escrever). Com SUID de root, o programa roda com permissões de root independente de quem o executou.'
  },
  {
    question: 'Qual comando remove todas as permissões de "outros" em um arquivo?',
    options: [
      'chmod o=0 arquivo',
      'chmod o= arquivo',
      'chmod 000 arquivo',
      'chmod -o arquivo'
    ],
    correct: 1,
    explanation: 'chmod o= arquivo define as permissões de others como vazio (nenhuma). Equivale a chmod o-rwx. Note que chmod 000 removeria as permissões de TODOS, incluindo o dono.'
  },
  {
    question: 'Um diretório tem permissão 711 (rwx--x--x). O que um usuário comum pode fazer nele?',
    options: [
      'Listar os arquivos com ls',
      'Criar arquivos dentro',
      'Acessar arquivos se souber os nomes exatos',
      'Nada — sem r não pode acessar'
    ],
    correct: 2,
    explanation: 'x em diretório permite entrar e acessar arquivos cujos nomes você já conhece. Sem r, não pode listar (ls falha). Técnica usada para diretórios semiprivados onde você quer dar acesso a arquivos específicos.'
  }
]
  };

  modules['processos'] = {
    id: 'processos',
    title: "Processos",
    path: 'pages/processos.html',
    flashcards: [
  {
    id: 'MOD04-FC-001',
    question: 'O que é um processo zombie?',
    answer: 'Processo que terminou mas cujo exit code ainda não foi coletado pelo pai (via wait()). Aparece como "Z" em ps aux. Ocupa uma entrada na tabela de processos mas consome memória mínima. Zombies acumulados podem esgotar PIDs disponíveis.'
  },
  {
    id: 'MOD04-FC-002',
    question: 'Diferença entre SIGTERM e SIGKILL?',
    answer: 'SIGTERM (15): pede que o processo termine — ele pode limpar recursos, fechar conexões, salvar estado. Pode ser ignorado/tratado. SIGKILL (9): o kernel mata imediatamente, sem aviso. Não pode ser ignorado. Use SIGTERM primeiro; SIGKILL apenas se o processo não responder.'
  },
  {
    id: 'MOD04-FC-003',
    question: 'O que faz fork()?',
    answer: 'Cria uma cópia exata do processo atual. O processo pai recebe o PID do filho como retorno. O filho recebe 0. Ambos continuam executando do mesmo ponto. A combinação fork()+exec() é como novos programas são iniciados no Unix.'
  },
  {
    id: 'MOD04-FC-004',
    question: 'O que significa o estado "D" em ps aux?',
    answer: 'Disk sleep (Uninterruptible sleep) — o processo está aguardando I/O de dispositivo e NÃO pode ser acordado por sinais, nem pelo SIGKILL. Um processo travado em estado D geralmente indica problema de hardware ou NFS. Você não consegue matá-lo — só reiniciar o sistema.'
  },
  {
    id: 'MOD04-FC-005',
    question: 'Para que serve nohup?',
    answer: 'Previne que o processo receba SIGHUP quando o terminal é fechado. Sem nohup, fechar o terminal mata todos os processos filhos. Uso: nohup ./script.sh > output.log 2>&1 & — processo continua rodando após logout.'
  },
  {
    id: 'MOD04-FC-006',
    question: 'O que é o PID 1?',
    answer: 'O primeiro processo iniciado pelo kernel — o "pai de todos os processos". Em sistemas modernos é o systemd (antes era o init clássico). Responsável por iniciar todos os outros serviços do sistema. Se o PID 1 morrer, o kernel entra em kernel panic.'
  }
],
    quiz: [
  {
    question: 'Um processo em estado "D" (Disk sleep)...',
    options: [
      'Pode ser morto com kill -9',
      'Está usando 100% da CPU',
      'Não pode ser morto por sinais, incluindo SIGKILL',
      'É um processo zombie'
    ],
    correct: 2,
    explanation: 'Estado D é uninterruptible sleep — o processo está dentro de uma chamada de sistema de I/O crítica. O kernel não entrega sinais para ele neste estado. Você não consegue matá-lo sem reiniciar o sistema.'
  },
  {
    question: 'Qual sinal é gerado quando você pressiona Ctrl+C no terminal?',
    options: ['SIGTERM', 'SIGKILL', 'SIGSTOP', 'SIGINT'],
    correct: 3,
    explanation: 'Ctrl+C gera SIGINT (signal interrupt, número 2). O processo pode capturá-lo e tratá-lo (ex: fazer cleanup antes de sair). Ctrl+Z gera SIGTSTP (pausa). Ctrl+\\ gera SIGQUIT.'
  },
  {
    question: 'Você quer encerrar um processo de forma limpa, dando chance de ele salvar dados. Qual comando usar?',
    options: [
      'kill -9 PID',
      'kill PID',
      'kill -19 PID',
      'killall -9 nome'
    ],
    correct: 1,
    explanation: 'kill PID sem especificar sinal envia SIGTERM (15) — a forma cortês. O processo pode capturar, salvar estado e terminar limpo. kill -9 (SIGKILL) não pode ser capturado e mata imediatamente sem cleanup.'
  },
  {
    question: 'O que o comando jobs mostra?',
    options: [
      'Todos os processos do sistema',
      'Processos do usuário atual',
      'Processos em background e stopped do shell atual',
      'Jobs do cron'
    ],
    correct: 2,
    explanation: 'jobs lista os jobs do shell atual — processos iniciados naquele terminal. Não mostra processos de outros terminais ou de outros usuários. Use ps aux para ver todos os processos do sistema.'
  },
  {
    question: 'Após fork(), o processo filho recebe como retorno de fork():',
    options: [
      'O PID do pai',
      'O próprio PID',
      '-1 em caso de erro',
      '0'
    ],
    correct: 3,
    explanation: 'fork() retorna diferente para pai e filho: pai recebe o PID do filho (número > 0), filho recebe 0. Isso permite que o mesmo código se comporte diferente para cada processo com if (pid == 0) { /* sou o filho */ }.'
  }
]
  };

  modules['shell'] = {
    id: 'shell',
    title: "Shell",
    path: 'pages/shell.html',
    flashcards: [
  {
    id: 'MOD05-FC-001',
    question: 'O que é $PATH?',
    answer: 'Variável de ambiente que lista diretórios separados por \':\'. Quando você digita um comando, o shell percorre $PATH da esquerda para direita procurando o executável. Se não encontrar: "command not found". Adicione diretórios: export PATH="$HOME/.local/bin:$PATH"'
  },
  {
    id: 'MOD05-FC-002',
    question: 'O que faz 2>&1?',
    answer: 'Redireciona o file descriptor 2 (stderr) para onde o fd 1 (stdout) está apontando. Em "comando > arq.txt 2>&1": stdout vai para arq.txt, e stderr também vai para arq.txt. A ordem importa — 2>&1 deve vir depois de >.'
  },
  {
    id: 'MOD05-FC-003',
    question: 'Qual a diferença entre > e >>?',
    answer: '> redireciona stdout para um arquivo, sobrescrevendo o conteúdo existente. >> faz append — adiciona ao final sem apagar o que já estava. Cuidado: ls > arquivo.txt em arquivo.txt existente apaga o conteúdo anterior.'
  },
  {
    id: 'MOD05-FC-004',
    question: 'O que é o pipe (|) e como funciona internamente?',
    answer: 'Conecta stdout de um processo ao stdin do próximo, via buffer no kernel. Os dois processos rodam em paralelo — não é sequencial. ps aux | grep nginx: ps escreve, grep lê ao mesmo tempo. Permite construir pipelines complexos com ferramentas simples.'
  },
  {
    id: 'MOD05-FC-005',
    question: 'Para que serve /dev/null?',
    answer: 'Dispositivo especial que descarta qualquer dado escrito nele. "comando > /dev/null 2>&1" silencia stdout e stderr completamente. Útil em scripts para suprimir output de comandos auxiliares ou de comandos que podem falhar de forma esperada.'
  },
  {
    id: 'MOD05-FC-006',
    question: 'Qual a diferença entre variável local e exportada?',
    answer: 'VAR=valor: variável existe só no shell atual. Processos filhos (programas que você rodar) não a veem. export VAR=valor: a variável é copiada para o ambiente dos processos filhos. Sem export, scripts que você rodar não veem a variável.'
  },
  {
    id: 'MOD05-FC-007',
    question: 'O que é uma expansão de brace {a,b}?',
    answer: 'Geração de strings pelo shell antes de executar o comando. mkdir {jan,fev,mar}_2025 cria 3 diretórios: jan_2025, fev_2025, mar_2025. cp arquivo.txt{,.bak} cria um backup (expande para: cp arquivo.txt arquivo.txt.bak).'
  }
],
    quiz: [
  {
    question: 'O que faz o comando: ls /etc /naoexiste > saida.txt 2>/dev/null?',
    options: [
      'Salva stdout e stderr em saida.txt',
      'Salva stdout em saida.txt e descarta stderr',
      'Descarta stdout e salva stderr',
      'Descarta tudo'
    ],
    correct: 1,
    explanation: '> saida.txt redireciona stdout para o arquivo. 2>/dev/null redireciona stderr para /dev/null (descarta). Resultado: você vê os arquivos de /etc em saida.txt; o erro de /naoexiste some.'
  },
  {
    question: 'O comando !42 no histórico executa:',
    options: [
      'Os últimos 42 comandos',
      'O comando na posição 42 do histórico',
      '42 vezes o último comando',
      'O comando que contém "42"'
    ],
    correct: 1,
    explanation: '!número re-executa o comando com aquele número no histórico. !! re-executa o último. !ls re-executa o último que começa com \'ls\'. Ctrl+R faz busca interativa no histórico.'
  },
  {
    question: 'Qual file descriptor é o stderr?',
    options: ['0', '1', '2', '3'],
    correct: 2,
    explanation: '0=stdin, 1=stdout, 2=stderr. Esta numeração é fundamental para entender redirecionamentos: 2>/dev/null silencia stderr; 1>&2 manda stdout para stderr (útil em scripts para mensagens de erro).'
  },
  {
    question: 'O globbing *.{jpg,png} expande para:',
    options: [
      'Arquivos que contêm jpg ou png no nome',
      'Todos os arquivos .jpg e todos os .png',
      'Um único arquivo chamado *.{jpg,png}',
      'Arquivos .jpgpng'
    ],
    correct: 1,
    explanation: 'Brace expansion ocorre antes do globbing. *.{jpg,png} vira *.jpg *.png, que então expande para todos os arquivos com essas extensões no diretório atual.'
  },
  {
    question: 'Para que serve o alias?',
    options: [
      'Para criar variáveis de ambiente',
      'Para criar atalhos de comandos longos',
      'Para renomear arquivos',
      'Para executar comandos como root'
    ],
    correct: 1,
    explanation: 'alias nome=\'comando longo\' cria um atalho. alias ll=\'ls -la --color=auto\' permite digitar ll ao invés de ls -la --color=auto. Para persistir após fechar o terminal, adicione em ~/.bashrc ou ~/.zshrc.'
  },
  {
    question: 'Qual a principal diferença entre bash e sh para scripts?',
    options: [
      'bash é mais rápido',
      'sh é mais moderno',
      'bash tem extensões não-POSIX (arrays, [[]], etc); sh garante portabilidade',
      'Não há diferença'
    ],
    correct: 2,
    explanation: 'Scripts com #!/bin/bash podem usar features bash-específicas (arrays, substituição de processo). Scripts com #!/bin/sh devem usar apenas POSIX — mais portáveis, rodam em qualquer Unix incluindo sistemas sem bash.'
  }
]
  };

  modules['systemctl'] = {
    id: 'systemctl',
    title: "Serviços com systemctl",
    path: 'pages/systemctl.html',
    flashcards: [
  { id: 'systemctl-1', question: 'Qual a diferença entre start e enable no systemctl?', answer: '<code>start</code> sobe o serviço agora. <code>enable</code> configura o serviço para subir automaticamente no boot. Um não implica o outro.' },
  { id: 'systemctl-2', question: 'Quando usar reload em vez de restart?', answer: 'Quando o software suporta recarregar configuração sem encerrar o processo principal. Exemplo clássico: servidores web.' },
  { id: 'systemctl-3', question: 'Por que rodar daemon-reload após editar uma unit?', answer: 'Porque o systemd precisa recarregar as definições dos arquivos de unit em memória. Sem isso, ele continua usando a versão antiga.' },
  { id: 'systemctl-4', question: 'Qual comando mostra detalhes resumidos de falha de um serviço?', answer: '<code>systemctl status nome-do-servico</code>.' },
  { id: 'systemctl-5', question: 'Onde olhar logs de um serviço gerenciado pelo systemd?', answer: '<code>journalctl -u nome-do-servico</code>.' },
  { id: 'systemctl-6', question: 'Quais causas comuns fazem um serviço falhar ao subir?', answer: 'Porta ocupada, configuração inválida, permissões insuficientes, caminho errado em <code>ExecStart</code> e dependências ausentes.' }
],
    quiz: [
  {
    question: 'Qual comando sobe um serviço imediatamente, sem habilitar no boot?',
    options: ['systemctl enable nginx', 'systemctl start nginx', 'systemctl reload nginx', 'systemctl edit nginx'],
    correct: 1,
    explanation: '<code>start</code> executa o serviço agora. <code>enable</code> apenas prepara para o boot.'
  },
  {
    question: 'Você editou o arquivo de unit de uma aplicação. O que deve fazer antes de reiniciar o serviço?',
    options: ['systemctl daemon-reload', 'systemctl rehash', 'systemctl is-enabled', 'systemctl list-units'],
    correct: 0,
    explanation: 'Após editar units, rode <code>systemctl daemon-reload</code> para que o systemd releia a definição.'
  },
  {
    question: 'Qual comando verifica se um serviço inicia automaticamente junto com o sistema?',
    options: ['systemctl is-enabled ssh', 'systemctl is-active ssh', 'systemctl restart ssh', 'systemctl cat ssh'],
    correct: 0,
    explanation: '<code>is-enabled</code> informa se o serviço está habilitado para o boot.'
  },
  {
    question: 'Se o serviço está falhando, qual dupla traz mais evidência inicial?',
    options: ['pwd e whoami', 'systemctl status e journalctl -u', 'top e free -m', 'chmod e chown'],
    correct: 1,
    explanation: 'Status resume a falha; journalctl mostra os logs detalhados do serviço.'
  },
  {
    question: 'O que faz o restart policy <code>Restart=on-failure</code>?',
    options: ['Reinicia em qualquer saída, inclusive manual', 'Reinicia somente quando o serviço falha', 'Bloqueia reinícios', 'Habilita no boot'],
    correct: 1,
    explanation: 'Essa política tenta subir o serviço novamente quando ele termina com falha.'
  },
  {
    question: 'Qual problema é clássico quando o status mostra erro de bind na porta 80?',
    options: ['Kernel desatualizado', 'Porta já em uso por outro processo', 'Filesystem montado como read-only', 'Permissões do home do usuário'],
    correct: 1,
    explanation: 'Erro de bind normalmente indica porta já ocupada. Confirme com <code>ss -tulpn</code>.'
  }
]
  };

  modules['logs'] = {
    id: 'logs',
    title: "Logs com journalctl e /var/log",
    path: 'pages/logs.html',
    flashcards: [
  { id: 'logs-1', question: 'Qual comando mostra logs de um serviço específico do systemd?', answer: '<code>journalctl -u nome-do-servico</code>.' },
  { id: 'logs-2', question: 'Para que serve o parâmetro <code>-f</code> no journalctl ou tail?', answer: 'Para acompanhar novas linhas em tempo real, como um follow de log.' },
  { id: 'logs-3', question: 'Em Ubuntu/Debian, qual arquivo costuma reunir visão geral do sistema?', answer: '<code>/var/log/syslog</code>.' },
  { id: 'logs-4', question: 'Onde costuma ficar o log de autenticação?', answer: 'Geralmente em <code>/var/log/auth.log</code> nas distros Debian/Ubuntu, ou no journal equivalente.' },
  { id: 'logs-5', question: 'Qual é o erro mental mais comum ao investigar logs?', answer: 'Ler tudo sem filtro. O certo é restringir por tempo, serviço e tipo de evento.' },
  { id: 'logs-6', question: 'Quando o journalctl é melhor que procurar arquivos manualmente?', answer: 'Quando o serviço é gerenciado pelo systemd e você quer filtrar por unit, tempo e severidade rapidamente.' }
],
    quiz: [
  { question: 'Qual comando acompanha o log de um serviço nginx em tempo real pelo journal?', options: ['journalctl -u nginx -f', 'cat /var/log/nginx/error.log', 'systemctl status nginx -f', 'grep nginx /etc/logrotate.conf'], correct: 0, explanation: '<code>journalctl -u nginx -f</code> segue novos eventos do serviço em tempo real.' },
  { question: 'Você quer ver só as últimas 50 linhas do journal de um serviço. Qual opção usar?', options: ['-n 50', '--tail 50', '-last 50', '-l 50'], correct: 0, explanation: '<code>-n 50</code> limita a saída às 50 entradas mais recentes.' },
  { question: 'Qual arquivo é tipicamente usado para investigar falhas de login em Ubuntu?', options: ['/var/log/boot.log', '/var/log/auth.log', '/var/log/dpkg.log', '/var/log/faillog.txt'], correct: 1, explanation: '<code>/var/log/auth.log</code> reúne eventos de autenticação e autorização.' },
  { question: 'Qual abordagem é melhor quando um incidente ocorreu às 14:32?', options: ['Ler todos os logs do dia', 'Filtrar por período próximo do incidente', 'Reiniciar o serviço antes de olhar logs', 'Apagar logs antigos'], correct: 1, explanation: 'O ponto certo é restringir a análise ao momento do incidente e ao serviço afetado.' },
  { question: 'Para procurar palavras como denied, failed e timeout em um arquivo de log, qual ferramenta é mais direta?', options: ['touch', 'grep', 'chmod', 'wc'], correct: 1, explanation: '<code>grep</code> é a ferramenta de busca textual mais direta nesse cenário.' },
  { question: 'Qual é a maior vantagem do journalctl sobre sair procurando arquivos aleatórios?', options: ['Mostra gráficos', 'Instala serviços', 'Permite filtro por unit e tempo', 'Corrige erros automaticamente'], correct: 2, explanation: 'O journalctl organiza eventos do systemd e filtra rápido por serviço e janela temporal.' }
]
  };

  modules['rede-linux'] = {
    id: 'rede-linux',
    title: "Rede no Linux",
    path: 'pages/rede-linux.html',
    flashcards: [
  {
    front: "O que mostra <code>ss -tulnp</code>?",
    back: "Sockets TCP (<code>-t</code>) e UDP (<code>-u</code>) em modo Listening (<code>-l</code>), sem resolver nomes (<code>-n</code>), com o processo responsável (<code>-p</code>). Essencial para saber quais portas estão abertas e qual serviço as ocupa. Substitui o <code>netstat -tulnp</code>."
  },
  {
    front: "Qual a diferença entre <code>/etc/hosts</code> e <code>/etc/resolv.conf</code>?",
    back: "<code>/etc/hosts</code>: resolução local estática — mapeamentos hostname→IP com prioridade sobre DNS (configurável em /etc/nsswitch.conf). <code>/etc/resolv.conf</code>: lista os servidores DNS a consultar. hosts é verificado antes do DNS por padrão."
  },
  {
    front: "O que faz <code>ip route get 8.8.8.8</code>?",
    back: "Mostra qual interface e gateway seriam usados para alcançar o IP 8.8.8.8, sem enviar nenhum pacote. Útil para diagnosticar problemas de roteamento: confirma se o tráfego vai pelo caminho esperado."
  },
  {
    front: "Para que serve um túnel SSH (<code>ssh -L</code>)?",
    back: "Encaminha uma porta local para uma porta em um servidor remoto através de SSH. <code>ssh -L 8080:localhost:5432 servidor</code>: acessar localhost:8080 no seu computador conecta ao PostgreSQL (porta 5432) no servidor, com todo o tráfego criptografado pelo SSH."
  },
  {
    front: "Qual a diferença entre <code>ufw</code> e <code>iptables</code>?",
    back: "<code>iptables</code> é o firewall do kernel Linux — poderoso mas com sintaxe complexa. <code>ufw</code> (Uncomplicated Firewall) é uma abstração amigável sobre iptables/nftables, padrão no Ubuntu. nftables é o successor moderno do iptables. Para uso geral, ufw é suficiente; para regras complexas, iptables/nftables."
  },
  {
    front: "O que indica uma porta com <code>0.0.0.0:80</code> em <code>ss -tulnp</code>?",
    back: "O serviço está ouvindo em TODAS as interfaces de rede disponíveis na porta 80. Qualquer IP que a máquina tenha pode receber conexões nessa porta. Compare com <code>127.0.0.1:5432</code> — PostgreSQL ouvindo só no loopback, inacessível de fora."
  }
],
    quiz: [
  {
    question: "Qual comando mostra as portas TCP em escuta com o processo responsável?",
    options: ["netstat -r", "ss -tulnp", "ip addr show", "lsof -a"],
    correct: 1,
    explanation: "<code>ss -tulnp</code>: <code>-t</code> (TCP), <code>-u</code> (UDP), <code>-l</code> (listening), <code>-n</code> (numérico), <code>-p</code> (processo). O resultado mostra porta, endereço e qual programa está ouvindo. <code>netstat -tulnp</code> faz o mesmo mas está depreciado."
  },
  {
    question: "Você quer que requisições na porta 80 sejam aceitas pelo firewall ufw. O comando é:",
    options: ["ufw open 80", "ufw permit 80", "ufw allow 80/tcp", "ufw set allow port 80"],
    correct: 2,
    explanation: "<code>ufw allow 80/tcp</code> abre a porta 80 TCP. Sem especificar o protocolo, ufw abre tanto TCP quanto UDP. Para SSH: <code>ufw allow 22/tcp</code>. Para verificar o estado: <code>ufw status verbose</code>."
  },
  {
    question: "O arquivo /etc/resolv.conf contém:",
    options: [
      "Mapeamentos hostname→IP estáticos",
      "Regras de firewall",
      "Lista de servidores DNS a consultar",
      "Configuração de interfaces de rede"
    ],
    correct: 2,
    explanation: "<code>resolv.conf</code> lista nameservers (ex: <code>nameserver 8.8.8.8</code>). <code>/etc/hosts</code> tem os mapeamentos estáticos. Em sistemas com NetworkManager ou systemd-resolved, resolv.conf é gerado automaticamente."
  },
  {
    question: "O que o comando <code>dig +short google.com</code> retorna?",
    options: [
      "Informações detalhadas de DNS",
      "Apenas o endereço IP",
      "Registros MX",
      "Rota para o servidor"
    ],
    correct: 1,
    explanation: "<code>dig</code> é uma ferramenta completa de consulta DNS. <code>+short</code> imprime apenas o resultado essencial — no caso de um registro A, só o IP. <code>dig MX gmail.com</code> mostra registros de email; <code>dig NS google.com</code> mostra servidores de nome."
  },
  {
    question: "<code>ssh -L 8080:localhost:3306 servidor</code> cria:",
    options: [
      "Um tunnel de 3306 para 8080 no servidor",
      "Acesso à porta 3306 do servidor via localhost:8080 local",
      "Um proxy reverso",
      "Redirecionamento de porta no firewall"
    ],
    correct: 1,
    explanation: "Port forwarding local: <code>localhost:8080</code> no seu computador → porta 3306 (MySQL) no servidor. Muito usado para acessar bancos de dados e serviços internos através de SSH, sem expor as portas diretamente."
  }
]
  };

  modules['disco'] = {
    id: 'disco',
    title: "Disco",
    path: 'pages/disco.html',
    flashcards: [
  { id: 'disco-1', question: 'Qual comando mostra espaço usado e livre por filesystem montado?', answer: '<code>df -h</code>.' },
  { id: 'disco-2', question: 'Qual comando ajuda a descobrir quais diretórios mais consomem espaço?', answer: '<code>du</code>, por exemplo <code>du -sh /var/*</code>.' },
  { id: 'disco-3', question: 'Para que serve <code>lsblk</code>?', answer: 'Para mapear discos, partições, filesystems e mountpoints.' },
  { id: 'disco-4', question: 'O que fazer se ainda há espaço em bytes, mas o sistema diz que não consegue criar arquivos?', answer: 'Verificar inodes com <code>df -i</code>.' },
  { id: 'disco-5', question: 'Qual é o fluxo mental básico para disco cheio?', answer: '<code>df</code> para achar a partição, <code>du</code> para achar o consumidor e <code>lsblk</code> para entender o device/mountpoint.' },
  { id: 'disco-6', question: 'Por que apagar arquivos sem análise prévia é perigoso?', answer: 'Porque podem ser arquivos críticos, ainda abertos por processos ou parte de uma aplicação essencial.' }
],
    quiz: [
  { question: 'Qual comando mostra uso de disco em formato legível para humanos?', options: ['lsblk -f', 'df -h', 'du -i', 'mount -a'], correct: 1, explanation: '<code>df -h</code> mostra espaço usado/livre em unidades amigáveis.' },
  { question: 'Você quer encontrar o diretório mais pesado dentro de /var. Qual abordagem é melhor?', options: ['du -sh /var/*', 'df -h /var/*', 'lsblk /var', 'chmod -R /var'], correct: 0, explanation: '<code>du -sh /var/*</code> mostra consumo por diretório logo abaixo de /var.' },
  { question: 'Que comando ajuda a confirmar tipo de filesystem e mountpoint de cada partição?', options: ['lsblk -f', 'pwd', 'ps aux', 'ss -tulpn'], correct: 0, explanation: '<code>lsblk -f</code> mostra a estrutura de blocos com tipo e ponto de montagem.' },
  { question: 'Qual recurso pode acabar antes dos bytes livres e impedir criação de arquivos?', options: ['Threads', 'Inodes', 'Targets', 'Sockets'], correct: 1, explanation: 'Muitos arquivos pequenos podem esgotar inodes antes do espaço em bytes.' },
  { question: 'Quando o problema está em logs gigantes do journal, qual comando ajuda a medir isso?', options: ['journalctl --disk-usage', 'journalctl --repair', 'systemctl clean logs', 'du --journal'], correct: 0, explanation: '<code>journalctl --disk-usage</code> informa quanto espaço o journal ocupa.' },
  { question: 'Qual é o comportamento mais seguro antes de apagar um arquivo grande em produção?', options: ['Apagar imediatamente', 'Reiniciar o servidor', 'Entender o dono, a função e o impacto', 'Trocar permissões para 777'], correct: 2, explanation: 'Em ambiente real, identificação e impacto vêm antes de qualquer remoção.' }
]
  };

  modules['troubleshooting'] = {
    id: 'troubleshooting',
    title: "Troubleshooting Real",
    path: 'pages/troubleshooting.html',
    flashcards: [
  { id: 'trbl-1', question: 'Qual é a primeira etapa séria de troubleshooting?', answer: 'Definir o sintoma com precisão: o que falhou, desde quando, para quem e com qual impacto.' },
  { id: 'trbl-2', question: 'Por que não é bom mudar várias coisas ao mesmo tempo?', answer: 'Porque você perde causalidade. Depois não sabe o que resolveu ou o que piorou.' },
  { id: 'trbl-3', question: 'O que diferencia sintoma de causa raiz?', answer: 'Sintoma é o efeito visível, como "site fora do ar". Causa raiz é o problema real, como porta ocupada ou serviço falho.' },
  { id: 'trbl-4', question: 'Por que coletar evidência antes de reiniciar pode ser crucial?', answer: 'Porque o restart pode apagar estado importante, mudar logs recentes e dificultar descobrir a causa.' },
  { id: 'trbl-5', question: 'O que é rollback?', answer: 'É a capacidade de desfazer uma mudança e voltar ao estado anterior se a correção falhar ou piorar a situação.' },
  { id: 'trbl-6', question: 'Quando um incidente está realmente encerrado?', answer: 'Quando o sintoma foi validado como resolvido, a causa foi entendida e a correção foi registrada.' }
],
    quiz: [
  { question: 'Qual atitude é mais correta ao receber "o site caiu"?', options: ['Reiniciar o servidor imediatamente', 'Definir escopo e coletar evidência inicial', 'Apagar logs antigos', 'Trocar permissões do diretório web'], correct: 1, explanation: 'O primeiro passo sério é delimitar sintoma, escopo e evidências iniciais.' },
  { question: 'Qual destes é um sintoma e não uma causa raiz?', options: ['Porta 80 ocupada', 'Arquivo de configuração inválido', 'Site indisponível', 'Permissão negada no log'], correct: 2, explanation: 'Site indisponível é o efeito observado; a causa pode ser muitas outras.' },
  { question: 'Por que reiniciar cedo demais pode atrapalhar?', options: ['Porque sempre quebra o kernel', 'Porque pode apagar evidência e mudar o estado do problema', 'Porque desabilita o journalctl', 'Porque limpa o disco'], correct: 1, explanation: 'Reiniciar pode mascarar o problema e eliminar sinais úteis.' },
  { question: 'Qual é a melhor prática ao aplicar uma correção?', options: ['Mudar várias variáveis de uma vez', 'Fazer uma mudança por vez e validar', 'Editar arquivos direto em produção sem backup', 'Ignorar impacto para usuários'], correct: 1, explanation: 'Mudança isolada preserva causalidade e reduz risco.' },
  { question: 'O que um bom fechamento de incidente inclui?', options: ['Só dizer que voltou', 'Causa raiz, validação e prevenção futura', 'Trocar a senha do root', 'Formatar o servidor'], correct: 1, explanation: 'Fechar bem inclui entendimento da causa e prevenção, não só retorno momentâneo.' },
  { question: 'Qual conjunto é uma boa triagem inicial ampla?', options: ['vim, nano, cat', 'uptime, free -h, df -h, systemctl --failed', 'mkdir, touch, rm', 'chmod, chown, useradd'], correct: 1, explanation: 'Esses comandos ajudam a localizar rapidamente se o problema está em carga, memória, disco ou serviços.' }
]
  };

})(globalThis);
