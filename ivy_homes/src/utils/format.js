// All money is INR integers per the API docs; format with Indian digit grouping.
export function formatPrice(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  const num = Number(value);
  if (num <= 0) return `₹${num.toLocaleString('en-IN')} (flagged)`;

  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  return `₹${num.toLocaleString('en-IN')}`;
}

export function formatRawPrice(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

export function formatArea(value, unit = 'sqft') {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return `${Number(value).toLocaleString('en-IN')} ${unit}`;
}

export function formatPricePerSqft(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}/sqft`;
}

export function formatDate(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatRelativeDate(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '—';
  const diffMs = Date.now() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  return formatDate(isoString);
}

export function titleCase(str) {
  if (!str) return '';
  return String(str)
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function bhkLabel(bedroom) {
  if (bedroom === null || bedroom === undefined || bedroom === '') return 'N/A';
  if (Number(bedroom) === 0) return 'Studio / N/A';
  return `${bedroom} BHK`;
}
