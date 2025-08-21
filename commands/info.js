export const description = `info: info pav
    Display documentation for pav-buntu-terminal.

    Behavior:
        Currently shows general information about the terminal.
        In the future, this will contain detailed documentation
        for commands and utilities within pav-buntu-terminal.

    Arguments:
        pav   Display information about the terminal.

    Exit Status:
        0  after displaying the information.`;

export default function info(write, args, env) {
    const argument = args[0]?.trim();
    if (argument === 'pav') {
            write('PAV-GNU Emulator, version 1.0.0\nA terminal emulator that emulates the features of a real terminal.\nUsed primarily as a Resume/Portfolio site, with some sandbox elements as they are developed.\nFor more information, visit the <a href="https://github.com/actuallypav/actuallypav.github.io/" target="_blank" style=font-style: italic; text-decoration:none;">repository page</a>.');
    } else if (argument === '') {
        write(`There is no info for the argument: '' currently.`);
    } else if (argument === undefined) {
        write(`Please provide an argument for the 'info' command.`);
    } else {
        write(`There is no info for the argument: ${argument} currently.`);
    }
}