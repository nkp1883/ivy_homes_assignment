import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchProjectById } from '../api/projects';
import ErrorState from '../components/ErrorState';
import { formatPrice, formatArea, formatDate, titleCase } from '../utils/format';

function Field({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="border-b border-(--color-rule) py-2.5 last:border-b-0">
      <div className="text-xs uppercase tracking-wide text-(--color-ink-faint)">{label}</div>
      <div className="mt-0.5 font-mono text-sm text-(--color-ink) tabular">{value}</div>
    </div>
  );
}

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(() => {
    setStatus('loading');
    fetchProjectById(projectId)
      .then((data) => { setProject(data); setStatus('ready'); })
      .catch((err) => {
        if (err?.response?.status === 404) setStatus('not-found');
        else {
          setErrorMessage(err?.response?.data?.detail || err.message || 'Request failed');
          setStatus('error');
        }
      });
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  if (status === 'loading') {
    return <div className="animate-pulse text-(--color-ink-faint)">Loading project…</div>;
  }

  if (status === 'not-found') {
    return (
      <div className="rounded-sm border border-(--color-rule) bg-(--color-paper-raised) p-8 text-center">
        <div className="mb-2 font-display text-xl">Project not found</div>
        <p className="mb-5 text-sm text-(--color-ink-soft)">"{projectId}" doesn't match any project in the register.</p>
        <Link to="/projects" className="rounded-sm bg-(--color-ink) px-4 py-2 text-sm font-medium text-(--color-paper)">
          Back to projects
        </Link>
      </div>
    );
  }

  if (status === 'error') return <ErrorState message={errorMessage} onRetry={load} />;

  const {
    project_id, apartment_name, developer_name, locality, project_status,
    total_units, total_towers, total_floors, launch_date, possession_date,
    rera_number, min_area_sqft, max_area_sqft, total_listings,
    price_min, price_max, amenities, project_url,
  } = project;

  const priceRangeValid = !(Number(price_min) > 0 && Number(price_max) > 0 && Number(price_min) > Number(price_max));

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate(-1)} className="mb-4 text-sm text-(--color-ink-soft) hover:text-(--color-ink)">
        ← Back
      </button>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-(--color-ink)">{apartment_name || 'Unnamed project'}</h1>
          <p className="mt-1 text-sm text-(--color-ink-soft)">
            {titleCase(locality)} {developer_name ? `· ${developer_name}` : ''}
          </p>
        </div>
        {project_status && (
          <span className="rounded-sm bg-(--color-brass-light) px-2.5 py-1 text-xs font-medium text-(--color-brass)">
            {titleCase(project_status)}
          </span>
        )}
      </div>

      <div className="mb-6 rounded-sm border border-(--color-rule) bg-(--color-paper-raised) p-4">
        {priceRangeValid ? (
          <div className="font-mono text-2xl font-semibold text-(--color-brick) tabular">
            {formatPrice(price_min)} – {formatPrice(price_max)}
          </div>
        ) : (
          <div>
            <div className="font-mono text-2xl font-semibold text-(--color-danger) tabular">
              {formatPrice(price_min)} – {formatPrice(price_max)}
            </div>
            <div className="mt-1 text-xs text-(--color-danger)">
              Flagged: the source data has price_min greater than price_max for this project. Shown as-is, not corrected.
            </div>
          </div>
        )}
        <div className="text-xs text-(--color-ink-faint)">Project ID: {project_id}</div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-x-6 rounded-sm border border-(--color-rule) bg-(--color-paper-raised) px-4 sm:grid-cols-2">
        <div>
          <Field label="Total units" value={total_units} />
          <Field label="Towers" value={total_towers} />
          <Field label="Floors" value={total_floors} />
          <Field label="Area range" value={`${formatArea(min_area_sqft)} – ${formatArea(max_area_sqft)}`} />
        </div>
        <div>
          <Field label="Launch date" value={formatDate(launch_date)} />
          <Field label="Possession date" value={formatDate(possession_date)} />
          <Field label="RERA number" value={rera_number} />
          <Field label="Listings (documented)" value={total_listings} />
        </div>
      </div>

      {Array.isArray(amenities) && amenities.length > 0 && (
        <div className="mb-6 rounded-sm border border-(--color-rule) bg-(--color-paper-raised) p-4">
          <div className="mb-2 text-xs uppercase tracking-wide text-(--color-ink-faint)">Amenities</div>
          <div className="flex flex-wrap gap-1.5">
            {amenities.map((a) => (
              <span key={a} className="rounded-sm bg-(--color-paper) px-2 py-1 text-xs text-(--color-ink-soft)">
                {titleCase(a)}
              </span>
            ))}
          </div>
        </div>
      )}

      {project_url && (
        <a href={project_url} target="_blank" rel="noreferrer" className="text-sm text-(--color-brick) underline underline-offset-2">
          View project page ↗
        </a>
      )}
    </div>
  );
}
