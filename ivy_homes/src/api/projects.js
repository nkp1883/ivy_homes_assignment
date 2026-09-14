import { api } from './client';

const MAX_LIMIT = 50;
const DEFAULT_MAX_RECORDS = 2000;

function normalizeCollection(data) {
  const results = data?.results ?? data?.data ?? [];

  return {
    results,
    offset: data?.offset ?? 0,
    limit: data?.limit ?? results.length,
    count: data?.count ?? results.length,
    total: data?.total ?? null,
    hasMore: data?.has_more ?? data?.hasMore ?? false,
  };
}

export async function fetchProjectsPage({
  offset = 0,
  limit = MAX_LIMIT,
  filters = {},
} = {}) {
  const params = {
    offset,
    limit: Math.min(limit, MAX_LIMIT),
  };

  if (filters.locality) params.locality = filters.locality;
  if (filters.projectStatus) {
    params.project_status = filters.projectStatus;
  }

  const { data } = await api.get('/v1/projects', { params });

  return normalizeCollection(data);
}

export async function fetchAllProjects({
  maxRecords = DEFAULT_MAX_RECORDS,
  filters = {},
} = {}) {
  const projects = [];
  let offset = 0;

  while (projects.length < maxRecords) {
    const page = await fetchProjectsPage({
      offset,
      limit: MAX_LIMIT,
      filters,
    });

    projects.push(...page.results);

    if (!page.hasMore || page.results.length === 0) {
      break;
    }

    offset += page.results.length;
  }

  return projects.slice(0, maxRecords);
}

export async function fetchProjectById(projectId) {
  const { data } = await api.get(
    `/v1/projects/${encodeURIComponent(projectId)}`
  );

  return data;
}

export { MAX_LIMIT };