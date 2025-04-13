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
        } else {
            write(`cat: ${args[0]}: No such file or directory`);
            return;
        }
    }

    if (node.type === 'repo') {
        const repoName = cleanParts[cleanParts.length - 1].substring(0, cleanParts[cleanParts.length - 1].lastIndexOf('.'));
        const githubUrl = `https://raw.githubusercontent.com/actuallypav/${repoName}/refs/heads/main/README.md`

        try {
            const response = await fetch(githubUrl);
            if (response.ok) {
                let readmeContent = await response.text();
                const filteredContent = readmeContent.replace(/<img[^>]*>/gi, '');
                write(readmeContent);
            } else {
                write(`cat: ${args[0]}: Unable to fetch the project.`);
            }
        } catch (error) {
            write(`cat: ${args[0]}: Error fetching the README.md: ${error.message}`);
        }
    } else if (node.type === 'file') {
        write(node.content || '');
    } else {
        write(`cat: ${args[0]}: Is a directory`)
    }
}