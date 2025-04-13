export const fs = {
  '/': {
    type: 'dir',
    children: {
      'home': {
        type: 'dir',
        children: {
          'file2.txt': {
            type: 'file',
            content: 'This is file2.txt content' 
          },
          'user': {
            type: 'dir',
            children: {
              'resume': {
                type: 'dir',
                children: {
                  'profile.txt': {
                    type: 'cv',
                    content: 'This is profile.txt content'  
                  },
                  'experience.txt': {
                    type: 'cv',
                    content: 'This is experience.txt content' 
                  },
                  'technical_skills.txt': {
                    type: 'cv',
                    content: 'This is techincal_skills.txt content'
                  },
                  'education.txt': {
                    type: 'cv',
                    content: 'This is education.txt content'
                  },
                  'languages.txt': {
                    type: 'cv',
                    content: 'This is languages.txt content'
                  },
                }
              },
              'portfolio': {
                type: 'dir',
                children: {
                  'est_service.tf': {
                    type: 'repo',
                  },
                  'smiley_kivy.py': {
                    type: 'repo'
                  },
                  'tf-sync.sh': {
                    type: 'repo'
                  },
                  'esp_iot.h': {
                    type: 'repo'
                  },
                  'data-board.tf': {
                    type: 'repo',
                  },
                  'actuallypav.github.io.js': {
                    type: 'repo',
                  },
                }
              },
              'contact': {
                type: 'dir',
                children: {
                  'contact.txt': {
                    type: 'file',
                    content: 'This is contact.txt content'
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