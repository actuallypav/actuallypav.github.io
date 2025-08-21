import { getNodeFromPath } from "../vfs.js";
import { list as listBlog } from '../content/blogLoader.js';

export const description = `ls: ls [path]
    List files and directories.

    path
        Directory to list. If not specified, defaults to the current directory.

    Behavior:
        If the directory contains subdirectories, they are displayed
        with a special class name for styling.
        If the directory is empty, prints: "Directory is empty."

    Errors:
        If the specified directory does not exist, prints:
        "No such directory: [path]".

    Exit Status:
        0  if files and directories are listed.
        >0 if the directory is invalid.`;

export default function ls(write, args, { path }) {
    let pathToCheck = path;

    if (args.length > 0) {
        pathToCheck = args[0].startsWith('/')
            ? args[0]
            : (path.endsWith('/') ? path + args[0] : path + '/' + args[0]);
    }

    //check for dynamic blog/archive dirs first
    const dynamic = await (async () => {
        if (pathToCheck === '/blog') return await listBlog('/blog');
        const m = pathToCheck.match(/^\/old_posts\/\d{4}\/\d{2}$/);
        if (m) return await listBlog(pathToCheck);
        return null;
    })();

    if (dynamic) {
        const formatted = dynamic.map(p =>
            `<a href="#" class="fs-link" data-fs-type="file" data-fs-path="${p.path}">${p.date}-${p.title.replace(/</g,'&lt;')}</a>`
        );
        return write(formatted.join('  '));
    }

    const currentDirNode = getNodeFromPath(pathToCheck);

    if (currentDirNode && currentDirNode.type === 'dir') {
        const children = Object.keys(currentDirNode.children);
        if (children.length > 0) {
            const basePath = pathToCheck === '/' ? '' : pathToCheck;
            const formatted = children.map(name => {
                const node = currentDirNode.children[name];
                const full = `${basePath}${basePath.endsWith('/') ? '' : '/'}${name}`;
                if (node.type === 'dir') {
                    return `<a href="#" class="fs-link" data-fs-type="dir" data-fs-path="${full}">${name}/</a>`;
                } else {
                    return `<a href="#" class="fs-link" data-fs-type="file" data-fs-path="${full}">${name}</a>`;
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
