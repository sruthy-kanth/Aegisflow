import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import SuperadminDashboard from './pages/superadmin/SuperadminDashboard';
import AdminPreview from './pages/admin/AdminPreview';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000,
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

function ProtectedRoute({ children, requiredRole = null }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400 text-sm">
        Initializing AegisFlow Disaster Command...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'SUPERADMIN' ? '/superadmin' : '/admin'} replace />;
  }

  return children;
}

function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'SUPERADMIN' ? '/superadmin' : '/admin'} replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/superadmin/*"
              element={
                <ProtectedRoute requiredRole="SUPERADMIN">
                  <SuperadminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminPreview />
                </ProtectedRoute>
              }
            />

            {/* Public Unguessable Tokenized Routes Placeholders (Phases 3/4) */}
            <Route
              path="/h/:token"
              element={
                <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center">
                  <div className="max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                    <h2 className="text-lg font-bold text-cyan-400">Citizen Early Warning Link</h2>
                    <p className="text-xs text-slate-400 mt-2">
                      Token validated. Dedicated mobile-first household view active in Phase 3.
                    </p>
                  </div>
                </div>
              }
            />

            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
