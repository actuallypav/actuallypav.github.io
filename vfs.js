export const fs = {
    '/': {
      type: 'dir',
      children: {
        'home': {
          type: 'dir',
          children: {
            'file2.txt': {
              type: 'file',
              content: 'This is file2.txt content'  // Example content for the file
            },
            'user': {
              type: 'dir',
              children: {
                'resume': {
                  type: 'dir',
                  children: {
                    'cv.txt': {
                      type: 'file',
                      content: 'This is cv.txt content'  // Example content for cv.txt
                    }
                  }
                },
                'portfolio': {
                  type: 'dir',
                  children: {
                    'est.txt': {
                      type: 'file',
                      content: 'This is est.txt content'  // Example content for est.txt
                    },
                    'smiley.txt': {
                      type: 'file',
                      content: 'This is smiley.txt content'  // Example content for smiley.txt
                    }
                  }
                }
              }
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