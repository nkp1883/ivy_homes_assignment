export function LiveBadge({ isLive }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium ${
        isLive
          ? 'bg-(--color-live-bg) text-(--color-live)'
          : 'bg-(--color-danger-bg) text-(--color-danger)'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-(--color-live)' : 'bg-(--color-danger)'}`}
      />
      {isLive ? 'Live' : 'Inactive'}
    </span>
  );
}

export function VerifiedBadge({ isVerified }) {
  if (!isVerified) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-(--color-brass-light) px-2 py-0.5 text-xs font-medium text-(--color-brass)">
      Verified
    </span>
  );
}
