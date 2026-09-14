import { Link } from 'react-router-dom';
import { formatPrice, formatArea, titleCase } from '../utils/format';

export default function ProjectCard({ project }) {
  const {
    project_id,
    apartment_name,
    developer_name,
    locality,
    project_status,
    price_min,
    price_max,
    min_area_sqft,
    max_area_sqft,
    total_listings,
  } = project;

  return (
    <Link
      to={`/projects/${encodeURIComponent(project_id)}`}
      className="group flex flex-col rounded-sm border border-(--color-rule) bg-(--color-paper-raised) p-4 transition-colors hover:border-(--color-ink)"
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <h3 className="font-display text-base leading-snug text-(--color-ink)">
          {apartment_name || 'Unnamed project'}
        </h3>

        {project_status && (
          <span className="shrink-0 rounded-sm bg-(--color-brass-light) px-2 py-0.5 text-xs font-medium text-(--color-brass)">
            {titleCase(project_status)}
          </span>
        )}
      </div>

      <div className="mb-3 text-sm text-(--color-ink-soft)">
        {titleCase(locality) || 'Locality unknown'}
        {developer_name ? ` · ${developer_name}` : ''}
      </div>

      <div className="mb-3 font-mono text-sm">
        <span className="font-semibold tabular text-(--color-brick)">
          {formatPrice(price_min)} – {formatPrice(price_max)}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between text-xs text-(--color-ink-faint)">
        <span>
          {formatArea(min_area_sqft)} – {formatArea(max_area_sqft)}
        </span>

        {total_listings !== undefined && total_listings !== null && (
          <span className="font-mono">{total_listings} listings</span>
        )}
      </div>
    </Link>
  );
}