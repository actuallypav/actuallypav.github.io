import { getNodeFromPath } from "../vfs.js";

export default function ls(write, args, {cwd, fs}) {
    let pathToCheck = '/home';
    
    if (args.length > 0) {
        pathToCheck = `/home/${args[0]}`;
    }

    const currentDirNode = getNodeFromPath(pathToCheck);

    if (currentDirNode && currentDirNode.type === 'dir') {
        const children = Object.keys(currentDirNode.children);
        if (children.length > 0) {
            write(children.join('\n'));
        } else {
            write('Directory is empty.');
        }
    } else {
        write(`No such directory: ${pathToCheck}`);
    }
}
