export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-slate-200 bg-white/70 px-3 py-4 text-center text-sm text-slate-400">
      {text}
    </div>
  );
}
