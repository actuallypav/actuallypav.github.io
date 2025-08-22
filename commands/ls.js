import { getNodeFromPath } from "../vfs.js";
import { list as listBlog } from "../content/blogLoader.js";

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
    const isHomeBlog = /^\/home\/[^/]+\/blog\/?$/.test(pathToCheck);
    if (isHomeBlog) dynamicPath = '/blog';

    const mNestedYM  = pathToCheck.match(/^\/home\/[^/]+\/blog\/old_posts\/(\d{4})\/(\d{2})\/?$/);
    const mNestedY   = pathToCheck.match(/^\/home\/[^/]+\/blog\/old_posts\/(\d{4})\/?$/);
    const isOldRoot  = /^\/home\/[^/]+\/blog\/old_posts\/?$/.test(pathToCheck);

    if (mNestedYM) dynamicPath = `/old_posts/${mNestedYM[1]}/${mNestedYM[2]}`;
    else if (mNestedY) dynamicPath = `/old_posts/${mNestedY[1]}`;
    else if (isOldRoot) dynamicPath = '/old_posts';

    if (pathToCheck === '/blog') dynamicPath = '/blog';
    const mAbsYM = pathToCheck.match(/^\/old_posts\/(\d{4})\/(\d{2})\/?$/);
    const mAbsY  = pathToCheck.match(/^\/old_posts\/(\d{4})\/?$/);
    if (mAbsYM) dynamicPath = `/old_posts/${mAbsYM[1]}/${mAbsYM[2]}`;
    else if (mAbsY) dynamicPath = `/old_posts/${mAbsY[1]}`;
    else if (pathToCheck === '/old_posts') dynamicPath = '/old_posts';

    if (dynamicPath) {
        try {
            const items = await listBlog(dynamicPath);

            // Posts (blog or year/month in old_posts)
            if (dynamicPath === '/blog' || /^\/old_posts\/\d{4}\/\d{2}$/.test(dynamicPath)) {
                const posts = (items || []).map(p =>
                    `<a href="#" class="fs-link" data-fs-type="file" data-fs-path="${p.path}">${p.date}-${p.title.replace(/</g,'&lt;')}</a>`
                );
                if (isHomeBlog) {
                    const oldPath = pathToCheck.replace(/\/$/, '') + '/old_posts';
                    posts.unshift(`<a href="#" class="fs-link" data-fs-type="dir" data-fs-path="${oldPath}">old_posts/</a>`);
                }
                if (!posts.length) return write('Directory is empty.');
                    return write(posts.join('  '));
            }

            // Years list
            if (dynamicPath === '/old_posts') {
                if (!items?.length) return write('Directory is empty.');
                const out = items.map(y =>
                    `<a href="#" class="fs-link" data-fs-type="dir" data-fs-path="${pathToCheck.replace(/\/$/,'')}/${y}">${y}/</a>`
                );
                return write(out.join('  '));
            }

            // Months in a year
            const mYear = dynamicPath.match(/^\/old_posts\/(\d{4})$/);
            if (mYear) {
                if (!items?.length) return write('Directory is empty.');
                const base = pathToCheck.replace(/\/$/,'');
                const out = items.map(mm =>
                    `<a href="#" class="fs-link" data-fs-type="dir" data-fs-path="${base}/${mm}">${mm}/</a>`
                );
                return write(out.join('  '));
            }

            return write('Directory is empty.');
        } catch (e) {
            console.error('ls dynamic error', e);
            return write(`ls: failed to load index for ${dynamicPath}`);
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