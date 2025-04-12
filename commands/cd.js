import { getNodeFromPath } from "../vfs.js"

export const description = `cd [path]
    Change the current directory.
    Changes the current working directory to the specified PATH. 
    If no PATH is specified, the default directory is set to \`/home\`. If PATH is \`..\`, it moves up one level in the directory structure.\n
    For relative paths, the current path is combined with the specified path to form the new directory.
    If the specified directory does not exist or is not a directory, an error message is shown: \`No such file or directory\`.\n
    Arguments:
      path   Directory to change to. If not specified, defaults to \`/home\`.\n
    Exit Status:
    Returns success (0) if the directory is successfully changed. If the specified path is invalid or not a directory, returns an error message and non-zero status.`;


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