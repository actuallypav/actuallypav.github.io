const term = new Terminal({
    cursorBlink: true,
    theme: { background: '#000000' }
  });
  term.open(document.getElementById('terminal'));
  
  const prompt = () => term.write('\r\n$ ');
  
  term.writeln('Welcome to your web terminal!');
  prompt();
  
  let buffer = '';
  
  term.onKey(e => {
    const char = e.key;
    if (e.domEvent.key === 'Enter') {
      handleCommand(buffer.trim());
      buffer = '';
      prompt();
    } else if (e.domEvent.key === 'Backspace') {
      if (buffer.length > 0) {
        term.write('\b \b');
        buffer = buffer.slice(0, -1);
      }
    } else {
      buffer += char;
      term.write(char);
    }
  });
  
  function handleCommand(cmd) {
    switch (cmd) {
      case 'help':
        term.writeln('Available commands: help, about, clear');
        break;
      case 'about':
        term.writeln('This is a fake terminal running in your browser.');
        break;
      case 'clear':
        term.clear();
        break;
      default:
        term.writeln(`Command not found: ${cmd}`);
    }
  }
  