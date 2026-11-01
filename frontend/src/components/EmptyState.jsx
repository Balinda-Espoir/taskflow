export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      {Icon && <div className="rounded-full bg-brand-50 p-3 text-brand-600 dark:bg-brand-600/10"><Icon className="h-6 w-6" /></div>}
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
      {action}
    </div>
  );
}
