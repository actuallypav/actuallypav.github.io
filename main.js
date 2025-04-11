const term = document.getElementById('terminal');

let cwd = '~';
let buffer = '';
let history = '';

const write = (text) => {
  history += text + '\n';
};

const render = () => {
  term.innerHTML = history + `<span class="prompt">${cwd} $</span> ${buffer}_`;
  term.scrollTop = term.scrollHeight;
};

const runCommand = (cmd) => {
  write(`<span class="prompt">${cwd} $</span> ${cmd}`);

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
