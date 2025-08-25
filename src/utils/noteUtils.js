import { getCollection } from 'astro:content';

export async function getNote(slug) {
  const notes = await getCollection('notes');
  return notes.find(note => {
    const noteSlug = note.slug || note.id.split('/').pop().replace(/\.(md|mdx)$/, '');
    return noteSlug === slug;
  });
}

export async function findBacklinks(currentSlug, maxDepth = 1) {
  const allNotes = await getCollection('notes');
  const backlinks = [];
  
  for (const note of allNotes) {
    const noteSlug = note.slug || note.id.split('/').pop().replace(/\.(md|mdx)$/, '');
    
    if (noteSlug === currentSlug) continue; 
    
    const content = note.body;
    const wikiLinkRegex = /\[\[(.*?)(?:\|(.*?))?\]\]/g;
    let match;
    let hasLink = false;

    while ((match = wikiLinkRegex.exec(content)) !== null) {
      const linkedSlug = match[1].toLowerCase().replace(/ /g, '-');
      
      const isDirectLink = linkedSlug === currentSlug;
      const isAliasLink = note.data.aliases?.some(
        alias => alias.toLowerCase().replace(/ /g, '-') === currentSlug
      );
      
      if (isDirectLink || isAliasLink) {
        hasLink = true;
        break; 
      }
    }
    
    if (hasLink) {
      backlinks.push({
        title: note.data.title,
        slug: noteSlug,
        growthStage: note.data.growthStage || 'seedling',
        description: note.data.description || ''
      });
    }
  }
  
  return backlinks;
}

export async function getOutboundLinks(note, maxDepth = 1) {
  if (maxDepth <= 0) return []; 
  
  if (note.data.outboundLinks) {
    return note.data.outboundLinks;
  }
  
  const outboundLinks = [];
  const content = note.body;
  const wikiLinkRegex = /\[\[(.*?)(?:\|(.*?))?\]\]/g;
  let match;
  
  const processedSlugs = new Set();
  
  while ((match = wikiLinkRegex.exec(content)) !== null) {
    const linkedSlug = match[1].toLowerCase().replace(/ /g, '-');
    
    if (processedSlugs.has(linkedSlug)) continue;
    processedSlugs.add(linkedSlug);
    
    const linkedNote = await getNote(linkedSlug);
    if (linkedNote) {
      outboundLinks.push({
        title: linkedNote.data.title,
        slug: linkedNote.slug,
        growthStage: linkedNote.data.growthStage,
        description: linkedNote.data.description || ''
      });
    }
  }
  
  return outboundLinks;
}

export async function detectCircularReferences(startSlug, visited = new Set()) {
  if (visited.has(startSlug)) {
    return true; 
  }
  
  visited.add(startSlug);
  
  const note = await getNote(startSlug);
  if (!note) return false;
  
  const outboundSlugs = await getOutboundSlugsFromNote(note);
  
  for (const slug of outboundSlugs) {
    if (await detectCircularReferences(slug, new Set([...visited]))) {
      return true;
    }
  }
  
  return false;
}

async function getOutboundSlugsFromNote(note) {
  const content = note.body;
  const wikiLinkRegex = /\[\[(.*?)(?:\|(.*?))?\]\]/g;
  const slugs = new Set();
  let match;
  
  while ((match = wikiLinkRegex.exec(content)) !== null) {
    const linkedSlug = match[1].toLowerCase().replace(/ /g, '-');
    slugs.add(linkedSlug);
  }
  
  return [...slugs];
}