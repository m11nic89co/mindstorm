import { useEffect } from 'react';
import { isTypingTarget, runHistoryShortcut } from './useCanvasHistory';

type UseCanvasShortcutsOptions = {
  undo: () => void;
  redo: () => void;
  onDeleteSelection: () => void;
};

export function useCanvasShortcuts({
  undo,
  redo,
  onDeleteSelection,
}: UseCanvasShortcutsOptions) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (runHistoryShortcut(event, undo, redo)) return;

      if (event.key !== 'Delete' && event.key !== 'Backspace') return;
      if (isTypingTarget(event.target)) return;

      event.preventDefault();
      onDeleteSelection();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onDeleteSelection, redo, undo]);
}
