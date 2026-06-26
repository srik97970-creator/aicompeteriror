import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';
import Layout from './components/Layout';
import { api } from './api';
import { ToastProvider } from './components/ui/Toast';
import { ThemeProvider } from './components/ThemeContext';
function ProtectedRoute({ children }) {
    const token = api.getToken();
    if (!token) {
        return <Navigate to="/login" replace/>;
    }
    return <Layout>{children}</Layout>;
}
// Route Guard for administrative privileges
function AdminRoute({ children }) {
    const token = api.getToken();
    const user = api.getUser();
    if (!token) {
        return <Navigate to="/login" replace/>;
    }
    if (user?.role !== 'admin') {
        return <Navigate to="/" replace/>;
    }
    return <Layout>{children}</Layout>;
}
export default function App() {
    return (<ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth Paths */}
            <Route path="/login" element={<Login />}/>
            <Route path="/register" element={<Register />}/>

            {/* Core Dashboard Protected Paths */}
            <Route path="/" element={<ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>}/>

            <Route path="/generate" element={<ProtectedRoute>
                <Generate />
              </ProtectedRoute>}/>

            <Route path="/history" element={<ProtectedRoute>
                <History />
              </ProtectedRoute>}/>

            <Route path="/settings" element={<ProtectedRoute>
                <Settings />
              </ProtectedRoute>}/>

            {/* Admin Panel Control */}
            <Route path="/admin" element={<AdminRoute>
                <AdminPanel />
              </AdminRoute>}/>

            {/* Admin Analytical View */}
            <Route path="/analytics" element={<AdminRoute>
                <Analytics />
              </AdminRoute>}/>

            {/* Fallback Redirection */}
            <Route path="*" element={<Navigate to="/" replace/>}/>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>);
}
