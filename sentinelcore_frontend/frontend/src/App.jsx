import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AlertHistory from './components/AlertHistory';
import AlertNotifier from './components/AlertNotifier';
import LandingPage from './components/LandingPage';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppRoutes() {
  const { accessToken } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={accessToken ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={
          accessToken ? (
            <>
              <AlertNotifier />
              <Dashboard />
            </>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/alerts"
        element={
          accessToken ? (
            <>
              <AlertNotifier />
              <AlertHistory />
            </>
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
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;