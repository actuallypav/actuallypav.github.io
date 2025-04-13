export const description = "";

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
                    write(`\n--- Content of ${file} ---\n`);
                    write(fileContent);
                } else if (fileNode.type === 'repo') {
                    const repoNameWithExtension = file;
                    const repoName = repoNameWithExtension.substring(0, repoNameWithExtension.lastIndexOf('.'));
                    console.log(`Attempting to fetch README.md for repo: ${repoName}`);
                    await fetchRepoContent(repoName, write);
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
            if (directoryNode.children[child].type === 'file' || directoryNode.children[child].type === 'repo') {
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
            const filteredContent = readmeContent.replace(/<img[^>]*>/gi, '');
            const htmlContent = marked.parse(filteredContent);
            write(`\n--- Content of ${repoName} (Repository) ---\n`);
            write(htmlContent);
        } else {
            write(`cat: Unable to fetch README.md for repo ${repoName}.`);
        }
    } catch (error) {
        write(`cat: Error fetching README.md for repo ${repoName}: ${error.message}`);
    }
}
