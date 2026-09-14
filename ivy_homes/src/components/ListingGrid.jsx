import ListingCard from './ListingCard';

export default function ListingGrid({ listings }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard key={listing.listing_id} listing={listing} />
      ))}
    </div>
  );
}