import { HiPencil, HiTrash } from 'react-icons/hi';

/** Slugify a string for URL use */
export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Format duration in seconds to m:ss */
export function formatDuration(s?: number): string {
  if (!s) return '-';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/** Generate action buttons for admin tables */
export function renderActions(
  item: any,
  onEdit: (item: any) => void,
  onDelete: (id: number) => void
) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => onEdit(item)}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-primary-600 transition-colors"
      >
        <HiPencil className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDelete(item.id)}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-600 transition-colors"
      >
        <HiTrash className="w-4 h-4" />
      </button>
    </div>
  );
}

/** Status badge component */
export function StatusBadge({ active, labelOn, labelOff, colorOn = 'green', colorOff = 'yellow' }: {
  active: boolean;
  labelOn?: string;
  labelOff?: string;
  colorOn?: string;
  colorOff?: string;
}) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
    gray: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' },
  };

  const style = active ? colorMap[colorOn] : colorMap[colorOff];
  const label = active ? (labelOn || 'Yes') : (labelOff || 'No');

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {label}
    </span>
  );
}
