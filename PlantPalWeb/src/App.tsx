import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";
import PlantDatabase from "./pages/PlantDatabase";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const { admin, loading } = useAuth();

  console.log("🔒 PrivateRoute admin:", admin);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-lg font-semibold text-gray-600">Loading session...</p>
      </div>
    );
  }

  // Only redirect *after* loading completes
  if (!admin) return <Navigate to="/login" replace />;

  return children;
}


// ✅ App root
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Default redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Admin Routes */}
          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            {/* Nested routes inside AdminLayout */}
            <Route index element={<Dashboard />} />
            <Route path="plant-database" element={<PlantDatabase />} />
          </Route>

          {/* Fallback for any unknown route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
