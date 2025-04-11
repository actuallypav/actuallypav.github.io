// main.js
import { runCommand } from './commands.js';

const term = document.getElementById('terminal');

let cwd = '~';
let buffer = '';
let history = '';
let commandHistory = [];
let historyIndex = -1;

let username = localStorage.getItem('username') || prompt('Enter your username: ') || 'user';
let hostname = 'ubuntu-web-terminal';

var ubuError = new Audio('./audio/bell.oga');

localStorage.setItem('username', username);

const getPrompt = () => `<span class="prompt">${username}@${hostname}:${cwd}$</span> `;

const write = (text, clear = false) => {
    if (clear) {
        history = '';
    } else {
        history += text + '\n';
    }
    render();
};

const render = () => {
  term.innerHTML = history + getPrompt() + `${buffer}_`;
  term.scrollTop = term.scrollHeight;
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
      buffer = buffer.slice(0, -1);
    }

    else if (e.key === 'Enter') {
      const trimmed = buffer.trim();
      write(getPrompt() + trimmed);
  
      if (trimmed !== "") {
        commandHistory.push(trimmed);
      }
  
      runCommand(trimmed, username, hostname, write);
      buffer = '';
      historyIndex = commandHistory.length;
    }

    else if (e.key === 'ArrowUp') {
      if (historyIndex > 0) {
        historyIndex--;
        buffer = commandHistory[historyIndex];
      } else if (historyIndex === 0 && commandHistory.length >= 0) {
        ubuError.play();
      }
    }

    else if (e.key === 'ArrowDown') {
      if (historyIndex < commandHistory.length) {
        historyIndex++;
        if (historyIndex < commandHistory.length) {
          buffer = commandHistory[historyIndex];
        } else {
          buffer = '';
        }
      } else if (historyIndex === commandHistory.length && buffer === "") {
        ubuError.play();
      } else {
        buffer = '';
      }
    }
    //TODO: functionality for left and right with error noises
    //TODO: change underscore to be the box that highlights
    //TODO: make screen flash on error
    //TODO: cjange color of output

    else if (e.key.length === 1) {
      buffer += e.key;
    }
    render();
});
  

write('Ubuntu 22.04 Web Terminal\nType "help" to begin.');
render();
