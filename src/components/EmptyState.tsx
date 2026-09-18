import React from 'react';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  onCreateFirstNote: () => void;
  isFiltered?: boolean;
  filterName?: string;
  onClearFilter?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onCreateFirstNote,
  isFiltered = false,
  filterName = '',
  onClearFilter,
}) => {
  return (
    <div
      id="notes-empty-state"
      className="py-24 px-6 text-center max-w-sm mx-auto flex flex-col items-center animate-in fade-in zoom-in-95 duration-300"
    >
      <h3 className="text-xl font-semibold tracking-tight text-stone-800">
        {isFiltered ? `No ${filterName} notes` : 'Notes'}
      </h3>

      <p className="mt-2 text-sm text-stone-500">
        {isFiltered ? (
          <>
            No notes match your current filter.
            {onClearFilter && (
              <button
                type="button"
                onClick={onClearFilter}
                className="ml-1.5 text-stone-900 underline underline-offset-2 hover:text-stone-700"
              >
                Clear filter
              </button>
            )}
          </>
        ) : (
          'Nothing here yet.'
        )}
      </p>

      {!isFiltered && (
        <>
          <p className="mt-1 text-xs text-stone-400">
            Start writing your first note
          </p>

          <button
            id="empty-state-create-btn"
            type="button"
            title="Create first note"
            onClick={onCreateFirstNote}
            className="mt-6 w-11 h-11 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-md hover:bg-stone-800 hover:scale-105 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-stone-400"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </>
      )}
    </div>
  );
};
