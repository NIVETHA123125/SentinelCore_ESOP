import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AssetsPage from './components/AssetsPage';
import AlertHistory from './components/AlertHistory';
import IncidentsPage from './components/IncidentsPage';
import VulnerabilitiesPage from './components/VulnerabilitiesPage';
import AlertNotifier from './components/AlertNotifier';
import LandingPage from './components/LandingPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

function AppRoutes() {
  const { accessToken } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={<Login />}
      />
      <Route
        path="/dashboard"
        element={
          accessToken ? (
            <Dashboard />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/assets"
        element={
          accessToken ? (
            <AssetsPage />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/alerts"
        element={
          accessToken ? (
            <AlertHistory />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/incidents"
        element={
          accessToken ? (
            <IncidentsPage />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/vulnerabilities"
        element={
          accessToken ? (
            <VulnerabilitiesPage />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route path="*" element={<Navigate to={accessToken ? "/dashboard" : "/"} />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <AlertNotifier />
          <AppRoutes />
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;