import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Highlighter,
  Minus,
  Undo,
  Redo,
  Link as LinkIcon,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
  onClose?: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const btnClass = (isActive: boolean) =>
    `p-1.5 rounded text-xs transition-colors flex items-center justify-center ${
      isActive
        ? 'bg-stone-900 text-white'
        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
    }`;

  return (
    <div
      id="editor-floating-toolbar"
      className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-lg rounded-xl text-stone-700 animate-in fade-in zoom-in-95 duration-150 z-30"
      onMouseDown={(e) => e.preventDefault()} // Prevent editor from losing focus
    >
      <button
        id="toolbar-bold-btn"
        type="button"
        title="Bold (Cmd+B)"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive('bold'))}
      >
        <Bold className="w-3.5 h-3.5" />
      </button>

      <button
        id="toolbar-italic-btn"
        type="button"
        title="Italic (Cmd+I)"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive('italic'))}
      >
        <Italic className="w-3.5 h-3.5" />
      </button>

      <button
        id="toolbar-underline-btn"
        type="button"
        title="Underline (Cmd+U)"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={btnClass(editor.isActive('underline'))}
      >
        <UnderlineIcon className="w-3.5 h-3.5" />
      </button>

      <button
        id="toolbar-strike-btn"
        type="button"
        title="Strikethrough"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={btnClass(editor.isActive('strike'))}
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </button>

      <button
        id="toolbar-highlight-btn"
        type="button"
        title="Highlight"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={btnClass(editor.isActive('highlight'))}
      >
        <Highlighter className="w-3.5 h-3.5" />
      </button>

      <button
        id="toolbar-code-btn"
        type="button"
        title="Inline Code"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={btnClass(editor.isActive('code'))}
      >
        <Code className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-stone-200 mx-1" />

      <button
        id="toolbar-h1-btn"
        type="button"
        title="Heading 1"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={btnClass(editor.isActive('heading', { level: 1 }))}
      >
        <Heading1 className="w-3.5 h-3.5" />
      </button>

      <button
        id="toolbar-h2-btn"
        type="button"
        title="Heading 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btnClass(editor.isActive('heading', { level: 2 }))}
      >
        <Heading2 className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-stone-200 mx-1" />

      <button
        id="toolbar-tasklist-btn"
        type="button"
        title="Checklist / Task List"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={btnClass(editor.isActive('taskList'))}
      >
        <CheckSquare className="w-3.5 h-3.5" />
      </button>

      <button
        id="toolbar-bulletlist-btn"
        type="button"
        title="Bullet List"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive('bulletList'))}
      >
        <List className="w-3.5 h-3.5" />
      </button>

      <button
        id="toolbar-orderedlist-btn"
        type="button"
        title="Numbered List"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClass(editor.isActive('orderedList'))}
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </button>

      <button
        id="toolbar-blockquote-btn"
        type="button"
        title="Quote"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btnClass(editor.isActive('blockquote'))}
      >
        <Quote className="w-3.5 h-3.5" />
      </button>

      <button
        id="toolbar-divider-btn"
        type="button"
        title="Horizontal Divider"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-1.5 rounded text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors flex items-center justify-center"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <button
        id="toolbar-link-btn"
        type="button"
        title="Insert Link"
        onClick={setLink}
        className={btnClass(editor.isActive('link'))}
      >
        <LinkIcon className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-stone-200 mx-1" />

      <button
        id="toolbar-undo-btn"
        type="button"
        title="Undo (Cmd+Z)"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
        className="p-1.5 rounded text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <Undo className="w-3.5 h-3.5" />
      </button>

      <button
        id="toolbar-redo-btn"
        type="button"
        title="Redo (Cmd+Shift+Z)"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
        className="p-1.5 rounded text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <Redo className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
