import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Programs from './pages/Programs';
import Trainers from './pages/Trainers';
import Plans from './pages/Plans';
import Timetable from './pages/Timetable';
import Contacts from './pages/Contacts';
import Payments from './pages/Payments';
import Admins from './pages/Admins';
import Customers from './pages/Customers';
import Layout from './components/Layout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-darker flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login setIsAuthenticated={setIsAuthenticated} />
          }
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout setIsAuthenticated={setIsAuthenticated}>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Layout setIsAuthenticated={setIsAuthenticated}>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/programs"
          element={
            isAuthenticated ? (
              <Layout setIsAuthenticated={setIsAuthenticated}>
                <Programs />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/trainers"
          element={
            isAuthenticated ? (
              <Layout setIsAuthenticated={setIsAuthenticated}>
                <Trainers />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/plans"
          element={
            isAuthenticated ? (
              <Layout setIsAuthenticated={setIsAuthenticated}>
                <Plans />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/timetable"
          element={
            isAuthenticated ? (
              <Layout setIsAuthenticated={setIsAuthenticated}>
                <Timetable />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/contacts"
          element={
            isAuthenticated ? (
              <Layout setIsAuthenticated={setIsAuthenticated}>
                <Contacts />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/payments"
          element={
            isAuthenticated ? (
              <Layout setIsAuthenticated={setIsAuthenticated}>
                <Payments />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admins"
          element={
            isAuthenticated ? (
              <Layout setIsAuthenticated={setIsAuthenticated}>
                <Admins />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/customers"
          element={
            isAuthenticated ? (
              <Layout setIsAuthenticated={setIsAuthenticated}>
                <Customers />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

