// Context + Hook only — safe for React Fast Refresh
import { createContext, useContext } from 'react';
import type { OfflineResource, DownloadStatus } from '../types';

export interface OfflineContextType {
  state: {
    resources: OfflineResource[];
    loading: boolean;
    storageUsed: number;
    storageTotal: number;
    downloadQueue: string[];
  };
  refresh: () => Promise<void>;
  addResource: (resource: OfflineResource) => void;
  removeResource: (id: string) => void;
  updateProgress: (id: string, progress: number, status: DownloadStatus) => void;
  isDownloaded: (resourceId: number, type: string) => boolean;
  getOfflineResource: (resourceId: number, type: string) => OfflineResource | undefined;
}

export const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function useOffline(): OfflineContextType {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOffline must be used within OfflineProvider');
  return ctx;
}
