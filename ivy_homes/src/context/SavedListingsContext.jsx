import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
  const userEmail = user?.email;
  const [saved, setSaved] = useState(() => getSavedListings(userEmail));

  // Reload the saved list whenever the logged-in user changes, so saved
  // listings stay scoped per-user (and don't leak across logout/login).
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
    [userEmail, saved] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const toggle = useCallback(
    (listing) => {
      if (isListingSaved(userEmail, listing.listing_id)) {
        unsave(listing.listing_id);
      } else {
        save(listing);
      }
    },
    [userEmail, save, unsave]
  );

  const value = useMemo(
    () => ({ saved, save, unsave, isSaved, toggle }),
    [saved, save, unsave, isSaved, toggle]
  );

  return <SavedListingsContext.Provider value={value}>{children}</SavedListingsContext.Provider>;
}

export function useSavedListings() {
  const ctx = useContext(SavedListingsContext);
  if (!ctx) throw new Error('useSavedListings must be used within a SavedListingsProvider');
  return ctx;
}
