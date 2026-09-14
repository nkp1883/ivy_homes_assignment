
const BHK_OPTIONS = ['1', '2', '3', '4', '5'];
const FURNISHING_OPTIONS = ['unfurnished', 'semi-furnished', 'fully-furnished'];

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-(--color-ink-faint)">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  'rounded-sm border border-(--color-rule) bg-(--color-paper-raised) px-3 py-2 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-ink)';

export default function ListingFilters({ filters, onChange, onReset, sortBy, onSortChange, sortOptions }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="mb-6 rounded-sm border border-(--color-rule) bg-(--color-paper-raised) p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Field label="Locality">
          <input
            type="text"
            value={filters.locality || ''}
            onChange={(e) => update('locality', e.target.value)}
            placeholder="e.g. wakad"
            className={inputClass}
          />
        </Field>

        <Field label="BHK">
          <select
            value={filters.bhk || ''}
            onChange={(e) => update('bhk', e.target.value)}
            className={inputClass}
          >
            <option value="">Any</option>
            {BHK_OPTIONS.map((b) => (
              <option key={b} value={b}>{b} BHK</option>
            ))}
          </select>
        </Field>

        <Field label="Min price (₹)">
          <input
            type="number"
            inputMode="numeric"
            value={filters.minPrice || ''}
            onChange={(e) => update('minPrice', e.target.value)}
            placeholder="0"
            className={inputClass}
          />
        </Field>

        <Field label="Max price (₹)">
          <input
            type="number"
            inputMode="numeric"
            value={filters.maxPrice || ''}
            onChange={(e) => update('maxPrice', e.target.value)}
            placeholder="No limit"
            className={inputClass}
          />
        </Field>

        <Field label="Furnishing">
          <select
            value={filters.furnishing || ''}
            onChange={(e) => update('furnishing', e.target.value)}
            className={inputClass}
          >
            <option value="">Any</option>
            {FURNISHING_OPTIONS.map((f) => (
              <option key={f} value={f}>{f.replace('-', ' ')}</option>
            ))}
          </select>
        </Field>

        {sortOptions && (
          <Field label="Sort by">
            <select
              value={sortBy || ''}
              onChange={(e) => onSortChange(e.target.value)}
              className={inputClass}
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>
        )}
      </div>

      <div className="mt-3 flex justify-end">
        <button
          onClick={onReset}
          className="rounded-sm border border-(--color-rule) px-3 py-1.5 text-sm text-(--color-ink-soft) transition-colors hover:border-(--color-brick) hover:text-(--color-brick)"
        >
          Reset filters
        </button>
      </div>
    </div>
  );
}
