import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginWallModal from './LoginWallModal';

interface GuestRouteProps {
  children: ReactNode;
  showModal?: boolean;
}

export default function GuestRoute({ children, showModal = true }: GuestRouteProps) {
  const { user, loading } = useAuth();
  const [showLoginWall, setShowLoginWall] = useState(false);

  useEffect(() => {
    if (!loading && !user && showModal) {
      setShowLoginWall(true);
    }
  }, [loading, user, showModal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {showLoginWall && (
          <LoginWallModal isOpen={showLoginWall} onClose={() => setShowLoginWall(false)} />
        )}
        <div className="min-h-screen bg-dark-900 flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Members Only</h2>
            <p className="text-sm text-white/60 mb-7 leading-relaxed">
              Please sign in or create an account to access Islamic learning resources.
            </p>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}
