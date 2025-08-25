import { visit } from "unist-util-visit";
import linkMaps from "../links.json";

export function remarkWikiLink() {
  return (tree) => {
    visit(tree, "text", (node, index, parent) => {
      const matches = Array.from(node.value.matchAll(/\[\[(.*?)\]\]/g));
      if (!matches.length) return;

      const children = [];
      let lastIndex = 0;

      matches.forEach((match) => {
        const [fullMatch, linkText] = match;
        const startIndex = match.index;
        const endIndex = startIndex + fullMatch.length;

        if (startIndex > lastIndex) {
          children.push({
            type: "text",
            value: node.value.slice(lastIndex, startIndex),
          });
        }

        const matchedPost = linkMaps.find((post) =>
          post.ids.some((id) => id.toLowerCase() === linkText.toLowerCase())
        );

        if (matchedPost) {
          children.push({
            type: "link",
            url: `/${matchedPost.slug}`,
            data: {
              hProperties: {
                className: ["wiki-link"], 
              },
            },
            children: [
              {
                type: "text",
                value: linkText,
              },
            ],
          });
        } else {
          children.push({
            type: "text",
            value: linkText,
          });
        }

        lastIndex = endIndex;
      });

      if (lastIndex < node.value.length) {
        children.push({
          type: "text",
          value: node.value.slice(lastIndex),
        });
      }

      parent.children.splice(index, 1, ...children);
    });
  };
}
