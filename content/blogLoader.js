async function getJSON(path) {
  const r = await fetch(path, { cache: 'no-store' });
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${path}`);
  return r.json();
}

async function getText(path) {
  const r = await fetch(path, { cache: 'no-store' });
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${path}`);
  return r.text();
}

//list entries for /blog or /old_posts/YYYY/MM
//returns: [{ path:"/blog/10102025-title.md", date:"10102025", title:"title" }, ...]
export async function list(dirPath) {
  if (dirPath === '/blog') {
    return await getJSON('/blog/index.json');
  }
  const m = dirPath.match(/^\/old_posts\/(\d{4})\/(\d{2})$/);
  if (m) {
    const [, y, mm] = m;
    return await getJSON(`/old_posts/${y}/${mm}/index.json`);
  }
  return null;
}

//fetch a single markdown post by site-relative path
//accepts "/blog/10102025-title.md" or "blog/10102025-title.md"
export async function fetchPost(sitePath) {
  const p = sitePath.startsWith('/') ? sitePath : `/${sitePath}`;
  return await getText(p);
}