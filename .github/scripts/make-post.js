
import fs from 'node:fs';
import path from 'node:path';

const EVENT_PATH = process.env.GITHUB_EVENT_PATH;
if (!EVENT_PATH || !fs.existsSync(EVENT_PATH)) {
    console.error('GITHUB_EVENT_PATH not found.');
    process.exit(1);
}

const event = JSON.parse(fs.readFileSync(EVENT_PATH, 'utf8'));
const issue = event.issue || {};
const title = (issue.title || 'Untitled').trim();
const body  = (issue.body  || '').trim();

const pad = n => String(n).padStart(2, '0');
const now  = new Date(new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' }));
const today = `${pad(now.getDate())}${pad(now.getMonth()+1)}${now.getFullYear()}`;

//date override: "date: DDMMYYYY" or "date: YYYY-MM-DD"
const m1 = body.match(/^\s*date:\s*(\d{2})(\d{2})(\d{4})\s*$/im);
const m2 = body.match(/^\s*date:\s*(\d{4})-(\d{2})-(\d{2})\s*$/im);
const ddmmyyyy = m1 ? `${m1[1]}${m1[2]}${m1[3]}`
    : m2 ? `${pad(m2[3])}${pad(m2[2])}${m2[1]}`
    : today;

// slug override: "slug: my-custom-slug"
const ms = body.match(/^\s*slug:\s*([a-z0-9-]+)\s*$/im);
const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'post';
const slug = (ms ? ms[1] : baseSlug).toLowerCase();

const fileName = `${ddmmyyyy}-${slug}.md`;
const relPath  = path.join('blog', fileName);

// Simple content: H1 + body
const content = `# ${title}\n\n${body}\n`;
fs.mkdirSync('blog', { recursive: true });
fs.writeFileSync(relPath, content, 'utf8');

// Emit outputs to workflow
const out = process.env.GITHUB_OUTPUT;
if (out) {
    fs.appendFileSync(out, `path=${relPath}\n`);
    fs.appendFileSync(out, `title=${title}\n`);
    fs.appendFileSync(out, `date=${ddmmyyyy}\n`);
}

console.log(`Created ${relPath}`);