const commandMap = {};        // { help: handlerFn, ... }
const commandDescriptions = {}; // { help: "description", ... }

const loadCommand = (commandName) => {
    return import(`./commands/${commandName}.js`)
        .then((commandModule) => {
            commandMap[commandName] = commandModule.default;
            commandDescriptions[commandName] = commandModule.description || 'No description available.';
        })
        .catch((err) => {
            console.error(`Failed to load command ${commandName}:`, err);
        });
};

const commandNames = ['help', 'about', 'clear', 'ls', 'cd', 'cat', 'info'];

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
        command(write, args, env);
    } else if (cmd !== '') {
        write(`${cmd}: command not found`);
    }
}

export { commandDescriptions };
