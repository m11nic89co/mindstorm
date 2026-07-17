const DB_NAME = 'mindstorm.fs.v1';
const STORE = 'handles';
const KEY_LAST_FILE = 'lastFile';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
  });
}

export async function rememberFileHandle(handle: FileSystemFileHandle): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(handle, KEY_LAST_FILE);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('IndexedDB write failed'));
    });
    db.close();
  } catch {
    /* ignore — без запоминания папки всё равно работает */
  }
}

export async function readLastFileHandle(): Promise<FileSystemFileHandle | null> {
  try {
    const db = await openDb();
    const handle = await new Promise<FileSystemFileHandle | null>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(KEY_LAST_FILE);
      req.onsuccess = () => resolve((req.result as FileSystemFileHandle | undefined) ?? null);
      req.onerror = () => reject(req.error ?? new Error('IndexedDB read failed'));
    });
    db.close();
    return handle;
  } catch {
    return null;
  }
}

export async function ensureHandlePermission(
  handle: FileSystemHandle,
  mode: 'read' | 'readwrite',
): Promise<boolean> {
  const opts = { mode } as FileSystemHandlePermissionDescriptor;
  try {
    if (typeof handle.queryPermission === 'function') {
      const state = await handle.queryPermission(opts);
      if (state === 'granted') return true;
    }
    if (typeof handle.requestPermission === 'function') {
      const state = await handle.requestPermission(opts);
      return state === 'granted';
    }
  } catch {
    return false;
  }
  return false;
}

/** startIn для диалогов: последний файл (открывает его папку) или undefined. */
export async function getStartInHandle(): Promise<FileSystemFileHandle | undefined> {
  const last = await readLastFileHandle();
  if (!last) return undefined;
  const ok = await ensureHandlePermission(last, 'read');
  return ok ? last : undefined;
}
