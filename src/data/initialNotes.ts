import { Note } from '../types';

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Product Architecture & Edge Sync',
    content: `
      <p>Evaluating the client-first data pipeline for zero-latency interactions.</p>
      <h2>Core Considerations</h2>
      <ul data-type="taskList">
        <li data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Local-first reactive state cache</p></div></li>
        <li data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Optimistic document mutations with undo stacks</p></div></li>
        <li data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Conflict-free delta merging for multi-device sync</p></div></li>
      </ul>
      <blockquote>"Speed is the primary user interface. An application that responds instantly feels like an extension of the human thought process."</blockquote>
      <p>Target latency threshold: <code>&lt; 16ms</code> for all keystrokes and inline insertions.</p>
    `.trim(),
    order: 0,
    pinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: 'note-2',
    title: 'Design System & Micro-Interactions',
    content: `
      <p>Principles drawn from Apple Notes, Craft, and Linear:</p>
      <ul>
        <li><strong>Restrained surfaces:</strong> Let typography and generous margins establish spatial rhythm rather than heavy borders or deep shadows.</li>
        <li><strong>Contextual affordance:</strong> Controls stay invisible until the cursor hovers or text is focused.</li>
        <li><strong>Inline insertion:</strong> Reveal insertion lines between items for fluid flow.</li>
      </ul>
      <pre><code>const transition = {
  duration: 0.18,
  ease: [0.16, 1, 0.3, 1]
};</code></pre>
    `.trim(),
    order: 1,
    pinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'note-3',
    title: 'Weekly Reading & Resources',
    content: `
      <p>Articles and essays on typography and modern desktop UX:</p>
      <ol>
        <li>Optical sizing in contemporary typography</li>
        <li>The mechanics of direct manipulation interfaces</li>
        <li>Keyboard-first workflows for modern knowledge workers</li>
      </ol>
      <p>Remember to review the layout benchmarks on Friday morning.</p>
    `.trim(),
    order: 2,
    pinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
];
