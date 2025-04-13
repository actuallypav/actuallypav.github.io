marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    highlight: function(code, language) {
        return code;
    }
});

export const description = `cat [file]
    Display the contents of a file, GitHub repository overview, or CV markdown file.

    Supports:
      - Regular files: outputs raw content.
      - Portfolio: fetches and renders the "Overview" section of README.md from GitHub.
      - Resume: loads and renders associated markdown (.md) file from /resume.
      - Wildcards (*): matches and displays multiple entries.

    If the target is a directory, an error message is shown: \`Is a directory\`.
    If the specified file or path is not found, an error message is shown: \`No such file or directory\`.

    Arguments:
      file     Path to a file.
      *  Wildcard pattern to match multiple files or repos.

    Exit Status:
    Returns success (0) if content is displayed. Returns a non-zero status and error message if the file is not found or is invalid.`;

export default async function cat(write, args, env) {
    if (args.length === 0) {
        return;
    }

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
                    const fileContent = fileNode.content || '';
                    write(`<h3><a href="https://github.com/actuallypav/${repoName}" target="_blank" style="text-decoration:none;">Content of ${repoName}</a></h3>`);
                    write(fileContent);
                } else if (fileNode.type === 'repo') {
                    const repoNameWithExtension = file;
                    const repoName = repoNameWithExtension.substring(0, repoNameWithExtension.lastIndexOf('.'));
                    console.log(`Attempting to fetch README.md for repo: ${repoName}`);
                    await fetchRepoContent(repoName, write);
                    write('<hr>');
                } else if (fileNode.type === 'cv') {
                    const cvFile = file;
                    const mdFileName = cvFile.replace('.txt', '.md');
                    const mdPath = `../resume/${mdFileName}`;
                    try {
                        const response = await fetch(mdPath);
                        if (response.ok) {
                            const content = await response.text();
                            const html = marked.parse(content);
                            write(html);
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
        const repoNameWithExtension = cleanParts[cleanParts.length - 1];
        const repoName = repoNameWithExtension.substring(0, repoNameWithExtension.lastIndexOf('.'));
        console.log(`Attempting to fetch README.md for repo: ${repoName}`);
        await fetchRepoContent(repoName, write);
        write('<hr>');
    } 
    else if (node.type === 'cv') {
        const cvFile = cleanParts[cleanParts.length - 1];
        const mdFileName = cvFile.replace('.txt', '.md');
        const mdPath = `../resume/${mdFileName}`;
        try {
            const response = await fetch(mdPath);
            if (response.ok) {
                const content = await response.text();
                const output = marked.parse(content);
                write(output);
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
    const files = [];
    if (directoryNode.children) {
        Object.keys(directoryNode.children).forEach(child => {
            const type = directoryNode.children[child].type;
            if (type === 'file' || type === 'repo' || type === 'cv') {
                files.push(child);
            }
        });
    }
    return files;
}

async function fetchRepoContent(repoName, write) {
    if (!repoName) {
        write(`cat: Invalid repository name: ${repoName}`);
        return;
    }

    const githubUrl = `https://raw.githubusercontent.com/actuallypav/${repoName}/refs/heads/main/README.md`;

    try {
        const response = await fetch(githubUrl);
        if (response.ok) {
            let readmeContent = await response.text();

            const overviewContent = extractOverviewSection(readmeContent);

            if (overviewContent) {
                const filteredContent = overviewContent.replace(/<img[^>]*>/gi, '');
                const htmlContent = marked.parse(filteredContent);

                write(`<h3><a href="https://github.com/actuallypav/${repoName}" target="_blank">Overview of ${repoName} (Repository)</a></h3>`);
                write(htmlContent);
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

    if (match && match[1]) {
        return match[1].trim();
    }
    return null;
}
