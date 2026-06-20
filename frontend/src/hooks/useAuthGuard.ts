import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export function useAuthGuard() {
  const { user } = useAuth();
  const [showWall, setShowWall] = useState(false);

  const guardAction = useCallback((action: () => void) => {
    if (user) {
      action();
    } else {
      setShowWall(true);
    }
  }, [user]);

  const closeWall = useCallback(() => {
    setShowWall(false);
  }, []);

  return { user, showWall, guardAction, closeWall };
}
