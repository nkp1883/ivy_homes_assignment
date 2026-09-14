import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import {
  fetchSavedListings,
  saveListing,
  removeSavedListing,
} from '../api/saved';

const SavedListingsContext = createContext(null);

function normalizeSavedListings(data) {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.results || data?.saved || data?.data || [];
}

export function SavedListingsProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [savedListings, setSavedListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSavedListings = useCallback(async () => {
    if (!isAuthenticated) {
      setSavedListings([]);
      return;
    }

    try {
      setIsLoading(true);

      const data = await fetchSavedListings();
      setSavedListings(normalizeSavedListings(data));
    } catch (error) {
      console.error('Failed to load saved listings:', error);
      setSavedListings([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadSavedListings();
  }, [loadSavedListings]);

  const isSaved = useCallback(
    (listingId) => {
      return savedListings.some(
        (listing) =>
          listing.listing_id === listingId ||
          listing.id === listingId
      );
    },
    [savedListings]
  );

  const addListing = useCallback(
    async (listing) => {
      const listingId = listing.listing_id;

      if (!listingId) return;

      try {
        await saveListing(listingId);
        await loadSavedListings();
      } catch (error) {
        console.error('Failed to save listing:', error);
      }
    },
    [loadSavedListings]
  );

  const removeListing = useCallback(
    async (listingId) => {
      if (!listingId) return;

      try {
        await removeSavedListing(listingId);
        await loadSavedListings();
      } catch (error) {
        console.error('Failed to remove saved listing:', error);
      }
    },
    [loadSavedListings]
  );

  const toggle = useCallback(
    async (listing) => {
      const listingId = listing.listing_id;

      if (!listingId) return;

      if (isSaved(listingId)) {
        await removeListing(listingId);
      } else {
        await addListing(listing);
      }
    },
    [isSaved, removeListing, addListing]
  );

  return (
    <SavedListingsContext.Provider
      value={{
        savedListings,
        isLoading,
        isSaved,
        addListing,
        removeListing,
        toggle,
        refresh: loadSavedListings,
      }}
    >
      {children}
    </SavedListingsContext.Provider>
  );
}

export function useSavedListings() {
  const context = useContext(SavedListingsContext);

  if (!context) {
    throw new Error(
      'useSavedListings must be used within SavedListingsProvider'
    );
  }

  return context;
}