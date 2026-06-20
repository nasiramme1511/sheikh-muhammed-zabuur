import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthProvider';
import { PlayerProvider } from './context/PlayerProvider';
import { ThemeProvider } from './context/ThemeProvider';
import { LanguageProvider } from './context/LanguageProvider';
import { AIChatProvider } from './context/AIChatProvider';
import { AppearanceProvider } from './context/AppearanceProvider';
import { OfflineProvider } from './context/OfflineProvider';
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
              <OfflineProvider>
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
              </OfflineProvider>
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
