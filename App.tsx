import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import { AppContextProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const PrivateRoutes: React.FC = () => {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-slate-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return user ? <Layout onLogout={signOut} /> : <Navigate to="/login" replace />;
};

const LoginRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-slate-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return user ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <LoginPage onLogin={() => {}} />
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContextProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route element={<PrivateRoutes />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="transaksi" element={<TransactionsPage />} />
            <Route path="laporan" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </AppContextProvider>
    </AuthProvider>
  );
}