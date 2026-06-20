// Provider component only — imports from OfflineContext.ts
import { useReducer, useEffect, useCallback, type ReactNode } from 'react';
import { getAllOfflineResources, getStorageEstimate } from '../lib/offline/db';
import type { OfflineResource, DownloadStatus } from '../types';
import { OfflineContext } from './OfflineContext';

interface OfflineState {
  resources: OfflineResource[];
  loading: boolean;
  storageUsed: number;
  storageTotal: number;
  downloadQueue: string[];
}

type Action =
  | { type: 'SET_RESOURCES'; payload: OfflineResource[] }
  | { type: 'ADD_RESOURCE'; payload: OfflineResource }
  | { type: 'REMOVE_RESOURCE'; payload: string }
  | { type: 'UPDATE_PROGRESS'; payload: { id: string; progress: number; status: DownloadStatus } }
  | { type: 'SET_STORAGE'; payload: { used: number; total: number } }
  | { type: 'SET_LOADING'; payload: boolean };

function offlineReducer(state: OfflineState, action: Action): OfflineState {
  switch (action.type) {
    case 'SET_RESOURCES':
      return { ...state, resources: action.payload, loading: false };
    case 'ADD_RESOURCE':
      return { ...state, resources: [...state.resources, action.payload] };
    case 'REMOVE_RESOURCE':
      return { ...state, resources: state.resources.filter((r) => r.id !== action.payload) };
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        resources: state.resources.map((r) =>
          r.id === action.payload.id
            ? { ...r, progress: action.payload.progress, status: action.payload.status }
            : r
        ),
      };
    case 'SET_STORAGE':
      return { ...state, storageUsed: action.payload.used, storageTotal: action.payload.total };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(offlineReducer, {
    resources: [],
    loading: true,
    storageUsed: 0,
    storageTotal: 0,
    downloadQueue: [],
  });

  const refresh = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const [resources, storage] = await Promise.all([
      getAllOfflineResources(),
      getStorageEstimate(),
    ]);
    dispatch({ type: 'SET_RESOURCES', payload: resources as OfflineResource[] });
    dispatch({ type: 'SET_STORAGE', payload: storage });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addResource = useCallback((resource: OfflineResource) => {
    dispatch({ type: 'ADD_RESOURCE', payload: resource });
  }, []);

  const removeResource = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_RESOURCE', payload: id });
  }, []);

  const updateProgress = useCallback((id: string, progress: number, status: DownloadStatus) => {
    dispatch({ type: 'UPDATE_PROGRESS', payload: { id, progress, status } });
  }, []);

  const isDownloaded = useCallback(
    (resourceId: number, type: string) => {
      return state.resources.some((r) => r.resourceId === resourceId && r.type === type && r.status === 'completed');
    },
    [state.resources]
  );

  const getOfflineResource = useCallback(
    (resourceId: number, type: string) => {
      return state.resources.find((r) => r.resourceId === resourceId && r.type === type);
    },
    [state.resources]
  );

  return (
    <OfflineContext.Provider
      value={{ state, refresh, addResource, removeResource, updateProgress, isDownloaded, getOfflineResource }}
    >
      {children}
    </OfflineContext.Provider>
  );
}
