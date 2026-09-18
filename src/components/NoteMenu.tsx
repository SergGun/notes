import React, { useEffect, useRef } from 'react';
import {
  Pin,
  PinOff,
  Copy,
  ArrowUp,
  ArrowDown,
  Archive,
  ArchiveRestore,
  Trash2,
  Edit3,
  ClipboardCopy,
} from 'lucide-react';
import { Note } from '../types';

interface NoteMenuProps {
  note: Note;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onClose: () => void;
  onFocusTitle: () => void;
  onDuplicate: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onCopyContent: (note: Note) => void;
  onDelete: (id: string) => void;
}

export const NoteMenu: React.FC<NoteMenuProps> = ({
  note,
  canMoveUp,
  canMoveDown,
  onClose,
  onFocusTitle,
  onDuplicate,
  onTogglePin,
  onToggleArchive,
  onMoveUp,
  onMoveDown,
  onCopyContent,
  onDelete,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      id={`note-menu-${note.id}`}
      className="absolute right-0 top-8 z-40 w-48 py-1 bg-white border border-stone-200/90 rounded-xl shadow-lg text-stone-700 text-xs animate-in fade-in zoom-in-95 duration-100"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        id={`menu-rename-${note.id}`}
        type="button"
        onClick={() => {
          onFocusTitle();
          onClose();
        }}
        className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-stone-100 text-stone-700 transition-colors"
      >
        <Edit3 className="w-3.5 h-3.5 text-stone-400" />
        <span>Rename title</span>
      </button>

      <button
        id={`menu-pin-${note.id}`}
        type="button"
        onClick={() => {
          onTogglePin(note.id);
          onClose();
        }}
        className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-stone-100 text-stone-700 transition-colors"
      >
        {note.pinned ? (
          <>
            <PinOff className="w-3.5 h-3.5 text-amber-500" />
            <span>Unpin note</span>
          </>
        ) : (
          <>
            <Pin className="w-3.5 h-3.5 text-stone-400" />
            <span>Pin to top</span>
          </>
        )}
      </button>

      <button
        id={`menu-duplicate-${note.id}`}
        type="button"
        onClick={() => {
          onDuplicate(note.id);
          onClose();
        }}
        className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-stone-100 text-stone-700 transition-colors"
      >
        <Copy className="w-3.5 h-3.5 text-stone-400" />
        <span>Duplicate</span>
      </button>

      <button
        id={`menu-copy-${note.id}`}
        type="button"
        onClick={() => {
          onCopyContent(note);
          onClose();
        }}
        className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-stone-100 text-stone-700 transition-colors"
      >
        <ClipboardCopy className="w-3.5 h-3.5 text-stone-400" />
        <span>Copy as text</span>
      </button>

      <div className="h-[1px] bg-stone-100 my-1" />

      {canMoveUp && (
        <button
          id={`menu-move-up-${note.id}`}
          type="button"
          onClick={() => {
            onMoveUp(note.id);
            onClose();
          }}
          className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-stone-100 text-stone-700 transition-colors"
        >
          <ArrowUp className="w-3.5 h-3.5 text-stone-400" />
          <span>Move up</span>
        </button>
      )}

      {canMoveDown && (
        <button
          id={`menu-move-down-${note.id}`}
          type="button"
          onClick={() => {
            onMoveDown(note.id);
            onClose();
          }}
          className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-stone-100 text-stone-700 transition-colors"
        >
          <ArrowDown className="w-3.5 h-3.5 text-stone-400" />
          <span>Move down</span>
        </button>
      )}

      <button
        id={`menu-archive-${note.id}`}
        type="button"
        onClick={() => {
          onToggleArchive(note.id);
          onClose();
        }}
        className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-stone-100 text-stone-700 transition-colors"
      >
        {note.archived ? (
          <>
            <ArchiveRestore className="w-3.5 h-3.5 text-stone-400" />
            <span>Unarchive</span>
          </>
        ) : (
          <>
            <Archive className="w-3.5 h-3.5 text-stone-400" />
            <span>Archive note</span>
          </>
        )}
      </button>

      <div className="h-[1px] bg-stone-100 my-1" />

      <button
        id={`menu-delete-${note.id}`}
        type="button"
        onClick={() => {
          onDelete(note.id);
          onClose();
        }}
        className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-red-50 text-red-600 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5 text-red-500" />
        <span>Delete note</span>
      </button>
    </div>
  );
};
