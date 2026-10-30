import DOMPurify from 'dompurify';

const URL_PATTERN = /\b(?:https?:\/\/|www\.)[^\s<]+/gi;
const TRAILING_PUNCTUATION = /[.,;:!?)\]'"]+$/;

const isHtml = (value) => /^\s*<(p|h3|ul|ol|blockquote|pre|hr)\b/i.test(value);

function escapeHtml(text) {
  const holder = document.createElement('div');
  holder.textContent = text;
  return holder.innerHTML;
}

// Descriptions saved before the rich text editor are plain text.
export function toEditorHtml(value) {
  if (!value || isHtml(value)) return value ?? '';
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function linkifyTextNode(node, doc) {
  const text = node.textContent;
  const fragment = doc.createDocumentFragment();
  let position = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const url = match[0].replace(TRAILING_PUNCTUATION, '');
    fragment.append(text.slice(position, match.index));
    const link = doc.createElement('a');
    link.href = url.toLowerCase().startsWith('www.') ? `https://${url}` : url;
    link.textContent = url;
    fragment.append(link);
    position = match.index + url.length;
  }

  if (position === 0) return;
  fragment.append(text.slice(position));
  node.replaceWith(fragment);
}

// Safe HTML for display, with any written-out URL turned into a clickable link.
export function renderRichText(value) {
  const clean = DOMPurify.sanitize(toEditorHtml(value), {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h3', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr', 'a'],
    ALLOWED_ATTR: ['href'],
  });
  const doc = new DOMParser().parseFromString(clean, 'text/html');

  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  for (const node of textNodes) {
    if (!node.parentElement.closest('a, code, pre')) linkifyTextNode(node, doc);
  }

  for (const link of doc.querySelectorAll('a')) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  return doc.body.innerHTML;
}
