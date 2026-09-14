
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SavedListingsProvider } from './context/SavedListingsContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import Rentals from './pages/Rentals';
import RentalDetail from './pages/RentalDetail';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Saved from './pages/Saved';
import Insights from './pages/Insights';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SavedListingsProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route index element={<Navigate to="/insights" replace />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/listings" element={<Listings />} />
                <Route path="/listings/:listingId" element={<ListingDetail />} />
                <Route path="/rentals" element={<Rentals />} />
                <Route path="/rentals/:listingId" element={<RentalDetail />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:projectId" element={<ProjectDetail />} />
                <Route path="/saved" element={<Saved />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </SavedListingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}