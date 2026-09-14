export default function MetricCard({ label, value, sublabel, accent = false }) {
  return (
    <div className="rounded-sm border border-(--color-rule) bg-(--color-paper-raised) p-4">
      <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-(--color-ink-faint)">
        {label}
      </div>
      <div
        className={`font-display text-2xl tabular ${accent ? 'text-(--color-brick)' : 'text-(--color-ink)'}`}
      >
        {value}
      </div>
      {sublabel && <div className="mt-1 text-xs text-(--color-ink-soft)">{sublabel}</div>}
    </div>
  );
}
