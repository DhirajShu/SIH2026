/**
 * Modular Video Storage System for TerraRecon.
 * Designed to seamlessly swap between IndexedDB local browser persistence
 * and cloud object storage (e.g., Supabase Storage / AWS S3).
 */

export interface StoredVideoMeta {
  name: string;
  sizeBytes: number;
  type: string;
  uploadedAt: string;
  blobUrl?: string;
}

export interface VideoStorageAdapter {
  saveVideo(
    projectId: string,
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<StoredVideoMeta>;
  getVideoBlob(projectId: string): Promise<Blob | null>;
  deleteVideo(projectId: string): Promise<void>;
}

// -------------------------------------------------------------
// IndexedDB Local Browser Storage Adapter (No 5MB quota limit)
// -------------------------------------------------------------
const DB_NAME = "TerraRecon_VideoStorage_v1";
const DB_VERSION = 1;
const STORE_NAME = "project_flight_videos";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not supported in this environment."));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "projectId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

class IndexedDBVideoAdapter implements VideoStorageAdapter {
  async saveVideo(
    projectId: string,
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<StoredVideoMeta> {
    const meta: StoredVideoMeta = {
      name: file.name,
      sizeBytes: file.size,
      type: file.type || "video/mp4",
      uploadedAt: new Date().toISOString(),
    };

    // Simulate staged chunk upload progress
    if (onProgress) {
      for (let p = 15; p <= 90; p += 15) {
        await new Promise((r) => setTimeout(r, 60));
        onProgress(p);
      }
    }

    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.put({ projectId, file, meta });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      if (onProgress) onProgress(100);
      return meta;
    } catch (err) {
      console.warn("Could not write file to IndexedDB, fallback to metadata only:", err);
      if (onProgress) onProgress(100);
      return meta;
    }
  }

  async getVideoBlob(projectId: string): Promise<Blob | null> {
    try {
      const db = await openDB();
      return await new Promise<Blob | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(projectId);
        req.onsuccess = () => {
          if (req.result && req.result.file) {
            resolve(req.result.file);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      return null;
    }
  }

  async deleteVideo(projectId: string): Promise<void> {
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.delete(projectId);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      // Ignored
    }
  }
}

// -------------------------------------------------------------
// Future Supabase Storage Adapter stub
// -------------------------------------------------------------
class SupabaseVideoAdapter implements VideoStorageAdapter {
  async saveVideo(projectId: string, file: File, onProgress?: (percent: number) => void): Promise<StoredVideoMeta> {
    throw new Error("Supabase Storage is not configured. Falling back to IndexedDB.");
  }
  async getVideoBlob(projectId: string): Promise<Blob | null> {
    return null;
  }
  async deleteVideo(projectId: string): Promise<void> {}
}

// Export default singleton adapter
export const videoStorage: VideoStorageAdapter = new IndexedDBVideoAdapter();
