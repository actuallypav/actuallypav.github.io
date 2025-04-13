export const description = "";

export default function cat(write, args, env) {
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
    } if (node.type === 'file') {
        write(node.content || '');
    } else {
        write(`cat: ${args[0]}: Is a directory`)
    }
}