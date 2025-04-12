export function initializeTerminal(terminal) {
  function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent) || window.innerWidth <= 768;
  }

  function adjustTerminalLayout() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    if (isMobileDevice()) {
      terminal.style.fontSize = '14px';
      terminal.style.height = `${screenHeight - 50}px`; // Adjust height to fit the screen
    } else {
      if (screenWidth < 600) {
        terminal.style.fontSize = '12px';
      } else if (screenWidth < 1200) {
        terminal.style.fontSize = '16px';
      } else {
        terminal.style.fontSize = '20px';
      }
      terminal.style.height = `${screenHeight - 100}px`; // Adjust height to fit the screen
    }

    // Make sure the contenteditable div has a scrollable area
    terminal.style.overflowY = 'auto';
    terminal.style.whiteSpace = 'pre-wrap'; // Keep the text wrapping properly.
  }

  adjustTerminalLayout();
  window.addEventListener('resize', adjustTerminalLayout);

  function enableMobileTyping() {
    terminal.setAttribute('contenteditable', 'true');
    terminal.addEventListener('input', (event) => {
      const text = event.target.innerText;
      console.log('User is typing:', text);
    });
    // Ensure that we handle the cursor position correctly for mobile
    terminal.addEventListener('focus', () => {
      terminal.scrollTop = terminal.scrollHeight; // Keep the terminal scrolled to the bottom when typing.
    });
  }

  function disableMobileTyping() {
    terminal.setAttribute('contenteditable', 'false');
  }

  if (isMobileDevice()) {
    enableMobileTyping();
  } else {
    disableMobileTyping();
  }
}
