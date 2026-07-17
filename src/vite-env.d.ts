/// <reference types="vite/client" />

type FilePickerAcceptType = {
  description?: string;
  accept?: Record<string, string[]>;
};

type SaveFilePickerOptions = {
  suggestedName?: string;
  types?: FilePickerAcceptType[];
  startIn?: FileSystemHandle | WellKnownDirectory;
};

type OpenFilePickerOptions = {
  multiple?: boolean;
  types?: FilePickerAcceptType[];
  excludeAcceptAllOption?: boolean;
  startIn?: FileSystemHandle | WellKnownDirectory;
};

type WellKnownDirectory =
  | 'desktop'
  | 'documents'
  | 'downloads'
  | 'music'
  | 'pictures'
  | 'videos';

type DirectoryPickerOptions = {
  id?: string;
  mode?: 'read' | 'readwrite';
  startIn?: FileSystemHandle | WellKnownDirectory;
};

interface Window {
  showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
  showOpenFilePicker?: (options?: OpenFilePickerOptions) => Promise<FileSystemFileHandle[]>;
  showDirectoryPicker?: (options?: DirectoryPickerOptions) => Promise<FileSystemDirectoryHandle>;
}

interface FileSystemHandlePermissionDescriptor {
  mode?: 'read' | 'readwrite';
}

interface FileSystemHandle {
  queryPermission?: (
    descriptor?: FileSystemHandlePermissionDescriptor,
  ) => Promise<PermissionState>;
  requestPermission?: (
    descriptor?: FileSystemHandlePermissionDescriptor,
  ) => Promise<PermissionState>;
}
