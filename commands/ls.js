import { getNodeFromPath } from "../vfs.js";

export default function ls(write, args, {cwd, fs}) {
    const currentDirNode = getNodeFromPath(`/home/${args[0]}`);

    if (currentDirNode && currentDirNode.type === 'dir') {
        const children = Object.keys(currentDirNode.children);
        if (children.length > 0) {
            write(children.join('\n'));
        }
    }
}