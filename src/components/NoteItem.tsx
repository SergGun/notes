import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import {
  GripVertical,
  MoreHorizontal,
  Pin,
  Check,
  Loader2,
} from 'lucide-react';
import { Note } from '../types';
import { formatRelativeTime } from '../utils/formatDate';
import { EditorToolbar } from './EditorToolbar';
import { NoteMenu } from './NoteMenu';
import { SlashCommandMenu } from './SlashCommandMenu';

interface NoteItemProps {
  note: Note;
  index: number;
  isActive: boolean;
  onSelect: (id: string) => void;
  onBlur: () => void;
  onUpdateTitle: (id: string, title: string) => void;
  onUpdateContent: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onCopyContent: (note: Note) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  autoFocusOnMount?: boolean;
  // Drag & drop handlers
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

export const NoteItem: React.FC<NoteItemProps> = ({
  note,
  index,
  isActive,
  onSelect,
  onBlur,
  onUpdateTitle,
  onUpdateContent,
  onDelete,
  onDuplicate,
  onTogglePin,
  onToggleArchive,
  onMoveUp,
  onMoveDown,
  onCopyContent,
  canMoveUp,
  canMoveDown,
  autoFocusOnMount,
  onDragStart,
  onDragEnd,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const [hasSelection, setHasSelection] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Write note content, or type '/' for commands...",
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Underline,
      Highlight,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-sky-600 underline cursor-pointer',
        },
      }),
    ],
    content: note.content,
    editorProps: {
      attributes: {
        class: 'note-content-prose focus:outline-none min-h-[3.5rem] py-1 cursor-text',
      },
      handleKeyDown: (_, event) => {
        if (event.key === 'Escape') {
          if (slashMenuOpen) {
            setSlashMenuOpen(false);
            return true;
          }
          onBlur();
          return true;
        }
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
          onBlur();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      setSaveStatus('saving');
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        onUpdateContent(note.id, html);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 1800);
      }, 400);

      // Check for slash command invocation
      const { selection, doc } = ed.state;
      const textBefore = doc.textBetween(
        Math.max(0, selection.from - 20),
        selection.from,
        '\n',
        '\0'
      );
      const match = textBefore.match(/\/([a-zA-Z0-9_-]*)$/);
      if (match) {
        setSlashMenuOpen(true);
        setSlashFilter(match[1] || '');
      } else {
        setSlashMenuOpen(false);
      }
    },
    onSelectionUpdate: ({ editor: ed }) => {
      const { from, to } = ed.state.selection;
      setHasSelection(from !== to);
    },
  });

  // Sync content if note updated externally
  useEffect(() => {
    if (editor && !isActive && note.content !== editor.getHTML()) {
      editor.commands.setContent(note.content, { emitUpdate: false });
    }
  }, [note.content, editor, isActive]);

  // Autofocus when newly inserted
  useEffect(() => {
    if (autoFocusOnMount) {
      if (note.title === 'Untitled Note' || !note.title.trim()) {
        titleInputRef.current?.focus();
        titleInputRef.current?.select();
      } else if (editor) {
        editor.commands.focus('end');
      }
    }
  }, [autoFocusOnMount, editor, note.title]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value;
      setSaveStatus('saving');
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        onUpdateTitle(note.id, newTitle);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 1800);
      }, 400);
    },
    [note.id, onUpdateTitle]
  );

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      editor?.commands.focus('start');
    } else if (e.key === 'Escape') {
      onBlur();
    }
  };

  const focusTitle = () => {
    onSelect(note.id);
    setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }, 50);
  };

  return (
    <div
      ref={cardRef}
      id={`note-card-${note.id}`}
      onClick={() => {
        if (!isActive) onSelect(note.id);
      }}
      className={`group relative rounded-xl transition-all duration-200 ${
        isActive
          ? 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] ring-1 ring-stone-900/10'
          : 'bg-white/70 hover:bg-white border border-stone-200/70 hover:border-stone-300 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
      }`}
    >
      {/* Top Contextual Toolbar (reveals when note is active and text is selected, or docked at top of active note) */}
      {isActive && (hasSelection || slashMenuOpen) && (
        <div className="absolute -top-11 left-6 z-40">
          <EditorToolbar editor={editor} />
        </div>
      )}

      {/* Note Content Container */}
      <div className="px-6 pt-5 pb-4">
        {/* Top Header Row: Drag Handle, Title, Pinned Indicator, Actions */}
        <div className="flex items-start gap-2.5">
          {/* Subtle Drag Handle (visible on hover) */}
          <div
            id={`drag-handle-${note.id}`}
            draggable
            onDragStart={(e) => onDragStart(e, index)}
            onDragEnd={onDragEnd}
            title="Drag to reorder note"
            className="mt-1 -ml-3 p-1 rounded cursor-grab active:cursor-grabbing text-stone-300 hover:text-stone-700 hover:bg-stone-100 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Note Title */}
          <div className="flex-1 min-w-0">
            <input
              ref={titleInputRef}
              id={`note-title-input-${note.id}`}
              type="text"
              defaultValue={note.title}
              onChange={handleTitleChange}
              onKeyDown={handleTitleKeyDown}
              onFocus={() => {
                if (!isActive) onSelect(note.id);
              }}
              placeholder="Untitled Note"
              className="w-full bg-transparent text-lg font-semibold tracking-tight text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-0 border-none p-0 transition-colors"
            />
          </div>

          {/* Status & Contextual Actions */}
          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            {/* Pinned badge/icon */}
            {note.pinned && (
              <button
                type="button"
                id={`pin-indicator-${note.id}`}
                onClick={() => onTogglePin(note.id)}
                title="Pinned note (click to unpin)"
                className="p-1 text-amber-600 hover:text-amber-700 transition-colors"
              >
                <Pin className="w-3.5 h-3.5 fill-amber-500/20 rotate-45" />
              </button>
            )}

            {/* Autosave Indicator */}
            {isActive && saveStatus !== 'idle' && (
              <div
                id={`autosave-status-${note.id}`}
                className="flex items-center gap-1 text-[11px] font-medium text-stone-400 px-1.5 py-0.5 rounded"
              >
                {saveStatus === 'saving' ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-stone-400" />
                    <span>Saving…</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600">Saved</span>
                  </>
                )}
              </div>
            )}

            {/* Action Menu Trigger (⋮) */}
            <div className="relative">
              <button
                id={`note-menu-trigger-${note.id}`}
                type="button"
                title="More actions"
                onClick={() => setMenuOpen((prev) => !prev)}
                className={`p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all ${
                  menuOpen ? 'bg-stone-100 text-stone-900' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {menuOpen && (
                <NoteMenu
                  note={note}
                  canMoveUp={canMoveUp}
                  canMoveDown={canMoveDown}
                  onClose={() => setMenuOpen(false)}
                  onFocusTitle={focusTitle}
                  onDuplicate={onDuplicate}
                  onTogglePin={onTogglePin}
                  onToggleArchive={onToggleArchive}
                  onMoveUp={onMoveUp}
                  onMoveDown={onMoveDown}
                  onCopyContent={onCopyContent}
                  onDelete={onDelete}
                />
              )}
            </div>
          </div>
        </div>

        {/* Note Rich-Text Content Area */}
        <div className="mt-2.5 relative note-editor pl-2">
          {editor && <EditorContent editor={editor} />}

          {/* Slash Commands Dropdown */}
          {editor && (
            <SlashCommandMenu
              editor={editor}
              isOpen={slashMenuOpen}
              onClose={() => setSlashMenuOpen(false)}
              filterText={slashFilter}
            />
          )}
        </div>

        {/* Footer: Updated Timestamp, Words/Chars hint, Archive tag */}
        <div className="mt-4 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400 select-none">
          <div className="flex items-center gap-2">
            <span>Updated {formatRelativeTime(note.updatedAt)}</span>
            {note.archived && (
              <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 text-[10px] font-medium">
                Archived
              </span>
            )}
          </div>

          {/* Quick subtle tip when active */}
          {isActive && (
            <div className="text-[10px] text-stone-400 hidden sm:flex items-center gap-2">
              <span>Type <kbd className="px-1 py-0.5 bg-stone-100 rounded text-stone-600 font-mono">/</kbd> for blocks</span>
              <span>•</span>
              <span><kbd className="px-1 py-0.5 bg-stone-100 rounded text-stone-600 font-mono">⌘+Enter</kbd> to finish</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
