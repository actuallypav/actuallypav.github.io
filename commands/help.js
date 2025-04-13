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
        write(`
PAV-GNU Emulator, version 1.0.0 (x86_64-pc-linux-pav)
These shell commands are defined internally. Type 'help' to see this list.
Type 'help <command>' to get more information about the function '<command>'.
Use 'info pav' to learn more about this amazing terminal emulator.
            
A star (*) next to a command means that it is currently disabled.
            
${allCommands}
`);
    } else {
        const cmd = args[0];
        if (commandDescriptions[cmd]) {
            write(`${cmd}: ${commandDescriptions[cmd]}`);
        } else {
            write(`No help available for command: ${cmd}`);
        }
    }
}
