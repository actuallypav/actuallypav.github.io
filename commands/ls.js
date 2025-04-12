import { getNodeFromPath } from "../vfs.js";

export const description = 'List files and directories in the current directory.';

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
