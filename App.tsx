import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { Toaster } from 'sonner';
import Navbar from './Navbar';
import Footer from './Footer';
import Home from './Home';
import Auth from './Auth';
import Dashboard from './Dashboard';
import Donate from './Donate';
import Confirm from './Confirm';
import About from './About';
import Profile from './Profile';
import School from './School';
import Events from './Events';
import Admin from './Admin';
import AdhkarHadith from './AdhkarHadith';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster position="top-center" richColors />
        <Router>
          <div className="flex flex-col min-h-screen bg-background text-text-main transition-colors duration-300">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/donate" element={<Donate />} />
                <Route path="/confirm" element={<Confirm />} />
                <Route path="/about" element={<About />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/school" element={<School />} />
                <Route path="/events" element={<Events />} />
                <Route path="/adhkar" element={<AdhkarHadith />} />
                <Route path="/adhkar-hadith" element={<AdhkarHadith />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
