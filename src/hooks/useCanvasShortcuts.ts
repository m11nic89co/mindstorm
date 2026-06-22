import { useEffect } from 'react';
import { isTypingTarget, runHistoryShortcut } from './useCanvasHistory';

type UseCanvasShortcutsOptions = {
  undo: () => void;
  redo: () => void;
  onDeleteSelection: () => void;
  onCopySelection?: () => void;
  onPasteClipboard?: () => void;
};

export function useCanvasShortcuts({
  undo,
  redo,
  onDeleteSelection,
  onCopySelection,
  onPasteClipboard,
}: UseCanvasShortcutsOptions) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (runHistoryShortcut(event, undo, redo)) return;

      if ((event.ctrlKey || event.metaKey) && !event.altKey) {
        // event.code — физическая клавиша, работает при RU/EN раскладке
        if (event.code === 'KeyC' && onCopySelection) {
          if (isTypingTarget(event.target)) return;
          event.preventDefault();
          onCopySelection();
          return;
        }
        if (event.code === 'KeyV' && onPasteClipboard) {
          if (isTypingTarget(event.target)) return;
          event.preventDefault();
          onPasteClipboard();
          return;
        }
      }

      if (event.key !== 'Delete' && event.key !== 'Backspace') return;
      if (isTypingTarget(event.target)) return;

      event.preventDefault();
      onDeleteSelection();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCopySelection, onDeleteSelection, onPasteClipboard, redo, undo]);
}
