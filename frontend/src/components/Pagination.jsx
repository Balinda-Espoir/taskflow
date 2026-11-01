import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ meta, onChange }) {
  if (!meta || meta.pages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
      <span className="text-slate-500">Page {meta.page} of {meta.pages} · {meta.total} total</span>
      <div className="flex gap-1">
        <button className="btn-ghost !p-2" disabled={meta.page <= 1} onClick={() => onChange(meta.page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
        <button className="btn-ghost !p-2" disabled={meta.page >= meta.pages} onClick={() => onChange(meta.page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
