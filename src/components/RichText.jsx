import { useMemo } from 'react';
import { renderRichText } from '../utils/richText.js';

export default function RichText({ value, className = '' }) {
  const html = useMemo(() => renderRichText(value), [value]);
  return <div className={`rich-text break-words ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
