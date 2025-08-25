/*Utility functions - handling bi-directional links in the digital garden*/
export function findBacklinks(allNotes, currentSlug, depth = 1) {
  if (depth <= 0) return []; 
  
  return allNotes.filter(note => {
    const wikiLinkRegex = new RegExp(`\\[\\[(${currentSlug}|${note.data.title})\\]\\]`, 'g');
    return note.slug !== currentSlug && note.body.match(wikiLinkRegex);
  }).map(note => ({
    title: note.data.title,
    slug: note.slug,
    growthStage: note.data.growthStage
  }));
}

export function extractWikiLinks(content) {
  const wikiLinkRegex = /\[\[(.*?)\]\]/g;
  const matches = [...content.matchAll(wikiLinkRegex)];
  return matches.map(match => match[1]);
}