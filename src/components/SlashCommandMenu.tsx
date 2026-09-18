import React, { useEffect, useState, useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
  Heading1,
  Heading2,
  Type,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
} from 'lucide-react';

interface SlashCommandMenuProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
  filterText: string;
}

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  execute: (editor: Editor) => void;
}

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  editor,
  isOpen,
  onClose,
  filterText,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const commands: CommandItem[] = [
    {
      id: 'text',
      title: 'Text',
      description: 'Start writing with plain paragraph text',
      icon: Type,
      execute: (ed) => ed.chain().focus().setParagraph().run(),
    },
    {
      id: 'h1',
      title: 'Heading 1',
      description: 'Large section heading',
      icon: Heading1,
      execute: (ed) => ed.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      id: 'h2',
      title: 'Heading 2',
      description: 'Medium subsection heading',
      icon: Heading2,
      execute: (ed) => ed.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      id: 'task',
      title: 'To-do list',
      description: 'Track tasks with interactive checkboxes',
      icon: CheckSquare,
      execute: (ed) => ed.chain().focus().toggleTaskList().run(),
    },
    {
      id: 'bullet',
      title: 'Bullet list',
      description: 'Create a simple bulleted list',
      icon: List,
      execute: (ed) => ed.chain().focus().toggleBulletList().run(),
    },
    {
      id: 'numbered',
      title: 'Numbered list',
      description: 'Create an ordered sequence',
      icon: ListOrdered,
      execute: (ed) => ed.chain().focus().toggleOrderedList().run(),
    },
    {
      id: 'quote',
      title: 'Quote',
      description: 'Capture a standout quote or callout',
      icon: Quote,
      execute: (ed) => ed.chain().focus().toggleBlockquote().run(),
    },
    {
      id: 'code',
      title: 'Code block',
      description: 'Display a snippet of monospace code',
      icon: Code,
      execute: (ed) => ed.chain().focus().toggleCodeBlock().run(),
    },
    {
      id: 'divider',
      title: 'Divider',
      description: 'Visually separate blocks with a line',
      icon: Minus,
      execute: (ed) => ed.chain().focus().setHorizontalRule().run(),
    },
  ];

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(filterText.toLowerCase()) ||
      cmd.description.toLowerCase().includes(filterText.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [filterText]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev <= 0 ? (filteredCommands.length || 1) - 1 : prev - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          // Delete the slash query if present
          runCommand(filteredCommands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands]);

  if (!isOpen || filteredCommands.length === 0) return null;

  const runCommand = (cmd: CommandItem) => {
    // Delete slash text in editor:
    // If user typed '/h1' etc., delete that range from current cursor
    const { state } = editor;
    const { from } = state.selection;
    // Look backwards for '/'
    const textBefore = state.doc.textBetween(Math.max(0, from - 20), from, '\n', '\0');
    const slashPos = textBefore.lastIndexOf('/');
    if (slashPos !== -1) {
      const deleteFrom = from - (textBefore.length - slashPos);
      editor.chain().deleteRange({ from: deleteFrom, to: from }).run();
    }
    cmd.execute(editor);
    onClose();
  };

  return (
    <div
      ref={containerRef}
      id="slash-command-menu"
      className="absolute left-4 top-12 z-50 w-64 max-h-64 overflow-y-auto p-1 bg-white border border-stone-200/90 rounded-xl shadow-xl animate-in fade-in zoom-in-95 duration-100 text-xs"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-stone-400 uppercase">
        Basic Blocks
      </div>
      {filteredCommands.map((cmd, idx) => {
        const Icon = cmd.icon;
        const isSelected = idx === selectedIndex;
        return (
          <button
            key={cmd.id}
            id={`slash-cmd-${cmd.id}`}
            type="button"
            onMouseEnter={() => setSelectedIndex(idx)}
            onClick={() => runCommand(cmd)}
            className={`w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-left transition-colors ${
              isSelected ? 'bg-stone-100 text-stone-900' : 'text-stone-700 hover:bg-stone-50'
            }`}
          >
            <div
              className={`w-6 h-6 rounded flex items-center justify-center border ${
                isSelected
                  ? 'bg-white border-stone-300 text-stone-900 shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-500'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{cmd.title}</div>
              <div className="text-[11px] text-stone-400 truncate">
                {cmd.description}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
