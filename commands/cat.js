import { fetchPost } from "../content/blogLoader.js";
import { marked } from "https://cdn.jsdelivr.net/npm/marked@12.0.2/lib/marked.esm.js";

marked.use({
  gfm: true,
  breaks: false,
});

export const description = `cat: cat [file|pattern]
    Display the contents of files, GitHub repository overviews, or CV markdown files.

    file
        Output the raw contents of the specified file.

    pattern
        Use wildcards (*) to match and display multiple files or repositories.

    Special cases:
        GitHub repository
            Fetch and render the "Overview" section of README.md.
        Resume
            Load and render the associated markdown (.md) file from /resume.

    Errors:
        If the target is a directory, prints: "Is a directory".
        If the file or path is not found, prints: "No such file or directory".

    Exit Status:
        0  if content is displayed.
        >0 if the file is invalid, not found, or is a directory.`;

export default async function cat(write, args, env) {
  if (args.length === 0) return;

  // handle blog/old_posts
  const raw = args[0] || '';
  let target = raw
    .replace(/^\/home\/[^/]+\/blog\/old_posts(\/|$)/, '/old_posts$1')
    .replace(/^\/home\/[^/]+\/blog(\/|$)/, '/blog$1')
    .replace(/^blog\/old_posts(\/|$)/, '/old_posts$1')
    .replace(/^blog(\/|$)/, '/blog$1');

  if (/^(\/)?(blog|old_posts)\//.test(target)) {
    if (!/\.md$/i.test(target)) target += '.md';
    try {
      const md = await fetchPost(target.startsWith('/') ? target : `/${target}`);
      write(marked.parse(md));
      return;
    } catch (e) {
      return write(`cat: ${target}: ${e.message}`);
    }
  }

  // --- generate default file path (VFS) ---
  const pathParts = args[0].startsWith('/')
    ? args[0].split('/')
    : (env.path + '/' + args[0]).split('/');

  const cleanParts = pathParts.filter(Boolean);
  let node = env.fs['/'];

  for (let part of cleanParts) {
    if (node.children && node.children[part]) {
      node = node.children[part];
    } else if (args[0] !== '*') {
      write(`cat: ${args[0]}: No such file or directory`);
      return;
    }
  }

  if (args[0].includes('*')) {
    const files = getFilesFromDirectory(node);
    const pattern = new RegExp(args[0].replace(/\*/g, '.*'));
    const matchingFiles = files.filter(file => pattern.test(file));

    if (matchingFiles.length > 0) {
      for (let file of matchingFiles) {
        const fileNode = node.children[file];

        if (fileNode.type === 'file') {
          write(fileNode.content || '');
        } else if (fileNode.type === 'repo') {
          const repoName = file.replace(/\.[^.]+$/, '');
          await fetchRepoContent(repoName, write);
          write('<hr>');
        } else if (fileNode.type === 'cv') {
          const mdFileName = file.replace('.txt', '.md');
          const mdPath = `../resume/${mdFileName}`;
          try {
            const response = await fetch(mdPath);
            if (response.ok) {
              const content = await response.text();
              write(marked.parse(content));
              write('<hr>');
            } else {
              write(`cat: Could not load ${mdFileName}`);
            }
          } catch (err) {
            write(`cat: Error loading ${mdFileName}: ${err.message}`);
          }
        }
      }
    } else {
      write(`cat: No files matching ${args[0]}`);
    }
  }
  else if (node.type === 'repo') {
    const repoName = cleanParts.at(-1).replace(/\.[^.]+$/, '');
    await fetchRepoContent(repoName, write);
    write('<hr>');
  }
  else if (node.type === 'cv') {
    const cvFile = cleanParts.at(-1);
    const mdFileName = cvFile.replace('.txt', '.md');
    const isContact = cvFile === 'contact.txt';
    const mdPath = isContact ? `../quicklinks/${mdFileName}` : `../resume/${mdFileName}`;
    try {
      const response = await fetch(mdPath);
      if (response.ok) {
        const content = await response.text();
        write(marked.parse(content));
        write('<hr>');
      } else {
        write(`cat: Could not load ${mdFileName}`);
      }
    } catch (err) {
      write(`cat: Error loading ${mdFileName}: ${err.message}`);
    }
  }
  else if (node.type === 'file') {
    write(node.content || '');
  }
  else {
    write(`cat: ${args[0]}: Is a directory`);
  }
}

function getFilesFromDirectory(directoryNode) {
  return Object.keys(directoryNode.children || {}).filter(child => {
    const type = directoryNode.children[child].type;
    return type === 'file' || type === 'repo' || type === 'cv';
  });
}

async function fetchRepoContent(repoName, write) {
  const githubUrl = `https://raw.githubusercontent.com/actuallypav/${repoName}/refs/heads/main/README.md`;

  try {
    const response = await fetch(githubUrl);
    if (response.ok) {
      let readmeContent = await response.text();
      const overviewContent = extractOverviewSection(readmeContent);

      if (overviewContent) {
        const filteredContent = overviewContent.replace(/<img[^>]*>/gi, '');
        write(`<h3><a href="https://github.com/actuallypav/${repoName}" target="_blank">Overview of ${repoName} (Repository)</a></h3>`);
        write(marked.parse(filteredContent));
      } else {
        write(`cat: Overview section not found in the README.md for repo ${repoName}.`);
      }
    } else {
      write(`cat: Unable to fetch README.md for repo ${repoName}.`);
    }
  } catch (error) {
    write(`cat: Error fetching README.md for repo ${repoName}: ${error.message}`);
  }
}

function extractOverviewSection(content) {
  const overviewRegex = /## Overview\s*(.*?)(\n##|\n#|\n$)/s;
  const match = content.match(overviewRegex);
  return match && match[1] ? match[1].trim() : null;
}
