export function initializeTerminal(terminal) {
  function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent) || window.innerWidth <= 768;
  }

  function adjustTerminalLayout() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Adjust font size and height for mobile vs desktop
    if (isMobileDevice()) {
      terminal.style.fontSize = '14px';  // Smaller font size for mobile devices
      terminal.style.height = `${screenHeight - 50}px`;  // Adjust terminal height for mobile
      terminal.style.padding = '10px';  // Add some padding for better interaction on mobile
    } else {
      if (screenWidth < 600) {
        terminal.style.fontSize = '12px';
      } else if (screenWidth < 1200) {
        terminal.style.fontSize = '16px';
      } else {
        terminal.style.fontSize = '20px';
      }
      terminal.style.height = `${screenHeight - 100}px`;  // Adjust height for desktop
    }

    // Make sure the contenteditable div is large enough and scrollable
    terminal.style.overflowY = 'auto';
    terminal.style.whiteSpace = 'pre-wrap';  // Allow text wrapping
    terminal.style.width = '100%';  // Full width
    terminal.style.maxWidth = '100%';  // Prevent overflow
    terminal.style.position = 'relative';  // Ensure proper positioning
  }

  adjustTerminalLayout();
  window.addEventListener('resize', adjustTerminalLayout);

  function enableMobileTyping() {
    terminal.setAttribute('contenteditable', 'true');
    terminal.addEventListener('input', (event) => {
      const text = event.target.innerText;
      console.log('User is typing:', text);
    });

    // Ensure scrolling down to the bottom when typing
    terminal.addEventListener('focus', () => {
      terminal.scrollTop = terminal.scrollHeight;
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
