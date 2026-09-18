import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Note, ViewFilter } from './types';
import { INITIAL_NOTES } from './data/initialNotes';
import { Header } from './components/Header';
import { NoteItem } from './components/NoteItem';
import { InsertionDivider } from './components/InsertionDivider';
import { EmptyState } from './components/EmptyState';
import { Keyboard, Check, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'modern_notes_interface_data_v1';

export default function App() {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_NOTES;
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ViewFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }, [notes]);

  // Flash a subtle save banner on Cmd+S
  const flashSavedBanner = useCallback((text = 'All changes saved') => {
    setSaveBanner(text);
    setTimeout(() => setSaveBanner(null), 2000);
  }, []);

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        // Filter by state
        if (filter === 'pinned') return !!note.pinned && !note.archived;
        if (filter === 'archived') return !!note.archived;
        // Default 'all': don't show archived unless archived filter is chosen
        if (note.archived) return false;
        return true;
      })
      .filter((note) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const titleMatch = note.title.toLowerCase().includes(q);
        const contentMatch = note.content.toLowerCase().includes(q);
        return titleMatch || contentMatch;
      });
  }, [notes, filter, searchQuery]);

  // Create a new note at a specific index
  const handleInsertNote = useCallback((insertIndex: number) => {
    const newNoteId = 'note-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const newNote: Note = {
      id: newNoteId,
      title: 'Untitled Note',
      content: '<p></p>',
      order: insertIndex,
      pinned: false,
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes((prevNotes) => {
      const updated = [...prevNotes];
      // Insert at the position in the current visible list
      const actualInsertIndex = Math.min(Math.max(0, insertIndex), updated.length);
      updated.splice(actualInsertIndex, 0, newNote);
      // Re-normalize orders
      return updated.map((n, idx) => ({ ...n, order: idx }));
    });

    setActiveNoteId(newNoteId);
    setNewlyCreatedId(newNoteId);
  }, []);

  // Note updates
  const handleUpdateTitle = useCallback((id: string, title: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, title, updatedAt: new Date().toISOString() }
          : n
      )
    );
  }, []);

  const handleUpdateContent = useCallback((id: string, content: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, content, updatedAt: new Date().toISOString() }
          : n
      )
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  }, [activeNoteId]);

  const handleDuplicate = useCallback((id: string) => {
    setNotes((prev) => {
      const idx = prev.findIndex((n) => n.id === id);
      if (idx === -1) return prev;
      const original = prev[idx];
      const dupId = 'note-' + Date.now();
      const duplicate: Note = {
        ...original,
        id: dupId,
        title: `${original.title} (Copy)`,
        order: idx + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [...prev];
      updated.splice(idx + 1, 0, duplicate);
      return updated.map((n, i) => ({ ...n, order: i }));
    });
  }, []);

  const handleTogglePin = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  }, []);

  const handleToggleArchive = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, archived: !n.archived } : n))
    );
  }, []);

  const handleMoveUp = useCallback((id: string) => {
    setNotes((prev) => {
      const idx = prev.findIndex((n) => n.id === id);
      if (idx <= 0) return prev;
      const updated = [...prev];
      const temp = updated[idx - 1];
      updated[idx - 1] = updated[idx];
      updated[idx] = temp;
      return updated.map((n, i) => ({ ...n, order: i }));
    });
  }, []);

  const handleMoveDown = useCallback((id: string) => {
    setNotes((prev) => {
      const idx = prev.findIndex((n) => n.id === id);
      if (idx === -1 || idx >= prev.length - 1) return prev;
      const updated = [...prev];
      const temp = updated[idx + 1];
      updated[idx + 1] = updated[idx];
      updated[idx] = temp;
      return updated.map((n, i) => ({ ...n, order: i }));
    });
  }, []);

  const handleCopyContent = useCallback((note: Note) => {
    // Strip HTML to plain text or copy HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = note.content;
    const plainText = `${note.title}\n\n${tempDiv.innerText}`;
    navigator.clipboard.writeText(plainText).then(() => {
      flashSavedBanner('Note copied to clipboard');
    });
  }, [flashSavedBanner]);

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDropOnDivider = (targetDividerIndex: number) => {
    if (draggedIndex === null) return;
    if (draggedIndex === targetDividerIndex || draggedIndex + 1 === targetDividerIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    setNotes((prev) => {
      const updated = [...prev];
      const [draggedItem] = updated.splice(draggedIndex, 1);
      // Adjust target index if item was pulled before target
      const finalIndex =
        draggedIndex < targetDividerIndex
          ? targetDividerIndex - 1
          : targetDividerIndex;
      updated.splice(finalIndex, 0, draggedItem);
      return updated.map((n, i) => ({ ...n, order: i }));
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Keyboard Shortcuts handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Cmd/Ctrl + Shift + N: Create new note
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'N' || e.key === 'n')) {
        e.preventDefault();
        handleInsertNote(0);
        return;
      }

      // Cmd/Ctrl + S: Force save banner
      if ((e.metaKey || e.ctrlKey) && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        flashSavedBanner('All changes saved');
        return;
      }

      // Cmd/Ctrl + K: Focus search
      if ((e.metaKey || e.ctrlKey) && (e.key === 'K' || e.key === 'k')) {
        e.preventDefault();
        const searchInput = document.getElementById('notes-search-input');
        searchInput?.focus();
        return;
      }

      // If outside active text inputs, arrow navigation
      const activeEl = document.activeElement;
      const isTyping =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.getAttribute('contenteditable') === 'true';

      if (!isTyping) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setNotes((currentNotes) => {
            const currentIdx = currentNotes.findIndex((n) => n.id === activeNoteId);
            const nextIdx = Math.min(currentNotes.length - 1, currentIdx + 1);
            if (currentNotes[nextIdx]) {
              setActiveNoteId(currentNotes[nextIdx].id);
            }
            return currentNotes;
          });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setNotes((currentNotes) => {
            const currentIdx = currentNotes.findIndex((n) => n.id === activeNoteId);
            const prevIdx = Math.max(0, currentIdx - 1);
            if (currentNotes[prevIdx]) {
              setActiveNoteId(currentNotes[prevIdx].id);
            }
            return currentNotes;
          });
        } else if (e.key === 'Enter' && activeNoteId) {
          // Focus editing on current active note
          const card = document.getElementById(`note-card-${activeNoteId}`);
          const editorEl = card?.querySelector('.tiptap') as HTMLElement;
          editorEl?.focus();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeNoteId, handleInsertNote, flashSavedBanner]);

  const pinnedCount = useMemo(() => notes.filter((n) => n.pinned && !n.archived).length, [notes]);
  const archivedCount = useMemo(() => notes.filter((n) => n.archived).length, [notes]);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-950 pb-28">
      {/* Top Header */}
      <Header
        totalCount={notes.filter((n) => !n.archived).length}
        pinnedCount={pinnedCount}
        archivedCount={archivedCount}
        currentFilter={filter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewNote={() => handleInsertNote(0)}
      />

      {/* Subtle Toast / Notification Banner */}
      <AnimatePresence>
        {saveBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="fixed top-16 right-6 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-stone-100 text-xs rounded-full shadow-lg"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{saveBanner}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 pt-8">
        {filteredNotes.length === 0 ? (
          <EmptyState
            onCreateFirstNote={() => handleInsertNote(0)}
            isFiltered={notes.length > 0 && (filter !== 'all' || !!searchQuery)}
            filterName={filter}
            onClearFilter={() => {
              setFilter('all');
              setSearchQuery('');
            }}
          />
        ) : (
          <div className="space-y-4">
            {/* Top Insertion Divider: creates note at position 0 */}
            <InsertionDivider
              index={0}
              onInsert={() => handleInsertNote(0)}
              isDragOver={dragOverIndex === 0}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverIndex(0);
              }}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={(e) => {
                e.preventDefault();
                handleDropOnDivider(0);
              }}
            />

            {/* Render Note Cards with Inline Insertion Dividers between them */}
            <AnimatePresence initial={false}>
              {filteredNotes.map((note, index) => {
                const isFirst = index === 0;
                const isLast = index === filteredNotes.length - 1;

                return (
                  <React.Fragment key={note.id}>
                    <motion.div
                      layout="position"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                      transition={{
                        duration: 0.2,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="relative"
                    >
                      <NoteItem
                        note={note}
                        index={index}
                        isActive={activeNoteId === note.id}
                        onSelect={(id) => setActiveNoteId(id)}
                        onBlur={() => setActiveNoteId(null)}
                        onUpdateTitle={handleUpdateTitle}
                        onUpdateContent={handleUpdateContent}
                        onDelete={handleDelete}
                        onDuplicate={handleDuplicate}
                        onTogglePin={handleTogglePin}
                        onToggleArchive={handleToggleArchive}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                        onCopyContent={handleCopyContent}
                        canMoveUp={!isFirst}
                        canMoveDown={!isLast}
                        autoFocusOnMount={newlyCreatedId === note.id}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      />
                    </motion.div>

                    {/* Insertion divider directly beneath note */}
                    <InsertionDivider
                      index={index + 1}
                      onInsert={() => handleInsertNote(index + 1)}
                      isDragOver={dragOverIndex === index + 1}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverIndex(index + 1);
                      }}
                      onDragLeave={() => setDragOverIndex(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleDropOnDivider(index + 1);
                      }}
                    />
                  </React.Fragment>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Floating Keyboard Shortcuts Hint Button (bottom right) */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          id="shortcuts-toggle-btn"
          type="button"
          title="Keyboard shortcuts"
          onClick={() => setShowShortcutsHelp((prev) => !prev)}
          className="p-2 rounded-full bg-white border border-stone-200 shadow-sm hover:shadow text-stone-500 hover:text-stone-900 transition-all flex items-center gap-1.5 text-xs focus:outline-none"
        >
          <Keyboard className="w-4 h-4" />
          <span className="hidden sm:inline font-medium">Shortcuts</span>
        </button>

        {showShortcutsHelp && (
          <div
            id="shortcuts-help-dialog"
            className="absolute bottom-12 right-0 w-72 p-4 bg-white border border-stone-200 rounded-2xl shadow-xl text-stone-700 text-xs animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 font-semibold text-stone-900">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Shortcuts & Flow
              </span>
              <button
                type="button"
                onClick={() => setShowShortcutsHelp(false)}
                className="text-stone-400 hover:text-stone-600 font-mono"
              >
                ✕
              </button>
            </div>
            <div className="mt-3 space-y-2 text-stone-600">
              <div className="flex items-center justify-between">
                <span>Hover between notes</span>
                <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-[11px] font-mono">
                  + Insert
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Slash commands</span>
                <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-[11px] font-mono">
                  /
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>New note</span>
                <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-[11px] font-mono">
                  ⌘⇧N
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Finish / blur note</span>
                <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-[11px] font-mono">
                  ⌘+Enter
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Save state</span>
                <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-[11px] font-mono">
                  ⌘+S
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Navigate notes</span>
                <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-[11px] font-mono">
                  ↑ / ↓
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Close menus</span>
                <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-[11px] font-mono">
                  Esc
                </kbd>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
