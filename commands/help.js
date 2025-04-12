import { commandDescriptions } from '../commands.js';

export const description = `help: help [command ...]
\tDisplay information about commands.

\tProvides general or specific information about available commands. 
\tIf no command is specified, it lists all available commands. 
\tIf a command is specified, it shows detailed information about that particular command.

\tArguments:
\t\tcommand   Name of the command to get help for

\tExit Status:
\tReturns success unless an invalid command is specified.`;

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
