export default function LoadingSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-sm border border-(--color-rule) bg-(--color-paper-raised) p-4"
        >
          <div className="mb-3 h-4 w-2/3 rounded-sm bg-(--color-rule)" />
          <div className="mb-2 h-3 w-1/2 rounded-sm bg-(--color-rule)" />
          <div className="mb-4 h-3 w-1/3 rounded-sm bg-(--color-rule)" />
          <div className="flex gap-2">
            <div className="h-6 w-16 rounded-sm bg-(--color-rule)" />
            <div className="h-6 w-16 rounded-sm bg-(--color-rule)" />
          </div>
        </div>
      ))}
    </div>
  );
}
