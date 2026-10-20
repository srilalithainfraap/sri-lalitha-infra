import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { RequireAuth } from './features/auth/RequireAuth';
import { MainLayout } from './layouts/MainLayout';

import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ExplorePlotsPage } from './pages/ExplorePlotsPage';
import { PlotDetailPage } from './pages/PlotDetailPage';
import { AmenitiesPage } from './pages/AmenitiesPage';
import { GalleryPage } from './pages/GalleryPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public pages with main layout */}
          <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
          <Route path="/projects" element={<MainLayout><ProjectsPage /></MainLayout>} />
          <Route path="/explore-plots" element={<MainLayout><ExplorePlotsPage /></MainLayout>} />
          <Route path="/plots/:plotId" element={<MainLayout><PlotDetailPage /></MainLayout>} />
          <Route path="/amenities" element={<MainLayout><AmenitiesPage /></MainLayout>} />
          <Route path="/gallery" element={<MainLayout><GalleryPage /></MainLayout>} />
          <Route path="/about" element={<MainLayout><AboutPage /></MainLayout>} />
          <Route path="/contact" element={<MainLayout><ContactPage /></MainLayout>} />

          {/* Auth pages (no layout wrapper needed, they have their own full-page design) */}
          <Route path="/login" element={<MainLayout><LoginPage /></MainLayout>} />
          <Route path="/register" element={<MainLayout><RegisterPage /></MainLayout>} />

          {/* Protected pages */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <MainLayout><DashboardPage /></MainLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth adminOnly>
                <AdminPage />
              </RequireAuth>
            }
          />

          {/* 404 */}
          <Route path="*" element={<MainLayout><NotFoundPage /></MainLayout>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
