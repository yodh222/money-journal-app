import { useEffect } from 'react';

type KeyHandler = (e: KeyboardEvent) => void;

interface ShortcutMap {
  [key: string]: KeyHandler;
}

export function useShortcut(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Exception: Escape should still work inside inputs to blur or close modals
        if (e.key === 'Escape' && shortcuts['Escape']) {
          shortcuts['Escape'](e);
        }
        return;
      }

      // Handle Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        if (shortcuts['CmdK']) {
          e.preventDefault();
          shortcuts['CmdK'](e);
        }
        return;
      }

      const key = e.key.toUpperCase(); // 'N', 'D', 'A', 'S'
      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key](e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
