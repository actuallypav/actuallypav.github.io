// import help from './commands/help.js';
// import about from './commands/about.js';
// import clear from './commands/clear.js';

// const commandMap = {
//     help,
//     about,
//     clear,
// };

const commandMap = {};
const loadCommand = (commandName) => {
    import(`./commands/${commandName}.js`)
    .then((commandModule) => {
        commandMap[commandName] = commandModule.default;
    })
    .catch((err) => {
        console.error(`Failed to load command ${commandName}:`, err);
    });
};

const commandNames = ['help', 'about', 'clear', 'ls'];
commandNames.forEach(loadCommand)

export function runCommand(cmdLine, username, hostname, write, env) {
    const [cmd, ...args] = cmdLine.split(' ');
    const command = commandMap[cmd];

    if (command) {
            command(write, args, env);  // explicitly pass true to trigger clear
    }
    else if (cmd !== '') {
        write(`${cmd}: command not found`);
    }
}

