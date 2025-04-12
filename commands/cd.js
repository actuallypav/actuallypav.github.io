import { getNodeFromPath } from "../vfs.js"

export const description = 'Change directory. Usage: cd &lt;path&gt;';

export default function cd(write, args, { cwd, path, fs, getNodeFromPath, updatePath}) {
    if (args.length === 0) {
        updatePath(`/home`);
        return;
    }

    let inputPath = args[0]
    let newPath = '';

    if (inputPath.startsWith('/')) {
        //absolute path
        newPath = inputPath;
    } else if (inputPath === '..') {
        //go up a level
        const parts = path.split('/').filter(Boolean);
        parts.pop();
        newPath = '/' + parts.join('/');
    } else {
        //relative path
        newPath = path.endsWith('/') ? path + inputPath : path + '/' + inputPath;
    }

    const targetNode = getNodeFromPath(newPath)

    if (targetNode && targetNode.type === 'dir') {
        updatePath(newPath)
    } else {
        write(`bash: cd: ${inputPath}: No such file or directory`)
    }
}