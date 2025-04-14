import { runCommand } from "../commands.js";
import { fs, getNodeFromPath } from "../vfs.js";
import { terminalState } from "../terminalContext.js";
import { getPrompt } from "../main.js";


const links = document.querySelectorAll('#quick-bar a');

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

export function initQuickbarTerminalBindings(termRef, username, hostname, write, updatePathRef) {
    links.forEach(link => {
        link.addEventListener('contextmenu', async (e) => {
            e.preventDefault();
            const label = link.innerText.trim();
            const script = scripts[label];

            if (!script) return;

            let path = `/home/${username}`;
            let cwd = `~`;

            for (const rawCmd of script) {
                const cmd = rawCmd.replace('${username}', username);
                await typeAndRunCommand(cmd, username, hostname, write, updatePathRef, () => {
                    path = updatePathRef.getPath();
                    cwd = path.replace(`/home/${username}`, `~`);
                });
            }
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