export const description = `blog: blog [list|l|latest|DDMMYYYY|--help|--version]
    Manage and view blog posts from the terminal.

    list, l
        List the 10 most recent blog posts with dates and titles.

    latest
        Open and display the most recent blog post.

    DDMMYYYY
        Open and display the blog post published on the specified date.
        Example: blog 24091999 opens the post from 24 September 1999.

    Errors:
        If the /blog directory does not exist, prints: "blog: /blog directory not found".
        If no posts are available, prints: "blog: no posts found".
        If no argument is given, prints: "blog: missing argument. Usage: blog <DDMMYYYY|latest|list>".
        If the date is invalid, prints: "blog: invalid date. Use DDMMYYYY, \\"latest\\", or \\"list\\"".
        If no post exists for the given date, prints: "blog: no post for <date>. Try \\"blog list\\"".

    Exit Status:
        0  if a post or list of posts is displayed.
        >0 if the directory is missing, no posts exist, the argument is invalid, or no post matches the date.`;


export default function blog(write, args, { fs, getNodeFromPath }) {
    const blogDir = getNodeFromPath('/blog');
    if (!blogDir || blogDir.type !== 'dir') return write('blog: /blog drirector not found');

    const posts = Object.keys(blogDir.children)
        .filter(n => n.endsWith('.md') && blogDir.children[n].type === 'file')
        .map(name => {
            const m = name.match(/^(\d{8})/) //DDMMYYYY
            const date = m ? m[1] : null;
            const ymd = date ? (date.slice(4)+date.slice(2,4)+date.slice(0,2)) : '00000000';
            const content = blogDir.children[name].content || '';
            const t = content.match(/^#\s+(.*)$/m);
            const title = t ? t[1].trim() : name.replace(/\.md$/, '');
            return { name, date, ymd, title, content };
        })
        .filter(p=> p.date)
        .sort((a, b) => b.ymd.localeCompare(a.ymd)); //newest first

    if (posts.length === 0) return write('blog: no posts found');
    if (args.length === 0) return write('blog: missing argument. Usage: blog <DDMMYYYY|latest|list>');
    
    const arg = args[0].toLowerCase();
    if (arg === 'list' || arg === 'l') return write(posts.map(p => `${p.date} - ${p.title}`).join('\n'));
    if (arg === 'latest') { const p = posts[0]; return write(`<h2>${p.title}</h2>\n${p.content}`); }
    if (!/^\d{8}$/.test(arg)) return write('blog: invalid date. Use DDMMYYYY, "latest", or "--list"');

    const found = posts.find(p => p.date === arg);
    if (!found) return write(`blog:n no post for ${arg}. Try "blog list".`);
    write(`<h2>${found.title}</h2>\n${found.content}`);

}