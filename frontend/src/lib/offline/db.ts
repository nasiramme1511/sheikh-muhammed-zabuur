const DB_NAME = 'sheikh-zabuur-offline';
const DB_VERSION = 2;

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('resources')) {
        const store = db.createObjectStore('resources', { keyPath: 'id' });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('downloadedAt', 'downloadedAt', { unique: false });
        store.createIndex('resourceId_type', ['resourceId', 'type'], { unique: true });
      }
      if (!db.objectStoreNames.contains('progress')) {
        const progressStore = db.createObjectStore('progress', { keyPath: 'id' });
        progressStore.createIndex('lessonId', 'lessonId', { unique: false });
        progressStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllOfflineResources(): Promise<any[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('resources', 'readonly');
    const store = tx.objectStore('resources');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getOfflineResourcesByType(type: string): Promise<any[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('resources', 'readonly');
    const store = tx.objectStore('resources');
    const index = store.index('type');
    const request = index.getAll(type);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getOfflineResource(id: string): Promise<any | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('resources', 'readonly');
    const store = tx.objectStore('resources');
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflineResource(resource: any): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('resources', 'readwrite');
    const store = tx.objectStore('resources');
    store.put(resource);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteOfflineResource(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('resources', 'readwrite');
    const store = tx.objectStore('resources');
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getStorageEstimate(): Promise<{ used: number; total: number }> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      total: estimate.quota || 0,
    };
  }
  const resources = await getAllOfflineResources();
  const used = resources.reduce((sum: number, r: any) => sum + (r.fileSize || 0), 0);
  return { used, total: 0 };
}

export async function getStorageStats(): Promise<{
  audioCount: number;
  videoCount: number;
  pdfCount: number;
  totalSize: number;
  audioSize: number;
  videoSize: number;
  pdfSize: number;
}> {
  const resources = await getAllOfflineResources();
  const stats = { audioCount: 0, videoCount: 0, pdfCount: 0, totalSize: 0, audioSize: 0, videoSize: 0, pdfSize: 0 };
  for (const r of resources) {
    if (r.type === 'AUDIO') { stats.audioCount++; stats.audioSize += r.fileSize || 0; }
    else if (r.type === 'VIDEO') { stats.videoCount++; stats.videoSize += r.fileSize || 0; }
    else if (r.type === 'PDF') { stats.pdfCount++; stats.pdfSize += r.fileSize || 0; }
    stats.totalSize += r.fileSize || 0;
  }
  return stats;
}

export async function saveProgress(progress: {
  lessonId: number;
  position: number;
  completed: boolean;
  type: 'AUDIO' | 'VIDEO' | 'PDF';
}): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('progress', 'readwrite');
    const store = tx.objectStore('progress');
    store.put({
      id: `${progress.type}-${progress.lessonId}`,
      ...progress,
      updatedAt: Date.now(),
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getProgress(lessonId: number, type: string): Promise<any | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('progress', 'readonly');
    const store = tx.objectStore('progress');
    const request = store.get(`${type}-${lessonId}`);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllProgress(): Promise<any[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('progress', 'readonly');
    const store = tx.objectStore('progress');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllData(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['resources', 'progress'], 'readwrite');
    tx.objectStore('resources').clear();
    tx.objectStore('progress').clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
