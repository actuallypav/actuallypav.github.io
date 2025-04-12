import { commandDescriptions } from '../commands.js';

export const description = 'The "help" command provides general or specific info about commands.';

export default function help(write, args) {
    if (args.length === 0) {
        const allCommands = Object.keys(commandDescriptions).join('\n');
        write('Available commands:\n' + allCommands);
    } else {
        const cmd = args[0];
        if (commandDescriptions[cmd]) {
            write(`${cmd}: ${commandDescriptions[cmd]}`);
        } else {
            write(`No help available for command: ${cmd}`);
        }
    }
}
