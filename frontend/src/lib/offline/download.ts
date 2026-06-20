import { openDB, saveOfflineResource, deleteOfflineResource } from './db';

let downloadListeners: Map<string, (progress: number, status: string) => void> = new Map();

export function onDownloadProgress(
  id: string,
  cb: (progress: number, status: string) => void
) {
  downloadListeners.set(id, cb);
  return () => downloadListeners.delete(id);
}

export async function downloadResource(resource: {
  id: number;
  title: string;
  description?: string;
  category?: string;
  url: string;
  fileSize: number;
  sizeHuman: string;
  type: 'AUDIO' | 'VIDEO' | 'PDF';
  duration?: number;
  thumbnail?: string;
}): Promise<string> {
  const downloadId = `${resource.type}-${resource.id}`;
  const cb = downloadListeners.get(downloadId);

  cb?.(0, 'downloading');

  try {
    const response = await fetch(resource.url, { mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const contentLength = response.headers.get('content-length');
    const total = parseInt(contentLength || String(resource.fileSize), 10) || resource.fileSize;
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const chunks: Uint8Array[] = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      const pct = Math.min(Math.round((received / total) * 100), 100);
      cb?.(pct, 'downloading');
    }

    const blob = new Blob(chunks as BlobPart[], { type: response.headers.get('content-type') || '' });

    await saveOfflineResource({
      id: downloadId,
      resourceId: resource.id,
      type: resource.type,
      title: resource.title,
      description: resource.description || '',
      category: resource.category || '',
      url: resource.url,
      blob,
      fileSize: total,
      sizeHuman: resource.sizeHuman,
      duration: resource.duration,
      thumbnail: resource.thumbnail || '',
      downloadedAt: Date.now(),
      status: 'completed',
      progress: 100,
    });

    cb?.(100, 'completed');
    return downloadId;
  } catch (err: any) {
    cb?.(0, 'error');
    await saveOfflineResource({
      id: downloadId,
      resourceId: resource.id,
      type: resource.type,
      title: resource.title,
      description: resource.description || '',
      category: resource.category || '',
      url: resource.url,
      fileSize: resource.fileSize,
      sizeHuman: resource.sizeHuman,
      duration: resource.duration,
      thumbnail: resource.thumbnail || '',
      downloadedAt: Date.now(),
      status: 'error',
      progress: 0,
      error: err.message,
    });
    throw err;
  }
}

export async function removeDownload(id: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('resources', 'readwrite');
  const store = tx.objectStore('resources');
  const existing = await new Promise<any>((resolve) => {
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
  });
  if (existing?.blob) {
    URL.revokeObjectURL(existing.blob);
  }
  store.delete(id);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineBlobUrl(id: string): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('resources', 'readonly');
    const store = tx.objectStore('resources');
    const req = store.get(id);
    req.onsuccess = () => {
      const resource = req.result;
      if (resource?.blob) {
        const url = URL.createObjectURL(resource.blob);
        resolve(url);
      } else {
        resolve(null);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function updatePlayPosition(id: string, position: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('resources', 'readwrite');
    const store = tx.objectStore('resources');
    const req = store.get(id);
    req.onsuccess = () => {
      const resource = req.result;
      if (resource) {
        resource.lastPlayedAt = Date.now();
        resource.playPosition = position;
        store.put(resource);
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
