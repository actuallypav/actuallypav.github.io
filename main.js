import {initializeTerminal} from './UI/layout.js';
import {commandDescriptions, runCommand} from './commands.js';
import {fs, getNodeFromPath} from './vfs.js';
import {terminalState} from './terminalContext.js';
import {initQuickbarTerminalBindings} from './quicklinks/quickbar.js';

const term = document.getElementById('terminal');
initializeTerminal(term)

let username = localStorage.getItem('username') || prompt('Enter your username: ') || 'user';
let hostname = 'ubuntu-web-terminal';
let cwd = `/home`;
let buffer = '';
let history = ''; //history of everything on screen - zeroed out with clear command
let commandHistory = []; //history of commands used
let historyIndex = -1; //index for the above - start on nothing
let cursorPos = 0;
let idleTimer;
let isIdle = true;
let path = '/home'; //simulated abs path

localStorage.setItem('username', username);

//dynamically replace 'user' with the actual username
fs['/'].children['home'].children[username] = fs['/'].children['home'].children['user'];
delete fs['/'].children['home'].children['user'];

const ubuError = new Audio('./audio/bell.oga');

export const getPrompt = () =>
  `<span class="prompt-user">${username}@${hostname}</span>` +
  `:<span class="prompt-path">${cwd}</span><span class="prompt-symbol">$</span> `;

const write = (text, clear = false) => {
  if (clear) {
    history = '';
  } else {
    history += text + '\n';
  }
  render();
};

const resetIdle = () => {
  isIdle = false;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    isIdle = true;
    render();
  }, 500);
};

const render = () => {
  const beforeCursor = buffer.slice(0, cursorPos);
  const atCursor = buffer.charAt(cursorPos) || ' ';
  const afterCursor = buffer.slice(cursorPos + 1);
  // term.innerHTML = history + getPrompt() + `${beforeCursor}<span class="cursor${isIdle ? ' blink' : ''}">${atCursor}</span>${afterCursor}`;
  term.scrollTop = term.scrollHeight;
};

document.addEventListener('keydown', (e) => {
  const scrollTop = term.scrollTop;

  if (e.key === 'Backspace') {
    if (cursorPos > 0) {
      buffer = buffer.slice(0, cursorPos - 1) + buffer.slice(cursorPos);
      cursorPos--;
    } else {
      ubuError.play();
    }
  } else if (e.key === 'Delete') {
    if (cursorPos < buffer.length) {
      buffer = buffer.slice(0, cursorPos) + buffer.slice(cursorPos + 1);
    } else {
      ubuError.play();
    }
  } else if (e.key === 'Enter') {
    const trimmed = buffer.trim().toLowerCase();
    write(getPrompt() + trimmed);

    if (trimmed !== "") {
      commandHistory.push(trimmed);
    }

    runCommand(trimmed, username, hostname, write, {
      cwd,
      path,
      fs,
      getNodeFromPath,
      updatePath: (newPath) => {
        path = newPath;
        cwd = path.replace(`/home/${username}`, `~`);
      }
    });

    buffer = '';
    historyIndex = commandHistory.length;
    cursorPos = 0;
  } else if (e.key === 'ArrowUp') {
    if (historyIndex > 0) {
      historyIndex--;
      buffer = commandHistory[historyIndex];
      cursorPos = buffer.length;
    } else if (historyIndex === 0 && commandHistory.length >= 0) {
      ubuError.play();
    }
    term.scrollTop = scrollTop;
  } else if (e.key === 'ArrowDown') {
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      buffer = commandHistory[historyIndex];
      cursorPos = buffer.length;
    } else if (historyIndex === commandHistory.length - 1) {
      historyIndex++;
      buffer = '';
      cursorPos = 0;
    } else {
      ubuError.play();
    }
  } else if (e.key === 'ArrowRight') {
    if (cursorPos < buffer.length) {
      cursorPos++;
    } else {
      ubuError.play();
    }
  } else if (e.key === 'ArrowLeft') {
    if (cursorPos > 0) {
      cursorPos--;
    } else {
      ubuError.play();
    }
  } else if (e.key.length === 1) {
    buffer = buffer.slice(0, cursorPos) + e.key + buffer.slice(cursorPos);
    cursorPos++;
  } else if (e.key === 'Tab') {
    e.preventDefault();

    const parts = buffer.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const inputPath = parts[1] || '';

    if (cmd === 'ls' || cmd === 'cd' || cmd === 'cat') {
      let basePath = path;
      let partial = inputPath;

      if (inputPath.startsWith('/')) {
        basePath = inputPath.slice(0, inputPath.lastIndexOf('/')) || '/';
        partial = inputPath.split('/').pop();
      } else if (inputPath.includes('/')) {
        basePath = path + '/' + inputPath.slice(0, inputPath.lastIndexOf('/'));
        partial = inputPath.split('/').pop();
      }

      const node = getNodeFromPath(basePath);

      if (node && node.children) {
        const matches = Object.keys(node.children).filter(name =>
          name.startsWith(partial)
        );

        if (matches.length === 1) {
          if (cmd !== 'cat') {
            const completedPath = inputPath.replace(/[^\/]*$/, matches[0]);
            buffer = `${cmd} ${completedPath}/`;
            cursorPos = buffer.length;
          } else {
            const completedPath = inputPath.replace(/[^\/]*$/, matches[0]);
            if (node.children[matches[0]].type === 'file') {
              buffer = `${cmd} ${completedPath}`;
              cursorPos = buffer.length;
            } else if (node.children[matches[0]].type === 'repo') {
              buffer = `${cmd} ${completedPath}`;
              cursorPos = buffer.length;
            } else if (node.children[matches[0]].type === 'cv') {
              buffer = `${cmd} ${completedPath}`;
              cursorPos = buffer.length;
            } else {
              buffer = `${cmd} ${completedPath}/`;
              cursorPos = buffer.length;
            }


          }

        } else if (matches.length > 1) {
          const directories = matches.filter(name =>
            node.children[name].type === 'dir'
          ).sort();

          const files = matches.filter(name =>
            node.children[name].type === 'file'
          ).sort();

          const repos = matches.filter(name =>
            node.children[name].type === 'repo'
          ).sort();

          const cv = matches.filter(name =>
            node.children[name].type === 'cv'
          ).sort();

          const sortedMatches = [...directories, ...files, ...repos, ...cv];

          const formattedOutput = sortedMatches.map(name => {
            const childNode = node.children[name];
            if (childNode.type === 'dir') {
              return `<span class="directory">${name}/</span>`;
            } else {
              return name;
            }
          }).join('  ');

          write(getPrompt() + buffer, false);

          write(formattedOutput);
        } else {
          ubuError.play();
        }
      } else {
        ubuError.play();
      }
    } else if (cmd === 'help') {
      const allCommands = Object.keys(commandDescriptions);
      const matches = allCommands.filter(name => name.startsWith(inputPath));

      if (matches.length === 1) {
        buffer = `help ${matches[0]}`;
        cursorPos = buffer.length;
      } else if (matches.length > 1) {
        const formattedOutput = matches.join('  ');
        write(getPrompt() + buffer, false);
        write(formattedOutput);
      }
    } else {
      ubuError.play();
    }
  }

  render();
  resetIdle();
});

//export bits
terminalState.username = username;

Object.defineProperty(terminalState, 'buffer', {
  get: () => buffer,
  set: (val) => buffer = val
});

Object.defineProperty(terminalState, 'cursorPos', {
  get: () => cursorPos,
  set: (val) => cursorPos = val
});

//share path state
const updatePathRef = {
  getPath: () => path,
  setPath: (p) => path = p,
  getCwd: () => cwd,
  setCwd: (c) => cwd = c
};

initQuickbarTerminalBindings(term, username, hostname, write, updatePathRef);

write('Pav-buntu 22.04 - an Ubuntu-Terminal-Inspired-Portfolio\nType "help" alternatively "Right-Click" on "Portfolio" or "Resume" to begin.');
render();

terminalState.render = render;
