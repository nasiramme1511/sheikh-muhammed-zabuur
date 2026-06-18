import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AIChatProvider } from './context/AIChatContext';
import { AppearanceProvider } from './context/AppearanceContext';
import { runResponsiveAudit } from './utils/responsiveAudit';
import './index.css';

function Root() {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 640 : false);

  useEffect(() => {
    runResponsiveAudit();
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppearanceProvider>
          <LanguageProvider>
            <AuthProvider>
              <PlayerProvider>
                <AIChatProvider>
                  <App />
                </AIChatProvider>
                <Toaster
                  position={isMobile ? 'bottom-center' : 'top-right'}
                  toastOptions={{
                    className: '!bg-surface-900 !text-white !border !border-white/10 !shadow-modal !max-w-[90vw]',
                    duration: 3000,
                    style: { borderRadius: '1rem', padding: '0.75rem 1rem' },
                  }}
                />
              </PlayerProvider>
            </AuthProvider>
          </LanguageProvider>
        </AppearanceProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);

