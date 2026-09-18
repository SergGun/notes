import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface InsertionDividerProps {
  index: number;
  onInsert: (index: number) => void;
  isDragOver?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  className?: string;
}

export const InsertionDivider: React.FC<InsertionDividerProps> = ({
  index,
  onInsert,
  isDragOver = false,
  onDragOver,
  onDragLeave,
  onDrop,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      id={`insertion-divider-${index}`}
      className={`relative group h-6 -my-3 flex items-center justify-center transition-all duration-150 z-20 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Visual horizontal guide line */}
      <div
        className={`absolute inset-x-0 h-[1.5px] transition-all duration-200 pointer-events-none ${
          isDragOver
            ? 'bg-stone-800 scale-y-125'
            : isHovered
            ? 'bg-stone-300 opacity-100'
            : 'bg-transparent opacity-0'
        }`}
      />

      {/* Insertion Button */}
      <button
        id={`insert-note-btn-${index}`}
        type="button"
        title="Insert note here"
        onClick={(e) => {
          e.stopPropagation();
          onInsert(index);
        }}
        className={`relative z-10 flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-stone-400 ${
          isDragOver
            ? 'w-5 h-5 bg-stone-900 text-white scale-110 shadow-sm'
            : isHovered
            ? 'w-5 h-5 bg-white text-stone-700 border border-stone-300 shadow-sm hover:scale-110 hover:bg-stone-900 hover:text-white hover:border-stone-900'
            : 'w-4 h-4 bg-transparent text-transparent pointer-events-none'
        }`}
      >
        <Plus className="w-3 h-3 stroke-[2.5]" />
      </button>
    </div>
  );
};
