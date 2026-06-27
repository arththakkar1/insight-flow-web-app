import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import ProtectedLayout from './components/ProtectedLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Datasets from './pages/Datasets';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import MLBuilder from './pages/MLBuilder';
import MLModels from './pages/MLModels';
import { ThemeProvider } from './components/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="insightflow-theme">
      <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes inside Layout */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Navigate to="/datasets" replace />} />
          
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:chatId" element={<Chat />} />
          
          <Route path="/datasets" element={<Datasets />} />
          <Route path="/datasets/:datasetId" element={<Datasets />} />
          
          <Route path="/ml-builder/:datasetId" element={<MLBuilder />} />
          
          <Route path="/ml-models" element={<MLModels />} />
          <Route path="/ml-models/:modelId" element={<MLModels />} />
          
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:reportId" element={<Reports />} />
          
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  );
}

