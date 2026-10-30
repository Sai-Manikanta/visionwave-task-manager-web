import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState } from 'react';
import { toEditorHtml } from '../utils/richText.js';
import { isHttpUrl } from '../utils/validation.js';

const BUTTONS = [
  { name: 'bold', label: 'B', title: 'Bold', className: 'font-bold', run: (chain) => chain.toggleBold() },
  { name: 'italic', label: 'I', title: 'Italic', className: 'italic', run: (chain) => chain.toggleItalic() },
  { name: 'underline', label: 'U', title: 'Underline', className: 'underline', run: (chain) => chain.toggleUnderline() },
  { name: 'heading', attrs: { level: 3 }, label: 'H', title: 'Heading', className: 'font-semibold', run: (chain) => chain.toggleHeading({ level: 3 }) },
  { name: 'bulletList', label: '• List', title: 'Bulleted list', run: (chain) => chain.toggleBulletList() },
  { name: 'orderedList', label: '1. List', title: 'Numbered list', run: (chain) => chain.toggleOrderedList() },
];

function ToolbarButton({ active, title, className = '', onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      // Keeps the text selection in the editor while the button is clicked.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`cursor-pointer rounded px-2 py-1 text-sm ${className} ${active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}
    >
      {children}
    </button>
  );
}

function LinkRow({ editor, onClose }) {
  const [url, setUrl] = useState(editor.getAttributes('link').href ?? '');
  const [error, setError] = useState('');

  function apply() {
    const trimmed = url.trim();
    const chain = editor.chain().focus().extendMarkRange('link');
    if (!trimmed) {
      chain.unsetLink().run();
      onClose();
      return;
    }
    const href = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
    if (!isHttpUrl(href)) {
      setError('Enter a valid web address.');
      return;
    }
    if (editor.state.selection.empty && !editor.isActive('link')) {
      chain.insertContent({ type: 'text', text: trimmed, marks: [{ type: 'link', attrs: { href } }] }).run();
    } else {
      chain.setLink({ href }).run();
    }
    onClose();
  }

  function onKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      apply();
    }
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
    }
  }

  return (
    <div className="border-b border-slate-200 p-2">
      <div className="flex gap-2">
        <input
          autoFocus
          type="url"
          aria-label="Link address"
          placeholder="https://"
          className="input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button type="button" className="btn-secondary" onClick={apply}>
          {url.trim() ? 'Apply' : 'Remove'}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function RichTextEditor({ value, onChange, label = 'Description', invalid }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [3] },
        link: {
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
          defaultProtocol: 'https',
          protocols: ['http', 'https', 'mailto'],
          HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
        },
      }),
    ],
    content: toEditorHtml(value),
    editorProps: {
      attributes: {
        'aria-label': label,
        'aria-multiline': 'true',
        role: 'textbox',
        class: 'rich-text min-h-28 px-3 py-2 focus:outline-none',
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.isEmpty ? '' : current.getHTML()),
  });

  const active = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      Object.fromEntries([
        ...BUTTONS.map((button) => [button.name, current?.isActive(button.name, button.attrs) ?? false]),
        ['link', current?.isActive('link') ?? false],
      ]),
  });

  return (
    <div className={`overflow-hidden rounded-md border bg-white focus-within:border-brand-600 focus-within:ring-1 focus-within:ring-brand-600 ${invalid ? 'border-red-500' : 'border-slate-300'}`}>
      <div role="toolbar" aria-label={`${label} formatting`} className="flex flex-wrap gap-0.5 border-b border-slate-200 bg-slate-50 p-1">
        {BUTTONS.map((button) => (
          <ToolbarButton
            key={button.name}
            title={button.title}
            className={button.className}
            active={active?.[button.name]}
            onClick={() => button.run(editor.chain().focus()).run()}
          >
            {button.label}
          </ToolbarButton>
        ))}
        <ToolbarButton title="Link" active={linkOpen || active?.link} onClick={() => setLinkOpen((open) => !open)}>
          Link
        </ToolbarButton>
      </div>
      {linkOpen && editor && <LinkRow editor={editor} onClose={() => setLinkOpen(false)} />}
      <EditorContent editor={editor} />
    </div>
  );
}
