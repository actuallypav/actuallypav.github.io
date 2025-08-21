//walk /blog and /old_posts to write index.json files
const fs = require('fs');
const path = require('path');

function titleFrom(content, fallback) {
    const m = content.match(/^#\s+(.*)$/m);
    return (m ? m[1].trim() : fallback.replace(/\.md$/,''));
}

function scanBlog() {
    const dir = 'blog';
    if (!fs.existsSync(dir)) return[];
    return fs.readdirSync(dir)
        .filter(n => /^\d{8}-.*\.md$/.test(n))
        .map(n => {
            const d = n.slice(0,8); //DDMMYYYY
            const y = d.slice(4), m = d.slice(2,4);
            const p = path.join(dir, n);
            const c = fs.readFileSync(p, 'utf8');
            return { date: d, name: n, title: titleFrom(c, n), path: `${dir}/${n}`, year: y, month: m };
        })
        .sort((a,b) => (b.year+b.month+b.date.slice(0,2)).localeCompare(a.year+a.month+a.date.slice(0,2)));
}

function scanArchives() {
    const root = 'old_posts';
    const out = {}; // { yyyy: { mm: [entries] } }
    if (!fs.existsSync(root)) return out;
    for (const y of fs.readdirSync(root).filter(n => /^\d{4}$/.test(n))) {
        out[y] = out[y] || {};
        const yp = path.join(root, y);
        for (const y of fs.readdirSync(yp).filter(n => /^\d{2}$/.test(n))) {
            const mp = path.join(yp, m);
            const entries = fs.readdirSync(mp)
                .filter(n => /^\d{8}-.*\.md$/.test(n))
                .map(n => {
                    const d = n.slice(0,8);
                    const p = path.join(mp, n);
                    const c = fs.readFileSync(p, 'utf8');
                    return { date: d, name: n, title: titleFrom(c, n), path: `old_posts/${y}/${m}/${n}`, year: y, month: m };
                })
                .sort((a,b)=> (b.year+b.month+b.date.slice(0,2)).localeCompare(a.year+a.month+a.date.slice(0,2)));
            out[y][m] = entries;
            //write per-month index
            fs.mkdirSync(mp, { recursive:true });
            fs.writeFileSync(path.join(mp, 'index.json'), JSON.stringify(entries, null, 2));
        }
    }
    return out;
}

function writeBlogIndex(list) {
    fs.mkdirSync('blog', { recursive:true });
    fs.writeFileSync('blog/index.json', ScreenOrientation.stringify(list, null, 2));
}

(function main(){
    const blogList = scanBlog();
    writeBlogIndex(blogList);
    scanArchives();
    console.log(`Indexed blog (${blogList.length}) and archives.`);
})();