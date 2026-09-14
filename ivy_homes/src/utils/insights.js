// All analytics on the Insights page are computed here, from real fetched
// records — nothing is hardcoded. The validated figures from the API
// investigation (see README) are used only as sanity-check targets during
// development, never as the displayed values themselves.

function median(numbers) {
  if (!numbers.length) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

// A listing is "corrupt" using the documented, clear-cut rule:
// floor > total_floors OR price <= 0.
export function findCorruptListings(listings) {
  return listings.filter((l) => {
    const floorOverflow =
      l.floor !== null && l.floor !== undefined &&
      l.total_floors !== null && l.total_floors !== undefined &&
      Number(l.floor) > Number(l.total_floors);
    const badPrice = l.price !== null && l.price !== undefined && Number(l.price) <= 0;
    return floorOverflow || badPrice;
  });
}

// A physical-property fingerprint, used to find duplicate listings of the
// same underlying unit posted more than once.
export function fingerprintListing(l) {
  return [
    l.apartment_name, l.locality, l.property_type, l.bedroom, l.bathroom, l.balcony,
    l.floor, l.total_floors, l.carpet_area, l.super_built_up_area, l.latitude,
    l.longitude, l.facing_direction, l.covered_parking, l.project_id,
  ].map((v) => (v === undefined || v === null ? '' : String(v))).join('|');
}

export function findDuplicateFingerprints(listings) {
  const groups = new Map();
  for (const l of listings) {
    const fp = fingerprintListing(l);
    if (!groups.has(fp)) groups.set(fp, []);
    groups.get(fp).push(l);
  }
  const duplicateGroups = [...groups.values()].filter((g) => g.length > 1);
  return {
    uniqueCount: groups.size,
    duplicateGroupCount: duplicateGroups.length,
  };
}

// Suspicious/fake listings: positive price under 1% of the median price for
// comparable listings (same locality + bedroom count).
export function findSuspiciousListings(listings) {
  const groups = new Map();
  for (const l of listings) {
    if (!(Number(l.price) > 0)) continue;
    const key = `${(l.locality || '').toLowerCase()}|${l.bedroom}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(l);
  }

  const medianByGroup = new Map();
  for (const [key, group] of groups) {
    medianByGroup.set(key, median(group.map((l) => Number(l.price))));
  }

  const suspicious = [];
  for (const l of listings) {
    if (!(Number(l.price) > 0)) continue;
    const key = `${(l.locality || '').toLowerCase()}|${l.bedroom}`;
    const groupMedian = medianByGroup.get(key);
    if (groupMedian && Number(l.price) < groupMedian * 0.01) {
      suspicious.push(l);
    }
  }
  return suspicious;
}

export function computeLocalityStats(listings) {
  const byLocality = new Map();
  for (const l of listings) {
    const key = l.locality ? titleCaseLocal(l.locality) : 'Unknown';
    if (!byLocality.has(key)) byLocality.set(key, []);
    byLocality.get(key).push(l);
  }

  return [...byLocality.entries()]
    .map(([locality, items]) => {
      const validPrices = items.map((i) => Number(i.price)).filter((p) => p > 0);
      const avgPrice = validPrices.length
        ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length
        : null;
      const liveCount = items.filter((i) => i.is_live).length;
      return {
        locality,
        listingCount: items.length,
        liveCount,
        avgPrice,
      };
    })
    .sort((a, b) => b.listingCount - a.listingCount);
}

function titleCaseLocal(str) {
  return String(str)
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Average price/sqft for live 2 BHK listings, excluding corrupt/suspicious
// records and anything missing the fields needed for the ratio.
export function computeAvgPricePerSqftFor2BHK(listings) {
  const corruptIds = new Set(findCorruptListings(listings).map((l) => l.listing_id));
  const suspiciousIds = new Set(findSuspiciousListings(listings).map((l) => l.listing_id));

  const eligible = listings.filter((l) => {
    if (corruptIds.has(l.listing_id) || suspiciousIds.has(l.listing_id)) return false;
    if (!l.is_live) return false;
    if (Number(l.bedroom) !== 2) return false;
    const area = Number(l.carpet_area);
    const price = Number(l.price);
    return price > 0 && area > 0;
  });

  if (!eligible.length) return { avg: null, sampleSize: 0 };

  const ratios = eligible.map((l) => Number(l.price) / Number(l.carpet_area));
  const avg = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  return { avg, sampleSize: eligible.length };
}

export function findCostliestProject(projects) {
  const withPrice = projects.filter((p) => Number(p.price_max) > 0);
  if (!withPrice.length) return null;
  return withPrice.reduce((max, p) => (Number(p.price_max) > Number(max.price_max) ? p : max));
}

export function findCostliestListing(listings) {
  const withPrice = listings.filter((l) => Number(l.price) > 0);
  if (!withPrice.length) return null;
  return withPrice.reduce((max, l) => (Number(l.price) > Number(max.price) ? l : max));
}

export function countRecentListings(listings, days = 7, referenceDate = new Date()) {
  const cutoff = referenceDate.getTime() - days * 24 * 60 * 60 * 1000;
  return listings.filter((l) => {
    if (!l.posted_at) return false;
    const t = new Date(l.posted_at).getTime();
    return !Number.isNaN(t) && t >= cutoff && t <= referenceDate.getTime();
  }).length;
}

export function totalMonthlyRent(rentals, locality) {
  const filtered = locality
    ? rentals.filter((r) => (r.locality || '').toLowerCase() === locality.toLowerCase())
    : rentals;
  return filtered.reduce((sum, r) => sum + (Number(r.price) > 0 ? Number(r.price) : 0), 0);
}

// Projects whose documented total_listings doesn't match the number of
// listings we actually observe carrying that project_id.
export function findProjectListingMismatches(projects, listings) {
  const countByProject = new Map();
  for (const l of listings) {
    if (!l.project_id) continue;
    countByProject.set(l.project_id, (countByProject.get(l.project_id) || 0) + 1);
  }

  return projects
    .filter((p) => p.total_listings !== undefined && p.total_listings !== null)
    .map((p) => ({
      project: p,
      documented: Number(p.total_listings),
      extracted: countByProject.get(p.project_id) || 0,
    }))
    .filter((row) => row.documented !== row.extracted);
}

export function findPriceRangeAnomalies(projects) {
  return projects.filter(
    (p) => Number(p.price_min) > 0 && Number(p.price_max) > 0 && Number(p.price_min) > Number(p.price_max)
  );
}
