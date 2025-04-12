  export const fs = {
    '/': {
      type: 'dir',
      children: {
        'home': {
          type: 'dir',
          children: {
            'user': {
              type: 'dir',
              children: {}
            }
          }
        }
      }
    }
  };

  export function getNodeFromPath(p, fsRoot = fs['/']) {
    const parts = p.split('/').filter(Boolean);
    let node = fsRoot;
    for (let part of parts) {
      if (node.children[part]) {
        node = node.children[part];
      } else {
        return null;
      }
    }
    return node;
  }