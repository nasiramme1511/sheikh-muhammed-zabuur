import React from 'react';
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
import './index.css';

function Root() {
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
                <Toaster position="top-right" toastOptions={{
                  className: '!bg-dark-800 !text-white !border !border-white/10 !shadow-2xl',
                  duration: 3000,
                }} />
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
