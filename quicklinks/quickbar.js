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
  ]
};

export function addBlogQuicklink(termRef, username, hostname, write, updatePath) {
  const blogLink = Array.from(document.querySelectorAll('#quick-bar a'))
    .find(a => a.textContent.trim().toLowerCase() === 'blog');
  if (!blogLink) return;

  if (blogLink.__blogBound) return;
  blogLink.__blogBound = true;

  //right-click cd /blog && ls
  blogLink.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const steps = (scripts['Blog'] || []).map(c => c.replace('${username}', username));
    (async () => {
      for (const cmd of steps) {
        runCommand(cmd, username, hostname, write, {
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
        terminalState.render();
        await new Promise(r => setTimeout(r, 120));
      }
    })();
  });

  //left-click dropdown
  blogLink.addEventListener('click', (e) => {
    e.preventDefault();

    let menu = blogLink.nextElementSibling;
    if (menu && menu.classList.contains('quick-menu')) return menu.remove();

    menu = document.createElement('div');
    menu.className = 'quick-menu';
    menu.innerHTML = `
      <a href="#" data-cmd="blog latest">Latest</a>
      <a href="#" data-cmd="cd /blog && ls">Recent</a>
      <a href="#" data-cmd="cd /old_posts && ls">Archive</a>
    `;

    blogLink.after(menu);

    // document.body.appendChild(menu);
    // const r = blogLink.getBoundingClientRect();

    // const right = Math.max(8, window.innerWidth - r.right);
    // menu.style.right = `${right}px`
    // menu.style.top = `${r.bottom + 4}px`;

    // // position directly under "Blog" (no getBoundingClientRect needed)
    // menu.style.position = 'absolute';
    // menu.style.left = (blogLink.offsetLeft - 10) + 'px';
    // menu.style.top  = (blogLink.offsetTop + blogLink.offsetHeight + 4) + 'px';

    document.body.appendChild(menu);
    const r = blogLink.getBoundingClientRect();

    const right = Math.max(8, window.innerWidth - r.right);
    menu.style.right = `${right}px`;
    menu.style.left = 'auto';
    menu.style.top = `${r.bottom + 4}px`;
    menu.style.position = 'fixed';


    // handle clicks on links
    menu.addEventListener('click', (ev) => {
      const a = ev.target.closest('a[data-cmd]');
      if (!a) return;
      ev.preventDefault();
      const chain = a.dataset.cmd.split('&&').map(s => s.trim());
      (async () => {
        for (const c of chain) {
          runCommand(c, username, hostname, write, {
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
          terminalState.render();
          await new Promise(r => setTimeout(r, 120));
        }
      })();
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