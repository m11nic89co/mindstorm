import { toPng } from 'html-to-image';

const VIEWPORT_SELECTOR = '.mind-canvas .react-flow__viewport';

export type CaptureBoardPngOptions = {
  /** CSS-цвет фона снимка */
  backgroundColor?: string;
  pixelRatio?: number;
};

/** Снимок холста в PNG (Blob). */
export async function captureBoardPng(options?: CaptureBoardPngOptions): Promise<Blob> {
  const node = document.querySelector(VIEWPORT_SELECTOR);
  if (!(node instanceof HTMLElement)) {
    throw new Error('Не найден холст для экспорта PNG');
  }

  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: options?.pixelRatio ?? 2,
    backgroundColor: options?.backgroundColor ?? '#ffffff',
    filter: (el) => {
      if (!(el instanceof HTMLElement)) return true;
      if (el.classList.contains('no-print')) return false;
      if (el.classList.contains('react-flow__minimap')) return false;
      if (el.classList.contains('react-flow__controls')) return false;
      if (el.classList.contains('react-flow__panel')) return false;
      return true;
    },
  });

  const res = await fetch(dataUrl);
  return res.blob();
}

export function triggerPngDownload(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
