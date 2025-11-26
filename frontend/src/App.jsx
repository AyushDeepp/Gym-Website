import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import PageTransition from './components/PageTransition';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Programs from './pages/Programs';
import Trainers from './pages/Trainers';
import Plans from './pages/Plans';
import Timetable from './pages/Timetable';
import Gallery from './pages/Gallery';
import Testimonials from './pages/Testimonials';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  // Prevent scroll restoration on page load
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // Ensure page starts at top
    window.scrollTo(0, 0);
  }, []);

  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
      <div className="min-h-screen bg-primary-darker">
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              <PageTransition>
                <Home />
              </PageTransition>
            }
          />
          <Route
            path="/about"
            element={
              <PageTransition>
                <About />
              </PageTransition>
            }
          />
          <Route
            path="/programs"
            element={
              <PageTransition>
                <Programs />
              </PageTransition>
            }
          />
          <Route
            path="/trainers"
            element={
              <PageTransition>
                <Trainers />
              </PageTransition>
            }
          />
          <Route
            path="/plans"
            element={
              <PageTransition>
                <Plans />
              </PageTransition>
            }
          />
          <Route
            path="/timetable"
            element={
              <PageTransition>
                <Timetable />
              </PageTransition>
            }
          />
          <Route
            path="/gallery"
            element={
              <PageTransition>
                <Gallery />
              </PageTransition>
            }
          />
          <Route
            path="/testimonials"
            element={
              <PageTransition>
                <Testimonials />
              </PageTransition>
            }
          />
          <Route
            path="/contact"
            element={
              <PageTransition>
                <Contact />
              </PageTransition>
            }
          />
          <Route
            path="/login"
            element={
              <PageTransition>
                <Login />
              </PageTransition>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Dashboard />
                </PageTransition>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;

