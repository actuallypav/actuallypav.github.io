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
    return import(`./commands/${commandName}.js`)
        .then((commandModule) => {
            commandMap[commandName] = commandModule.default;
        })
        .catch((err) => {
            console.error(`Failed to load command ${commandName}:`, err);
        });
};

const commandNames = ['help', 'about', 'clear', 'ls'];

Promise.all(commandNames.map(loadCommand))
    .then(() => {
        console.log("All commands loaded successfully.");
    })
    .catch((err) => {
        console.error("Error loading commands:", err);
    });

export function runCommand(cmdLine, username, hostname, write, env) {
    const [cmd, ...args] = cmdLine.split(' ');
    const command = commandMap[cmd];

    if (command) {
        command(write, args, env);  // explicitly pass true to trigger clear
    } else if (cmd !== '') {
        write(`${cmd}: command not found`);
    }
}
