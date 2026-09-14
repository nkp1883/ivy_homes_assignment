import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchAllListings } from '../api/listings';
import { fetchAllRentals } from '../api/rentals';
import { fetchHealth } from '../api/health';
import ErrorState from '../components/ErrorState';
import {
  formatRawPrice,
  formatPricePerSqft,
  titleCase,
} from '../utils/format';

function median(numbers) {
  if (!numbers.length) return null;

  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-IN');
}

function calculateAnalytics(listings) {
  const validPrices = listings
    .map((l) => Number(l.price))
    .filter((p) => p > 0);

  const pricePerSqft = listings
    .map((l) => {
      const price = Number(l.price);
      const area = Number(l.carpet_area);

      if (price <= 0 || area <= 0) return null;

      return price / area;
    })
    .filter((v) => v !== null && Number.isFinite(v));

  const byLocalityMap = new Map();

  for (const listing of listings) {
    const locality = (listing.locality || 'Unknown').trim().toLowerCase();

    if (!byLocalityMap.has(locality)) {
      byLocalityMap.set(locality, []);
    }

    byLocalityMap.get(locality).push(listing);
  }

  const byLocality = [...byLocalityMap.entries()]
    .map(([locality, items]) => {
      const prices = items
        .map((l) => Number(l.price))
        .filter((p) => p > 0);

      return {
        locality,
        count: items.length,
        medianPrice: median(prices),
      };
    })
    .sort((a, b) => b.count - a.count);

  const byBhkMap = new Map();

  for (const listing of listings) {
    const bedroom = Number(listing.bedroom);

    if (!Number.isFinite(bedroom) || bedroom <= 0) continue;

    byBhkMap.set(
      bedroom,
      (byBhkMap.get(bedroom) || 0) + 1
    );
  }

  const byBhk = [...byBhkMap.entries()]
    .map(([bedroom, count]) => ({
      bedroom,
      count,
    }))
    .sort((a, b) => a.bedroom - b.bedroom);

  const liveListings = listings.filter((l) => Boolean(l.is_live));

  return {
    totalListings: listings.length,
    medianPrice: median(validPrices),
    medianPricePerSqft: median(pricePerSqft),
    liveListings: liveListings.length,
    byLocality,
    byBhk,
  };
}

function calculateRecentListings(listings, referenceDate) {
  if (!referenceDate) return 0;

  const end = referenceDate.getTime();
  const start = end - 7 * 24 * 60 * 60 * 1000;

  return listings.filter((listing) => {
    if (!listing.posted_at) return false;

    const date = new Date(listing.posted_at).getTime();

    return (
      Number.isFinite(date) &&
      date >= start &&
      date <= end
    );
  }).length;
}

function calculateRentalAnalytics(rentals) {
  const validRents = rentals
    .map((r) => Number(r.price))
    .filter((p) => p > 0);

  const localityMap = new Map();

  for (const rental of rentals) {
    const locality = (rental.locality || 'Unknown')
      .trim()
      .toLowerCase();

    localityMap.set(
      locality,
      (localityMap.get(locality) || 0) + 1
    );
  }

  const topRentalLocality = [...localityMap.entries()]
    .sort((a, b) => b[1] - a[1])[0];

  return {
    totalRentals: rentals.length,
    medianRent: median(validRents),
    topRentalLocality: topRentalLocality
      ? {
          locality: topRentalLocality[0],
          count: topRentalLocality[1],
        }
      : null,
  };
}

function MetricCard({ label, value, sublabel }) {
  return (
    <div className="rounded-sm border border-(--color-rule) bg-(--color-paper-raised) p-4">
      <div className="text-xs uppercase tracking-wide text-(--color-ink-faint)">
        {label}
      </div>

      <div className="mt-2 font-mono text-2xl font-semibold text-(--color-ink) tabular">
        {value}
      </div>

      {sublabel && (
        <div className="mt-1 text-xs text-(--color-ink-soft)">
          {sublabel}
        </div>
      )}
    </div>
  );
}

export default function Insights() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(() => {
    setStatus('loading');
    setErrorMessage('');

    Promise.all([
      fetchAllListings({}),
      fetchAllRentals({}),
      fetchHealth().catch(() => null),
    ])
      .then(([listings, rentals, health]) => {
        setData({
          listings,
          rentals,
          health,
        });

        setStatus('ready');
      })
      .catch((err) => {
        setErrorMessage(
          err?.response?.data?.detail ||
            err?.message ||
            'Unable to load market insights.'
        );

        setStatus('error');
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const analytics = useMemo(() => {
    if (!data) return null;

    return calculateAnalytics(data.listings);
  }, [data]);

  const rentalAnalytics = useMemo(() => {
    if (!data) return null;

    return calculateRentalAnalytics(data.rentals);
  }, [data]);

  const recentListings = useMemo(() => {
    if (!data) return 0;

    const referenceDate = data.health?.reference_date
      ? new Date(data.health.reference_date)
      : new Date();

    return calculateRecentListings(
      data.listings,
      referenceDate
    );
  }, [data]);

  const topLocalities = useMemo(() => {
    if (!analytics) return [];

    return analytics.byLocality.slice(0, 10);
  }, [analytics]);

  const mostExpensiveLocality = useMemo(() => {
    if (!analytics?.byLocality.length) return null;

    return analytics.byLocality
      .filter((item) => item.medianPrice !== null)
      .sort((a, b) => b.medianPrice - a.medianPrice)[0];
  }, [analytics]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col gap-4">
        <div className="animate-pulse text-(--color-ink-faint)">
          Preparing market insights…
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-sm border border-(--color-rule) bg-(--color-paper-raised)"
            />
          ))}
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <ErrorState
        message={errorMessage}
        onRetry={load}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl text-(--color-ink)">
          Insights
        </h1>

        <p className="mt-1 text-sm text-(--color-ink-soft)">
          A snapshot of the property market based on the available listings.
        </p>
      </div>

      {/* Market Overview */}
      <section className="mb-10">
        <div className="mb-4 text-xs uppercase tracking-wide text-(--color-ink-faint)">
          Market overview
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <MetricCard
            label="Total listings"
            value={formatNumber(analytics.totalListings)}
          />

          <MetricCard
            label="Median price"
            value={
              analytics.medianPrice !== null
                ? formatRawPrice(analytics.medianPrice)
                : '—'
            }
            sublabel="Sale listings"
          />

          <MetricCard
            label="Median ₹ / sqft"
            value={
              analytics.medianPricePerSqft !== null
                ? formatPricePerSqft(
                    analytics.medianPricePerSqft
                  )
                : '—'
            }
            sublabel="Based on carpet area"
          />

          <MetricCard
            label="Live listings"
            value={formatNumber(analytics.liveListings)}
            sublabel={`${(
              (analytics.liveListings /
                analytics.totalListings) *
                100 || 0
            ).toFixed(1)}% of inventory`}
          />
        </div>
      </section>

      {/* Locality Analysis */}
      <section className="mb-10">
        <div className="mb-4">
          <div className="text-xs uppercase tracking-wide text-(--color-ink-faint)">
            Locality analysis
          </div>

          <h2 className="mt-1 font-display text-xl text-(--color-ink)">
            Listings by locality
          </h2>
        </div>

        <div className="overflow-hidden rounded-sm border border-(--color-rule) bg-(--color-paper-raised)">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-(--color-rule) text-xs uppercase tracking-wide text-(--color-ink-faint)">
                  <th className="px-4 py-3 font-medium">
                    Locality
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    Listings
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    Median price
                  </th>
                </tr>
              </thead>

              <tbody>
                {topLocalities.map((item) => (
                  <tr
                    key={item.locality}
                    className="border-b border-(--color-rule) last:border-b-0"
                  >
                    <td className="px-4 py-3 font-medium text-(--color-ink)">
                      {titleCase(item.locality)}
                    </td>

                    <td className="px-4 py-3 text-right font-mono tabular text-(--color-ink-soft)">
                      {formatNumber(item.count)}
                    </td>

                    <td className="px-4 py-3 text-right font-mono tabular text-(--color-ink)">
                      {item.medianPrice !== null
                        ? formatRawPrice(item.medianPrice)
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Locality chart */}
        <div className="rounded-sm border border-(--color-rule) bg-(--color-paper-raised) p-4">
          <div className="mb-4">
            <div className="text-xs uppercase tracking-wide text-(--color-ink-faint)">
              Inventory
            </div>

            <h2 className="mt-1 font-display text-lg text-(--color-ink)">
              Listings by locality
            </h2>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topLocalities}
                margin={{
                  top: 4,
                  right: 8,
                  left: 0,
                  bottom: 45,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="locality"
                  tick={{
                    fontSize: 10,
                  }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fontSize: 11,
                  }}
                />

                <Tooltip />

                <Bar
                  dataKey="count"
                  name="Listings"
                  fill="#A9502F"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BHK chart */}
        <div className="rounded-sm border border-(--color-rule) bg-(--color-paper-raised) p-4">
          <div className="mb-4">
            <div className="text-xs uppercase tracking-wide text-(--color-ink-faint)">
              Property mix
            </div>

            <h2 className="mt-1 font-display text-lg text-(--color-ink)">
              Listings by BHK
            </h2>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.byBhk}
                margin={{
                  top: 4,
                  right: 8,
                  left: 0,
                  bottom: 4,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="bedroom"
                  tickFormatter={(value) => `${value} BHK`}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fontSize: 11,
                  }}
                />

                <Tooltip
                  formatter={(value) => [
                    formatNumber(value),
                    'Listings',
                  ]}
                  labelFormatter={(value) => `${value} BHK`}
                />

                <Bar
                  dataKey="count"
                  name="Listings"
                  fill="#B0872B"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Market Highlights */}
      <section className="mb-10">
        <div className="mb-4 text-xs uppercase tracking-wide text-(--color-ink-faint)">
          Market highlights
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Most listed locality"
            value={
              analytics.byLocality[0]
                ? titleCase(analytics.byLocality[0].locality)
                : '—'
            }
            sublabel={
              analytics.byLocality[0]
                ? `${formatNumber(
                    analytics.byLocality[0].count
                  )} listings`
                : ''
            }
          />

          <MetricCard
            label="Highest median price"
            value={
              mostExpensiveLocality?.medianPrice !== null &&
              mostExpensiveLocality?.medianPrice !== undefined
                ? formatRawPrice(
                    mostExpensiveLocality.medianPrice
                  )
                : '—'
            }
            sublabel={
              mostExpensiveLocality
                ? titleCase(mostExpensiveLocality.locality)
                : ''
            }
          />

          <MetricCard
            label="Recent listings"
            value={formatNumber(recentListings)}
            sublabel="Added in the last 7 days"
          />

          <MetricCard
            label="Median monthly rent"
            value={
              rentalAnalytics.medianRent !== null
                ? formatRawPrice(rentalAnalytics.medianRent)
                : '—'
            }
            sublabel={`${formatNumber(
              rentalAnalytics.totalRentals
            )} rental listings`}
          />
        </div>
      </section>

      {/* Rental Snapshot */}
      {rentalAnalytics.topRentalLocality && (
        <section className="rounded-sm border border-(--color-rule) bg-(--color-paper-raised) p-5">
          <div className="text-xs uppercase tracking-wide text-(--color-ink-faint)">
            Rental market
          </div>

          <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-xl text-(--color-ink)">
                {titleCase(
                  rentalAnalytics.topRentalLocality.locality
                )}
              </h2>

              <p className="mt-1 text-sm text-(--color-ink-soft)">
                Locality with the largest rental inventory
              </p>
            </div>

            <div className="font-mono text-lg font-semibold text-(--color-brick) tabular">
              {formatNumber(
                rentalAnalytics.topRentalLocality.count
              )}{' '}
              rentals
            </div>
          </div>
        </section>
      )}
    </div>
  );
}