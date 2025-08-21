import { getNodeFromPath } from "../vfs.js"

export const description = `cd: cd [path]
    Change the current working directory.

    path
        Directory to change to. If not specified, defaults to /home.

    Special cases:
        ..
            Move up one level in the directory structure.
        relative path
            Combined with the current directory to form the new path.

    Errors:
        If the specified path does not exist or is not a directory,
        prints: "No such file or directory".

    Exit Status:
        0  if the directory is successfully changed.
        >0 if the path is invalid or not a directory.`;


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

        if (newPath.length > 1 && newPath.endsWith('/')) {
            newPath = newPath.slice(0, -1);
        }
    }

    const targetNode = getNodeFromPath(newPath)

    if (targetNode && targetNode.type === 'dir') {
        updatePath(newPath)
    } else {
        write(`bash: cd: ${inputPath}: No such file or directory`)
    }
}