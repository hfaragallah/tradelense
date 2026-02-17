import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import AIToolsPage from './pages/AIToolsPage';
import InsightsPage from './pages/InsightsPage';
import BlogPage from './pages/BlogPage';

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/app" element={<Navigate to="/" replace />} />
            <Route path="/ai-tools" element={<AIToolsPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            {/* Catch all - redirect to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;