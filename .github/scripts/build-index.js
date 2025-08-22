//scripts/build-index.js
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, 'blog');
const OLD_DIR  = path.join(ROOT, 'old_posts');

const ensureDir = p => fs.existsSync(p) || fs.mkdirSync(p, { recursive: true });
const writeJSON = (p, obj) => fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n');
const readText  = p => fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';

function findMD(base) {
    const out = [];
    if (!fs.existsSync(base)) return out;
    (function walk(dir){
        for (const name of fs.readdirSync(dir)) {
            const full = path.join(dir, name);
            const st = fs.statSync(full);
            if (st.isDirectory()) walk(full);
            else if (st.isFile() && name.toLowerCase().endsWith('.md')) out.push(full);
        }
    })(base);
    return out;
}

function guessTitle(file, md) {
    const m1 = md.match(/(?:^|\n)\s*title:\s*["']?(.+?)["']?\s*$/mi);
    if (m1) return m1[1].trim();
    const m2 = md.match(/^(#|##)\s+(.+)$/m);
    if (m2) return m2[2].trim();
    return path.basename(file).replace(/\.md$/i, '');
}

function guessDate(file) {
    const b = path.basename(file);
    const m = b.match(/^(\d{2})(\d{2})(\d{4})/); // DDMMYYYY
    return m ? m[0] : '00000000';
}

function parseDateParts(ddmmyyyy) {
    return { dd: ddmmyyyy.slice(0,2), mm: ddmmyyyy.slice(2,4), yyyy: ddmmyyyy.slice(4,8) };
}

//move older posts into /old_posts/YYYY/MM
function archiveOldPosts() {
    ensureDir(BLOG_DIR);
    ensureDir(OLD_DIR);

    const files = findMD(BLOG_DIR).filter(f => path.dirname(f) === BLOG_DIR);
    const posts = files.map(f => {
        const md = readText(f);
        return {
            abs: f,
            path: '/' + path.relative(ROOT, f).replace(/\\/g,'/'),
            date: guessDate(f),
            title: guessTitle(f, md)
        };
    }).sort((a,b) => b.date.localeCompare(a.date));

    const keep = posts.slice(0, 10);
    const archive = posts.slice(10);

    for (const p of archive) {
        const { mm, yyyy } = parseDateParts(p.date);
        const destDir = path.join(OLD_DIR, yyyy, mm);
        ensureDir(destDir);
        const destPath = path.join(destDir, path.basename(p.abs));

        //move file
        fs.renameSync(p.abs, destPath);
        console.log(`Archived: ${p.abs} → ${destPath}`);
    }
}

//rebuild blog index (latest 10)
function buildBlogIndex() {
    ensureDir(BLOG_DIR);
    const files = findMD(BLOG_DIR).filter(f => path.dirname(f) === BLOG_DIR);
    const items = files.map(f => {
        const md = readText(f);
        return {
            path: '/' + path.relative(ROOT, f).replace(/\\/g,'/'),
            date: guessDate(f),
            title: guessTitle(f, md)
        };
    }).sort((a,b) => b.date.localeCompare(a.date));
    writeJSON(path.join(BLOG_DIR, 'index.json'), items);
}

//rebuild archive indexes
function buildArchiveIndexes() {
    if (!fs.existsSync(OLD_DIR)) return;
    const mdFiles = findMD(OLD_DIR); // /old_posts/YYYY/MM/*.md

    const years = new Set();
    const byYear = new Map();

    for (const f of mdFiles) {
        const rel = path.relative(ROOT, f).replace(/\\/g,'/');
        const parts = rel.split('/');
        if (parts.length < 4) continue;
        const y = parts[1], mm = parts[2];
        years.add(y);
        const md = readText(f);
        const entry = { path: '/' + rel, date: guessDate(f), title: guessTitle(f, md) };
        if (!byYear.has(y)) byYear.set(y, []);
        byYear.get(y).push(entry);
    }

    const yearsList = Array.from(years).sort();
    writeJSON(path.join(OLD_DIR, 'index.json'), yearsList);

    for (const y of yearsList) {
        const items = (byYear.get(y) || []).sort((a,b)=> b.date.localeCompare(a.date));
        const yearDir = path.join(OLD_DIR, y);
        ensureDir(yearDir);
        writeJSON(path.join(yearDir, 'index.json'), items);

        const byMonth = new Map();
        for (const it of items) {
            const mm = it.path.split('/')[3];
            if (!byMonth.has(mm)) byMonth.set(mm, []);
            byMonth.get(mm).push(it);
        }
        for (const [mm, arr] of byMonth) {
            const monthDir = path.join(OLD_DIR, y, mm);
            ensureDir(monthDir);
            writeJSON(path.join(monthDir, 'index.json'), arr.sort((a,b)=> b.date.localeCompare(a.date)));
        }
    }
}

// --- Run all ---
archiveOldPosts();
buildBlogIndex();
buildArchiveIndexes();

console.log('Indexes rebuilt with archiving.');
