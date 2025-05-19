export function initializeTerminal(terminal) {
    function isMobileDevice() {
      return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent) || window.innerWidth <= 768;
    }
  
    function adjustTerminalLayout() {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
  
      if (isMobileDevice()) {
        terminal.style.fontSize = '14px';
      } else {
        if (screenWidth < 600) {
          terminal.style.fontSize = '12px';
        } else if (screenWidth < 1200) {
          terminal.style.fontSize = '16px';
        } else {
          terminal.style.fontSize = '20px';
        }
      }
  
      terminal.style.height = `${screenHeight - 50}px`;
    }
  
    adjustTerminalLayout();
  
    window.addEventListener('resize', adjustTerminalLayout);
  
    function enableMobileTyping() {
      terminal.addEventListener('input', (event) => {
        const text = event.target.innerText;
        console.log('User is typing:', text);
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
  