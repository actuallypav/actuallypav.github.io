import { list as listBlog, fetchPost } from '../content/blogLoader.js';
import MarkdownIt from "https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm";

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


const mdParser = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight:true,
  breaks: true
});

export default async function blog(write, args) {
  if (args.length === 0)
    return write('blog: missing argument. Usage: blog <DDMMYYYY|latest|list>');

  const posts = await listBlog('/blog') || [];
  if (posts.length === 0) return write('blog: no posts found');

  const arg = String(args[0]).toLowerCase();

  //list
  if (arg === 'list' || arg === '--list') {
    const rows = posts.map(p => {
      const path = p.path || ('/' + String(p.file || '').replace(/^\/+/, ''));
      const date = p.date;
      const title = (p.title || '').replace(/</g,'&lt;');
      return `<a href="#" class="fs-link" data-fs-type="file" data-fs-path="${path}">${date} — ${title}</a>`;
    });
    return write(rows.join('<br>'));
  }

  //latest
  if (arg === 'latest') {
    const p = posts[0];
    const md = await fetchPost(p.path || ('/' + p.file));
    return write(`<h2>${p.title}</h2>\n${mdParser.render(md)}`);
  }

  //DDMMYYYY
  if (!/^\d{8}$/.test(arg))
    return write('blog: invalid date. Use DDMMYYYY, "latest", or "list"');

  //convert DDMMYYYY -> YYYY-MM-DD
  const dd = arg.slice(0,2), mm = arg.slice(2,4), yyyy = arg.slice(4);
  const iso = `${yyyy}-${mm}-${dd}`;

  // try exact date match first, then fallback to filename prefix (e.g. 01092025-*)
  const p =
    posts.find(x => x.date === iso) ||
    posts.find(x => {
      const fname = (x.file || x.path || '').split('/').pop() || '';
      return fname.toLowerCase().startsWith(`${arg}-`);
    });

  if (!p)
    return write(`blog: no post for ${arg}. Try "blog list".`);

  const md = await fetchPost(p.path || ('/' + p.file));
  return write(`<h2>${p.title}</h2>\n${mdParser.render(md)}`);
}
