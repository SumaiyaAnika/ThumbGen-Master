import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Auth from './components/Auth';
import Home from './components/Home';
import VibeMatcher from './components/VibeMatcher';
import History from './components/History';
import HookHub from './components/HookHub';

import BackgroundRemover from './components/BackgroundRemover';
import OverlayEdit from './components/OverlayEdit';
import Studio from './components/Studio';
import AuralyticsManager from './components/Auralytics/AuralyticsManager';
import ZoneCheck from './components/ZoneCheck';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* If they go to localhost:5173/, show them the Login page first */}
        <Route path="/" element={<Auth />} />

        {/* All authenticated dashboard screens must logically sit under the Global SaaS Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<PrivateRoute><Home /></PrivateRoute>} />
          
          <Route path="/vision" element={<PrivateRoute><VibeMatcher /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
          <Route path="/hub" element={<PrivateRoute><HookHub /></PrivateRoute>} />
          
          <Route path="/studio" element={<PrivateRoute><Studio /></PrivateRoute>} />
          <Route path="/studio/bg-remover" element={<PrivateRoute><BackgroundRemover /></PrivateRoute>} />
          <Route path="/studio/overlay" element={<PrivateRoute><OverlayEdit /></PrivateRoute>} />
          <Route path="/studio/zone-check" element={<PrivateRoute><ZoneCheck /></PrivateRoute>} />
          
          <Route path="/auralytics" element={<PrivateRoute><AuralyticsManager /></PrivateRoute>} />
        </Route>

        {/* Catch-all: If they type a weird URL, send them back to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;