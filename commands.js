import help from './commands/help.js';
import about from './commands/about.js';
import clear from './commands/clear.js';

const commandMap = {
    help,
    about,
    clear,
};

export function runCommand(cmd, username, hostname, write) {
    const command = commandMap[cmd];

    if (command) {
        command(write);
    }
    else if (cmd != '') {
        write(`${cmd}: command not found`);
    }
  }