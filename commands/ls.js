import { getNodeFromPath } from "../vfs.js";
import { list as listBlog } from "../content/blogLoader.js";

console.log('[ls] called with path=', path, 'args[0]=', args[0]);

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

export default async function ls(write, args, { path }) {
    let pathToCheck = args[0]
    ? (args[0].startsWith('/') ? args[0] : (path.endsWith('/') ? path+args[0] : path+'/'+args[0]))
    : path;

    let dynamicPath = null;
    if (/^\/home\/[^/]+\/blog\/?$/.test(pathToCheck)) dynamicPath = '/blog';
    const mHome = pathToCheck.match(/^\/home\/[^/]+\/old_posts\/(\d{4})\/(\d{2})\/?$/);
    if (mHome) dynamicPath = `/old_posts/${mHome[1]}/${mHome[2]}`;
    if (pathToCheck === '/blog') dynamicPath = '/blog';
    const mAbs = pathToCheck.match(/^\/old_posts\/(\d{4})\/(\d{2})\/?$/);
    if (mAbs) dynamicPath = `/old_posts/${mAbs[1]}/${mAbs[2]}`;

    //dynamic listing for blog/archive
    if (dynamicPath) {
        console.log('[ls] dynamicPath=', dynamicPath);
        try {
            const items = await listBlog(dynamicPath); // expects [{path,date,title}]
            if (!items?.length) return write('Directory is empty.');
            const html = items.map(p =>
                `<a href="#" class="fs-link" data-fs-type="file" data-fs-path="${p.path}">${p.date}-${p.title.replace(/</g,'&lt;')}</a>`
            ).join('  ');
            return write(html);                     // 👈 ensure this return
        } catch (e) {
            console.error('ls dynamic error', e);
            return write(`ls: failed to load index for ${dynamicPath}`);  // 👈 and this return
        }
    }

    //fallback to static VFS listing
    const node = getNodeFromPath(pathToCheck);
    if (node && node.type === 'dir') {
        const children = Object.keys(node.children);
        if (children.length === 0) return write('Directory is empty.');

        const base = pathToCheck === '/' ? '' : pathToCheck;
        const html = children.map(name => {
            const child = node.children[name];
            const full = `${base}${base.endsWith('/') ? '' : '/' }${name}`;
            return child.type === 'dir'
                ? `<a href="#" class="fs-link" data-fs-type="dir" data-fs-path="${full}">${name}/</a>`
                : `<a href="#" class="fs-link" data-fs-type="file" data-fs-path="${full}">${name}</a>`;
        }).join('  ');

        return write(html);
    }

  //error
  write(`No such directory: ${pathToCheck}`);
}