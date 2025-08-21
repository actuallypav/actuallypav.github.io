const REPO_OWNER = 'actuallypav'
const REPO_NAME = 'actuallypav.github.io'
const BRANCH = 'main';

const RAW = (p) => `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${p}`;

async function getJSON(url) {
    const r = await fetch(url, { cahe: 'no-store' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
}
async function getText(url) {
    const r = await fetch(url, {cache: 'no-store' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.text();
}

//list entries for a path (/blog or /old_posts)
export async function list(path) {
    if (path === '/blog'){
        return await getJSON(RAW('blog/index.json')); //[{date, name, title, path}]
    }
    const m = path.match(/^\/old_posts\/(\d{4})\/(\d{2})$/);
    if (m) {
        const [_, y, mth] = m;
        return await getJSON(RAW(`old_posts/${y}/${mth}/index.json`));
    }
    return null;
}

//fetch a markdown file by repo-relativve path(blog/DDMMYYYY or old_post/YYYY/MM)
export async function fetchPost(repoPath) {
    return await getText(RAW(repoPath))
}