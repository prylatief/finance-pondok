import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import { AppContextProvider } from './context/AppContext';
import { checkSupabaseConnection } from './lib/supabase';

// FIX: Replaced unused PrivateRoute with a layout route component for authenticated users.
const PrivateRoutes: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  // In a real app, you'd have a more robust auth check.
  // For this demo, we'll simulate it with localStorage.
  const isAuthenticated = localStorage.getItem("token") === "fake-jwt-token";
  return isAuthenticated ? <Layout onLogout={onLogout} /> : <Navigate to="/login" replace />;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem("token") === "fake-jwt-token");
  const location = useLocation();

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem("token") === "fake-jwt-token");
  }, [location]);

  // Test Supabase connection on app load
  useEffect(() => {
    const testConnection = async () => {
      console.log('🔍 Testing Supabase connection...');
      const isConnected = await checkSupabaseConnection();
      if (isConnected) {
        console.log('✅ Supabase connected successfully! 🎉');
      } else {
        console.error('❌ Failed to connect to Supabase');
      }
    };
    testConnection();
  }, []);


  return (
    <AppContextProvider>
      {/* FIX: Restructured routes to use a more standard layout route pattern. */}
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={() => setIsAuthenticated(true)} />} />
        <Route element={<PrivateRoutes onLogout={() => setIsAuthenticated(false)} />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="transaksi" element={<TransactionsPage />} />
            <Route path="laporan" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </AppContextProvider>
  );
}