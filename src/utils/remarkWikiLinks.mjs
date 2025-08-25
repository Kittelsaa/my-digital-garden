import { visit } from 'unist-util-visit';

const processedFiles = new Set();

export function remarkPlugin() {
  return (tree, file) => {
    if (file.history && file.history.length > 0) {
      const currentFile = file.history[0];
      if (processedFiles.has(currentFile)) {
        return;
      }
      processedFiles.add(currentFile);
    }

    visit(tree, 'text', (node) => {
      const regex = /\[\[(.*?)(?:\|(.*?))?\]\]/g;
      const value = node.value;
      const matches = [];
      let match;
      
      while ((match = regex.exec(value)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          target: match[1],
          label: match[2] || match[1]
        });
      }
      
      if (matches.length === 0) return;
      
      const children = [];
      let lastIndex = 0;
      
      for (const match of matches) {
        if (match.start > lastIndex) {
          children.push({
            type: 'text',
            value: value.slice(lastIndex, match.start)
          });
        }
        
        const slug = match.target.toLowerCase().replace(/ /g, '-');
        children.push({
          type: 'link',
          url: `/notes/${slug}`,
          children: [{ type: 'text', value: match.label }],
          data: { hProperties: { className: 'wiki-link' } }
        });
        
        lastIndex = match.end;
      }
      
      if (lastIndex < value.length) {
        children.push({
          type: 'text',
          value: value.slice(lastIndex)
        });
      }
      
      node.type = 'paragraph';
      node.children = children;
      delete node.value;
    });
  };
}


