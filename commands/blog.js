import { list as listBlog, fetchPost } from '../content/blogLoader.js';

export const description = `blog: blog [latest|DDMMYYYY|--list]
    Manage and view blog posts from the terminal.

    list
        List recent blog posts with dates and titles.

    latest
        Open and display the most recent blog post.

    DDMMYYYY
        Open and display the blog post published on the specified date.
        Example: blog 24091999 opens the post from 24 September 1999.

    Errors:
        blog: missing argument. Usage: blog <DDMMYYYY|latest|list>
        blog: no posts found
        blog: invalid date. Use DDMMYYYY, "latest", or "list"
        blog: no post for <date>. Try "blog list".

    Exit Status:
        0  if a post or list is displayed.
        >0 if no posts exist, the argument is invalid, or no post matches the date.`;


export default async function blog(write, args) {
    if (args.length === 0)
        return write('blog: missing argument. Usage: blog <DDMMYYYY|latest|list>');

    const posts = await listBlog('/blog') || [];
    if (posts.length === 0) return write('blog: no posts found');

    const arg = args[0].toLowerCase();

    if (arg === 'latest') {
        const p = posts[0];
        const md = await fetchPost(p.path);
        return write(`<h2>${p.title}</h2>\n${md}`);
    }

    if (!/^\d{8}$/.test(arg))
        return write('blog: invalid date. Use DDMMYYYY, "latest", or "list"');

    const p = posts.find(x => x.date === args);
    if (!p)
        return write(`blog: no post for ${arg}. Try "blog list".`)

    const md = await fetchPost(p.path);
    write(`<h2>${p.title}</h2>\n${md}`);
}