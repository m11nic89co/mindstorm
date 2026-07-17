const DB_NAME = 'mindstorm.fs.v1';
const STORE = 'handles';
const KEY_LAST_FILE = 'lastFile';
const KEY_SAVES_DIR = 'savesDir';

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

async function putHandle(key: string, handle: FileSystemHandle): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(handle, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('IndexedDB write failed'));
    });
    db.close();
  } catch {
    /* ignore — без запоминания папки всё равно работает */
  }
}

async function getHandle<T extends FileSystemHandle>(key: string): Promise<T | null> {
  try {
    const db = await openDb();
    const handle = await new Promise<T | null>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve((req.result as T | undefined) ?? null);
      req.onerror = () => reject(req.error ?? new Error('IndexedDB read failed'));
    });
    db.close();
    return handle;
  } catch {
    return null;
  }
}

export async function rememberFileHandle(handle: FileSystemFileHandle): Promise<void> {
  await putHandle(KEY_LAST_FILE, handle);
}

export async function rememberSavesDirHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  await putHandle(KEY_SAVES_DIR, handle);
}

export async function readLastFileHandle(): Promise<FileSystemFileHandle | null> {
  return getHandle<FileSystemFileHandle>(KEY_LAST_FILE);
}

export async function readSavesDirHandle(): Promise<FileSystemDirectoryHandle | null> {
  return getHandle<FileSystemDirectoryHandle>(KEY_SAVES_DIR);
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

/** Папка сохранений: из IndexedDB или диалог выбора. */
export async function resolveSavesDirectory(): Promise<FileSystemDirectoryHandle> {
  const remembered = await readSavesDirHandle();
  if (remembered && (await ensureHandlePermission(remembered, 'readwrite'))) {
    return remembered;
  }

  const picker = window.showDirectoryPicker;
  if (!picker) {
    throw new Error('DIRECTORY_PICKER_UNAVAILABLE');
  }

  const dir = await picker.call(window, {
    id: 'mindstorm-saves',
    mode: 'readwrite',
    startIn: remembered ?? 'documents',
  });
  await rememberSavesDirHandle(dir);
  return dir;
}

/** startIn для диалогов: папка saves или последний файл. */
export async function getStartInHandle(): Promise<FileSystemHandle | undefined> {
  const dir = await readSavesDirHandle();
  if (dir && (await ensureHandlePermission(dir, 'read'))) return dir;

  const last = await readLastFileHandle();
  if (!last) return undefined;
  const ok = await ensureHandlePermission(last, 'read');
  return ok ? last : undefined;
}
