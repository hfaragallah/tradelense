import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import AIToolsPage from './pages/AIToolsPage';
import InsightsPage from './pages/InsightsPage';
import BlogPage from './pages/BlogPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile/:username" element={<Dashboard />} />
            <Route path="/social" element={<Dashboard />} />
            <Route path="/leaderboard" element={<Dashboard />} />
            <Route path="/settings" element={<Dashboard />} />
            <Route path="/notifications" element={<Dashboard />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/app" element={<Navigate to="/" replace />} />
            <Route path="/ai-tools" element={<AIToolsPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            {/* Catch all - redirect to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;