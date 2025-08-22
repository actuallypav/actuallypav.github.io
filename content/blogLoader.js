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

    if (dirPath.startsWith('/old_posts')) {
        const all = await getJSON('/old_posts/index.json');

        const m = dirPath.match(/^\/old_posts(?:\/(\d{4})(?:\/(\d{2}))?)?$/);
        if(!m) return null;
        const [, y, mm] = m;
        if (!y) {
            return Array.from(
                new Set(all.map(p => p.path.split('/')[2]))
            ).sort();
        }

        if (!mm) {
            return Array.from(
                new Set(
                    all
                        .filter(p => p.path.includes(`/old_posts/${y}/`))
                        .map(p => p.path.split('/')[3])
                )
            ).sort();
        }

        return all.filter(p => p.path.includes(`/old_posts/${y}/${mm}/`));
    }

    return null;
}

//fetch a markdown file by repo-relativve path(blog/DDMMYYYY or old_post/YYYY/MM)
export async function fetchPost(sitePath) {
    const p = sitePath.startsWith('/') ? sitePath : `/${sitePath}`;
    return await getText(p);
}
