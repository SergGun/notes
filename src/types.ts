export interface Note {
  id: string;
  title: string;
  content: string; // HTML or ProseMirror JSON string
  order: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  pinned?: boolean;
  archived?: boolean;
  tags?: string[];
}

export type ViewFilter = 'all' | 'pinned' | 'archived';

export interface InsertionPoint {
  index: number;
}
