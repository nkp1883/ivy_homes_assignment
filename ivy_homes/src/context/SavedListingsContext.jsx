import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import {
  getSavedListings,
  addSavedListing,
  removeSavedListing,
  isListingSaved,
} from '../utils/storage';

const SavedListingsContext = createContext(null);

export function SavedListingsProvider({ children }) {
  const { user } = useAuth();
  const userEmail = user?.email ?? null;

  const [saved, setSaved] = useState(() => getSavedListings(userEmail));

  useEffect(() => {
    setSaved(getSavedListings(userEmail));
  }, [userEmail]);

  const save = useCallback(
    (listing) => {
      setSaved(addSavedListing(userEmail, listing));
    },
    [userEmail]
  );

  const unsave = useCallback(
    (listingId) => {
      setSaved(removeSavedListing(userEmail, listingId));
    },
    [userEmail]
  );

  const isSaved = useCallback(
    (listingId) => isListingSaved(userEmail, listingId),
    [userEmail, saved]
  );

  const toggle = useCallback(
    (listing) => {
      if (!listing?.listing_id) return;

      if (isSaved(listing.listing_id)) {
        unsave(listing.listing_id);
      } else {
        save(listing);
      }
    },
    [isSaved, save, unsave]
  );

  const value = useMemo(
    () => ({
      saved,
      save,
      unsave,
      isSaved,
      toggle,
    }),
    [saved, save, unsave, isSaved, toggle]
  );

  return (
    <SavedListingsContext.Provider value={value}>
      {children}
    </SavedListingsContext.Provider>
  );
}

export function useSavedListings() {
  const context = useContext(SavedListingsContext);

  if (!context) {
    throw new Error(
      'useSavedListings must be used within a SavedListingsProvider'
    );
  }

  return context;
}