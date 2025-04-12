import { getNodeFromPath } from "../vfs.js";

export const description = 'List files and directories in the current directory.';

export default function ls(write, args, { cwd, fs }) {
    let pathToCheck = '/home';

    if (args.length > 0) {
        pathToCheck = `/home/${args[0]}`;
    }

    const currentDirNode = getNodeFromPath(pathToCheck);

    if (currentDirNode && currentDirNode.type === 'dir') {
        const children = Object.keys(currentDirNode.children);
        if (children.length > 0) {
            const formattedChildren = children.map(child => {
                const childNode = currentDirNode.children[child];
                if (childNode.type === 'dir') {
                    return `<span class="directory">${child}</span>`;
                } else {
                    return child;
                }
            });
            write(formattedChildren.join('  '));
        } else {
            write('Directory is empty.');
        }
    } else {
        write(`No such directory: ${pathToCheck}`);
    }
}
