import { ReactNode } from 'react';

interface GuestRouteProps {
  children: ReactNode;
}

export default function GuestRoute({ children }: GuestRouteProps) {
  return <>{children}</>;
}
