async function getJSON(url) {
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
    return r.json()
}
async function getText(url) {
    const r = await fetch(url, {cache: 'no-store' });
    if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
    return r.text();
}

//list entries for a path (/blog or /old_posts)
export async function list(dirPath) {
    if (dirPath === '/blog'){
        return await getJSON('/blog/index.json');
    }
    const m = dirPath.match(/^\/old_posts\/(\d{4})\/(\d{2})$/);
    if (m) {
        const [_, y, mm] = m;
        return await getJSON(`/old_posts/${y}/${mm}/index.json`);
    }
    return null;
}

//fetch a markdown file by repo-relativve path(blog/DDMMYYYY or old_post/YYYY/MM)
export async function fetchPost(sitePath) {
    const p = sitePath.startsWith('/') ? sitePath : `/${sitePath}`;
    return await getText(p);
}