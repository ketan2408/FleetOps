import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import VendorDashboard from './pages/VendorDashboard';
import ItemListing from './pages/ItemListing';

// Placeholder Dashboards
const AdminDashboard = () => <div className="container"><h1>Admin Dashboard</h1></div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <main style={{ minHeight: 'calc(100vh - 64px)', padding: '2rem 0' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
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
                <UserDashboard />
              </ProtectedRoute>
            } />

            <Route path="/items" element={
              <ProtectedRoute roles={['USER', 'VENDOR', 'ADMIN']}>
                <ItemListing />
              </ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </AuthProvider>
    </Router>
  );
}

export default App;
