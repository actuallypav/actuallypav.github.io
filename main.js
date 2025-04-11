const term = document.getElementById('terminal');

let cwd = '~';
let buffer = '';
let history = '';

let username = localStorage.getItem('username') || prompt('Enter your username: ') || 'user';
let hostname = 'ubuntu-web-terminal';

localStorage.setItem('username', username);

const getPrompt = () => `<span class="prompt">${username}@${hostname}:${cwd}$</span> `;

const write = (text) => {
  history += text + '\n';
};

const render = () => {
  term.innerHTML = history + getPrompt() + `${buffer}_`;
  term.scrollTop = term.scrollHeight;
};

const runCommand = (cmd) => {
  write(getPrompt() + cmd);

  switch (cmd) {
    case 'help':
      write('Available commands: help, about, clear');
      break;
    case 'about':
      write('This is a fake Ubuntu terminal built in JS.');
      break;
    case 'clear':
      history = '';
      break;
    default:
      write(`Command not found: ${cmd}`);
  }

  buffer = '';
  render();
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'Backspace') {
    buffer = buffer.slice(0, -1);
  } else if (e.key === 'Enter') {
    runCommand(buffer.trim());
  } else if (e.key.length === 1) {
    buffer += e.key;
  }
  render();
});

write('Ubuntu 22.04 Web Terminal\nType "help" to begin.');
render();
