export default function CropListSignal({
  signal,
}: {
  signal?: { tone: 'ok' | 'attention'; label: string } | null;
}) {
  if (!signal) return null;
  const dot = signal.tone === 'ok' ? 'bg-emerald-500' : 'bg-amber-400';
  return (
    <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} aria-hidden />
      {signal.label}
    </p>
  );
}
