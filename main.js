// main.js
import { initializeTerminal } from './UI/layout.js';
import { runCommand } from './commands.js';
import { fs, getNodeFromPath } from './vfs.js';

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

var ubuError = new Audio('./audio/bell.oga');

const getPrompt = () => 
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
  term.innerHTML = history + getPrompt() + `${beforeCursor}<span class="cursor${isIdle ? ' blink' : ''}">${atCursor}</span>${afterCursor}`;
  term.scrollTop = term.scrollHeight;
};

document.addEventListener('keydown', (e) => {
    const scrollTop = term.scrollTop;

    if (e.key === 'Backspace') {
      buffer = buffer.slice(0, -1);
    }

    else if (e.key === 'Enter') {
      const trimmed = buffer.trim();
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
    }

    else if (e.key === 'ArrowUp') {
      if (historyIndex > 0) {
        historyIndex--;
        buffer = commandHistory[historyIndex];
        cursorPos = buffer.length;
      } else if (historyIndex === 0 && commandHistory.length >= 0) {
        ubuError.play();
      }
      term.scrollTop = scrollTop;
    }

    else if (e.key === 'ArrowDown') {
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
    }

    else if (e.key === 'ArrowRight') {
      if (cursorPos < buffer.length) {
        cursorPos++;
      } else {
        ubuError.play();
      }
    }

    else if (e.key === 'ArrowLeft') {
      if (cursorPos > 0) {
        cursorPos--;
      } else {
        ubuError.play();
      }
    }

    else if (e.key.length === 1) {
      buffer = buffer.slice(0, cursorPos) + e.key + buffer.slice(cursorPos);
      cursorPos++;
    }
    render();
    resetIdle(); //reset idle when we start pressing
});
  

write('Ubuntu 22.04 Web Terminal\nType "help" to begin.');
render();
