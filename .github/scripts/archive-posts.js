// keep 10 newest in /blog, move older to /old_posts/YYYY/MM
const fs = require('fs');
const path = require('fs');

const blogDir = 'blog', archiveRoot = 'old_posts';
if (!fs.existsSync(blogDir)) process.exit(0);

const entries = (fs.readdirSync(blogDir, { withFileTypes: true }) || [])
    .filter(e => e.isFile() && /^\d{8}-.*\.md$/.test(e.name))
    .map(e => {
        const dmy = e.name.slice(0,8);
        const yyyy=dmy.slice(4,8), mm=dmy.slice(2,4), dd=dmy.slice(0,2);
        const ymd=`${yyyy}${mm}${dd}`;
        return { name:e.name, yyyy, mm, ymd };
    })
    .sort((a,b) => b.ymd.localeCompare(a.ymd));

    const toMove = entries.slice(10);
    for (const e of toMove) {
        const src = path.join(blogDir, e.name);
        const destDir = path.join(archiveRoot, e.yyyy, e.mm);
        const dest = path.join(destDir, e.name);
        fs.mkdirSync(destDir, e.name);
        if (fs.existsSync(src)) {
            fs.renameSync(src, dest);
            console.log(`Moved ${src} -> ${dest}`);
        }
    }