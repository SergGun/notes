import React from 'react';
import { Search, Plus, X, Pin, Archive, FileText, CheckCircle2 } from 'lucide-react';
import { ViewFilter } from '../types';

interface HeaderProps {
  totalCount: number;
  pinnedCount: number;
  archivedCount: number;
  currentFilter: ViewFilter;
  onFilterChange: (filter: ViewFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewNote: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  pinnedCount,
  archivedCount,
  currentFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onNewNote,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#faf9f6]/90 backdrop-blur-md border-b border-stone-200/60 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: App Title & Note count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight text-stone-900">
              Notes
            </span>
            <span className="text-xs text-stone-400 font-medium">
              {totalCount} {totalCount === 1 ? 'note' : 'notes'}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-stone-200 hidden sm:block" />

          {/* Filter Pills */}
          <nav className="flex items-center gap-1">
            <button
              id="filter-all-btn"
              type="button"
              onClick={() => onFilterChange('all')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                currentFilter === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/50'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>All</span>
            </button>

            {pinnedCount > 0 && (
              <button
                id="filter-pinned-btn"
                type="button"
                onClick={() => onFilterChange('pinned')}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  currentFilter === 'pinned'
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/50'
                }`}
              >
                <Pin className="w-3 h-3" />
                <span>Pinned</span>
                <span className="text-[10px] opacity-75">({pinnedCount})</span>
              </button>
            )}

            {archivedCount > 0 && (
              <button
                id="filter-archived-btn"
                type="button"
                onClick={() => onFilterChange('archived')}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  currentFilter === 'archived'
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/50'
                }`}
              >
                <Archive className="w-3 h-3" />
                <span>Archive</span>
                <span className="text-[10px] opacity-75">({archivedCount})</span>
              </button>
            )}
          </nav>
        </div>

        {/* Right: Search & New Note Action */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 pointer-events-none" />
            <input
              id="notes-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search notes..."
              className="pl-8 pr-7 py-1 w-32 sm:w-44 text-xs bg-stone-100/80 hover:bg-stone-100 focus:bg-white text-stone-800 placeholder:text-stone-400 border border-stone-200/80 rounded-full focus:outline-none focus:ring-1 focus:ring-stone-400 focus:w-48 sm:focus:w-56 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2 p-0.5 text-stone-400 hover:text-stone-600 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* New Note Button */}
          <button
            id="header-new-note-btn"
            type="button"
            title="Create note (⌘+Shift+N)"
            onClick={onNewNote}
            className="flex items-center gap-1.5 px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-full shadow-xs transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-stone-400"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Note</span>
          </button>
        </div>
      </div>
    </header>
  );
};
