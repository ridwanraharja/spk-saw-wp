import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

// Pages
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import NewSPK from "./pages/NewSPK";
import History from "./pages/History";
import ViewResult from "./pages/ViewResult";
import EditSPK from "./pages/EditSPK";
import Users from "./pages/Users";
import CreateUser from "./pages/CreateUser";
import EditUser from "./pages/EditUser";
import AllSPK from "./pages/AllSPK";
import Templates from "./pages/Templates";
import CreateTemplate from "./pages/CreateTemplate";
import ViewTemplate from "./pages/ViewTemplate";
import EditTemplate from "./pages/EditTemplate";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading component
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
      <p className="mt-4 text-gray-600">Memuat aplikasi...</p>
    </div>
  </div>
);

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// App Routes Component
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        }
      />

      {/* Protected Routes with Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="new-spk" element={<NewSPK />} />
        <Route path="history" element={<History />} />
        <Route path="result/:id" element={<ViewResult />} />
        <Route path="edit-spk/:id" element={<EditSPK />} />
        <Route path="users" element={<Users />} />
        <Route path="create-user" element={<CreateUser />} />
        <Route path="edit-user/:id" element={<EditUser />} />
        <Route path="all-spk" element={<AllSPK />} />
        <Route path="templates" element={<Templates />} />
        <Route path="create-template" element={<CreateTemplate />} />
        <Route path="view-template/:id" element={<ViewTemplate />} />
        <Route path="edit-template/:id" element={<EditTemplate />} />
      </Route>

      {/* Catch-all 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingScreen />}>
              <AppRoutes />
            </Suspense>
            <Toaster />
            <Sonner />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
