// create /blog/DDMMYYYY-slug.md from Issue (with optional date override)
const fs = require('fs');
const path = require('path');

const issue = JSON.parse(process.env.ISSUE_JSON)

const pad = x => String(x).padStart(2, '0');
const now = new Date();
const today = `${pad(now.getDate())}${pad(now.getMonth()+1)}${now.getFullYear()}`;

const title = (issue.title || 'Untitled').trim();
let body = (issue.body || '').trim();

//optional override for date of the post
let override = null;
const dateLine = body.match(/^\s*date:\s*(\d{8})\s*$/gim);
if (dateLine) {
    const m = /(\d{8})/.exec(dateLine[0]); if (m) override = m[1];
    body = body.replace(/^\s*date:\s*\d{8}\s*$/gim, '').trim();
}

function validDDMMYYYY(dmy){
    if(!/^\d{8}$/.test(dmy)) return false;
    const dd=+dmy.slice(0,2), mm=+dmy.slice(2,4), yyyy=+dmy.slice(4);
    if(mm<1||mm>12||dd<1||dd>31) return false;
    const iso = `${yyyy}-${pad(mm)}-${pad(dd)}T00:00:00Z`;
    const d = new Date(iso)
    return d.getUTCFullYear()===yyyy && d.getUTCMonth()+1 ===mm && d.getUTCDate()===dd;
}

const dateId = (override&& validDDMMYYYY(override)) ? override : today;
const slug = title.toLoweCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') || 'post';

const blogDir = 'blog';
const filename = `${dateId}-${slug}.md`;
const postPath = path.join(blogDir, filename);
const content = `# ${title}\n\n${body}\n`;

fs.mkdirSync(blogDir, { recursive: true });
fs.writeFileSync(postPath, content);
console.log('Wrote ${postPath');