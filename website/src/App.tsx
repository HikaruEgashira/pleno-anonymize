import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthWrapper from './auth/AuthWrapper';
import HomePage from './pages/HomePage';
import DocsPage from './pages/DocsPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import CallbackPage from './pages/CallbackPage';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthWrapper>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/callback" element={<CallbackPage />} />
        </Routes>
      </AuthWrapper>
    </BrowserRouter>
  );
}
