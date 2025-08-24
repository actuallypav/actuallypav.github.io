import { runCommand } from "../commands.js";
import { fs, getNodeFromPath } from "../vfs.js";
import { terminalState } from "../terminalContext.js";
import { getPrompt } from "../main.js";


const links = document.querySelectorAll('#quick-bar a');
let isRunning = false;

const scripts = {
    'Resume': [
    'clear',
    'cd /home',
    'ls',
    'cd ${username}',
    'ls',
    'cd resume',
    'ls',
    'cat *'
  ],
  'Portfolio': [
    'clear',
    'cd /home',
    'ls',
    'cd ${username}',
    'ls',
    'cd portfolio',
    'ls',
    'cat *'
  ],
  'LinkedIn': [
    'clear',
    'cd /home',
    'ls',
    'cd ${username}',
    'ls',
    'cd contact',
    'ls',
    'cat contact.txt'
  ],
  'Blog:Recent': [
    'cd /home/${username}/blog',
    'ls'
  ],
  'Blog:Archive': [
    'cd /home/${username}/blog/old_posts',
    'ls'
  ],
  'Blog:Latest': [
    'blog latest'
  ]
};

export function addBlogQuicklink(termRef, username, hostname, write, updatePath) {
  const blogLink = Array.from(document.querySelectorAll('#quick-bar a'))
    .find(a => a.textContent.trim().toLowerCase() === 'blog');
  if (!blogLink) return;

  if (blogLink.__blogBound) return;
  blogLink.__blogBound = true;

  // //right-click cd /blog && ls
  // blogLink.addEventListener('contextmenu', async (e) => {
  //   e.preventDefault();
  //   if (isRunning) return;                                 
  //   isRunning = true;                                      

  //   const steps = (scripts['Blog'] || []).map(c => c.replace('${username}', username));

  //   for (const cmd of steps) {
  //     await typeAndRunCommand(cmd, username, hostname, write, updatePath); 
  //   }

  //   isRunning = false;                                    
  // });

  //left-click dropdown
  blogLink.addEventListener('click', (e) => {
    e.preventDefault();

    let menu = blogLink.nextElementSibling;
    if (menu && menu.classList.contains('quick-menu')) return menu.remove();

    menu = document.createElement('div');
    menu.className = 'quick-menu';
    menu.innerHTML = `
      <a href="#" data-cmd="blog latest">Latest</a>
      <a href="#" data-cmd="cd /home/${username}/blog && ls">Recent</a>
      <a href="#" data-cmd="cd /home/${username}/blog/old_posts && ls">Archive</a>
    `;

    blogLink.after(menu);

    document.body.appendChild(menu);
    const r = blogLink.getBoundingClientRect();

    const right = Math.max(8, window.innerWidth - r.right);
    menu.style.right = `${right - 22}px`;
    menu.style.left = 'auto';
    menu.style.top = `${r.bottom + 4}px`;
    menu.style.position = 'fixed';


    // handle clicks on links
    menu.addEventListener('click', async (ev) => {
      const a = ev.target.closest('a[data-cmd]');
      if (!a) return;
      ev.preventDefault();
      if (isRunning) return;                                
      isRunning = true;                                     

      const chain = a.dataset.cmd.split('&&').map(s => s.trim());

      //animate typing for each command
      for (const cmd of chain) {
        await typeAndRunCommand(cmd, username, hostname, write, updatePath);
      }

      isRunning = false;                                    
      menu.remove();
    });

    const close = (ev) => {
      if (!menu.contains(ev.target) && ev.target !== blogLink) {
        menu.remove(); document.removeEventListener('click', close);
      }
    };
    setTimeout(() => document.addEventListener('click', close), 0);
  });
}

export function initQuickbarTerminalBindings(termRef, username, hostname, write, updatePathRef) {
    let isRunning = false;

    links.forEach(link => {
        link.addEventListener('contextmenu', async (e) => {
            e.preventDefault();
            const label = link.innerText.trim();
            const script = scripts[label];

            if (!script || isRunning) return;
            isRunning = true;

            let path = `/home/${username}`;
            let cwd = `~`;

            for (const rawCmd of script) {
                const cmd = rawCmd.replace('${username}', username);
                await typeAndRunCommand(cmd, username, hostname, write, updatePathRef, () => {
                    path = updatePathRef.getPath();
                    cwd = path.replace(`/home/${username}`, `~`);
                });
            }

            isRunning = false;
        });
    });
}

async function typeAndRunCommand(command, username, hostname, write, updatePath, updatePrompt) {
    return new Promise(resolve => {
        let index = 0;
        terminalState.buffer = '';
        terminalState.cursorPos = 0;

        const typeInterval = setInterval (() => {
            if (index < command.length) {
                const char = command[index++];
                terminalState.buffer += char;
                terminalState.cursorPos = terminalState.buffer.length;
                terminalState.render();
            } else {
                clearInterval(typeInterval);
                setTimeout(() => {
                    const trimmed = terminalState.buffer.trim().toLowerCase();
                    write(getPrompt() + trimmed);
                    runCommand(trimmed, username, hostname, write, {
                        cwd: updatePath.getCwd(),
                        path: updatePath.getPath(),
                        fs,
                        getNodeFromPath,
                        updatePath: (newPath) => {
                            updatePath.setPath(newPath);
                            updatePath.setCwd(newPath.replace(`/home/${username}`, `~`));
                        }
                    });
                    terminalState.buffer = '';
                    terminalState.cursorPos = 0;
                    updatePrompt?.();
                    terminalState.render();
                    resolve();
                }, 500);
            }
        }, 125);
    });
}