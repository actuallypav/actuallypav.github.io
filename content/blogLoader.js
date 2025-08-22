async function getJSON(url) {
    const r = await fetch(path, { cache: 'no-store' });
    if (!r.ok) throw new Error(`HTTP ${r.status} for ${path}`);
    return r.json()
}
async function getText(url) {
    const r = await fetch(path, {cache: 'no-store' });
    if (!r.ok) throw new Error(`HTTP ${r.status} for ${path}`);
    return r.text();
}

//list entries for a path (/blog or /old_posts)
export async function list(path) {
    if (dirPath === '/blog'){
        return await getJSON('/blog/index.json');
    }
    const m = dirPath.match(/^\/old_posts\/(\d{4})\/(\d{2})$/);
    if (m) {
        const [_, y, mth] = m;
        return await getJSON(`/old_posts/${y}/${mm}/index.json`);
    }
    return null;
}

//fetch a markdown file by repo-relativve path(blog/DDMMYYYY or old_post/YYYY/MM)
export async function fetchPost(repoPath) {
    const p = sitePath.startsWith('/') ? sitePath : `/${sitePath}`;
    return await getText(p);
}