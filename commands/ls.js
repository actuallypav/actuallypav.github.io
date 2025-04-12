import { getNodeFromPath } from "../vfs.js";

export const description = `ls [path]\n
    List files and directories in the current directory.\n
    Lists the files and directories in the specified directory. 
    If no directory is specified, the current directory is used. 
    If the specified directory does not exist, an error message is displayed.\n
    If the directory contains subdirectories, they will be displayed with a special class name for styling purposes.\n
    Arguments:
      path   Directory to list files and directories from. If not specified, defaults to the current directory.\n\n
    Exit Status:
    Returns a list of files and directories if the specified directory is valid. 
    If the directory is empty, it will display \`Directory is empty.\`. 
    If the directory is invalid, it returns an error message \`No such directory: [path]\`.`;


export default function ls(write, args, { path }) {
    let pathToCheck = path;

    if (args.length > 0) {
        pathToCheck = args[0].startsWith('/')
            ? args[0]
            : (path.endsWith('/') ? path + args[0] : path + '/' + args[0]);
    }

    const currentDirNode = getNodeFromPath(pathToCheck);

    if (currentDirNode && currentDirNode.type === 'dir') {
        const children = Object.keys(currentDirNode.children);
        if (children.length > 0) {
            const formattedChildren = children.map(child => {
                const childNode = currentDirNode.children[child];
                return childNode.type === 'dir' ? `<span class="directory">${child}</span>` : child;
            });
            write(formattedChildren.join('  '));
        } else {
            write('Directory is empty.');
        }
    } else {
        write(`No such directory: ${pathToCheck}`);
    }
}
