import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VendorDashboard from './pages/VendorDashboard';
import ItemListingNew from './pages/ItemListingNew';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboardNew from './pages/UserDashboardNew';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Home authMode="login" />} />
              <Route path="/register" element={<Home authMode="register" />} />
              
              <Route path="/admin" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/vendor" element={
                <ProtectedRoute roles={['VENDOR']}>
                  <VendorDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/user" element={
                <ProtectedRoute roles={['USER']}>
                  <UserDashboardNew />
                </ProtectedRoute>
              } />


            </Routes>
          </main>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
