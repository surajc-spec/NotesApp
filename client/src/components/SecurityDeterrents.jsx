import { useEffect } from 'react';

const SecurityDeterrents = () => {
  useEffect(() => {
    const blockContextMenu = (event) => event.preventDefault();
    const blockDrag = (event) => {
      if (event.target?.tagName === 'IMG' || event.target?.closest?.('.protected-preview')) {
        event.preventDefault();
      }
    };

    const clearClipboard = () => {
      try {
        navigator.clipboard.writeText('');
      } catch (_) {}
    };

    const blockShortcuts = (event) => {
      const key = event.key ? event.key.toLowerCase() : '';
      const keyCode = event.keyCode;
      
      const isFKey = (keyCode >= 112 && keyCode <= 123) || /^f(1[0-2]|\d)$/i.test(event.key);
      const isCtrlShiftS = (event.ctrlKey || event.metaKey) && event.shiftKey && (key === 's' || keyCode === 83);
      const isWinSnipping = (event.metaKey || event.ctrlKey) && event.shiftKey && (key === 's' || keyCode === 83);
      const isPrintScreen = event.key === 'PrintScreen' || keyCode === 44;
      
      const isModifier = event.ctrlKey || event.metaKey;
      const isCopyPasteCut = isModifier && (['c', 'v', 'x'].includes(key) || [67, 86, 88].includes(keyCode));
      
      const isSave = isModifier && (key === 's' || keyCode === 83);
      const isPrint = isModifier && (key === 'p' || keyCode === 80);
      const isViewSource = isModifier && (key === 'u' || keyCode === 85);
      
      const isDevTools = keyCode === 123 || (isModifier && event.shiftKey && (key === 'i' || keyCode === 73));
      const isInspectElement = isModifier && event.shiftKey && (key === 'c' || keyCode === 67);
      const isConsole = isModifier && event.shiftKey && (key === 'j' || keyCode === 74);
      
      const blocked =
        isFKey ||
        isCtrlShiftS ||
        isWinSnipping ||
        isPrintScreen ||
        isCopyPasteCut ||
        isSave ||
        isPrint ||
        isViewSource ||
        isDevTools ||
        isInspectElement ||
        isConsole;

      if (blocked) {
        event.preventDefault();
        event.stopPropagation();
        clearClipboard();
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key ? event.key.toLowerCase() : '';
      const keyCode = event.keyCode;
      
      const isPrintScreen = event.key === 'PrintScreen' || keyCode === 44;
      const isWinSnipping = (event.metaKey || event.ctrlKey) && event.shiftKey && (key === 's' || keyCode === 83);
      const isCtrlShiftS = (event.ctrlKey || event.metaKey) && event.shiftKey && (key === 's' || keyCode === 83);
      
      const isModifier = event.ctrlKey || event.metaKey;
      const isCopyPasteCut = isModifier && (['c', 'v', 'x'].includes(key) || [67, 86, 88].includes(keyCode));
      
      if (isPrintScreen || isWinSnipping || isCtrlShiftS || isCopyPasteCut) {
        clearClipboard();
      }
    };

    const blockClipboard = (event) => {
      event.preventDefault();
      event.stopPropagation();
      clearClipboard();
    };

    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('dragstart', blockDrag);
    document.addEventListener('keydown', blockShortcuts, true);
    document.addEventListener('keyup', handleKeyUp, true);
    document.addEventListener('copy', blockClipboard, true);
    document.addEventListener('cut', blockClipboard, true);
    document.addEventListener('paste', blockClipboard, true);

    return () => {
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('dragstart', blockDrag);
      document.removeEventListener('keydown', blockShortcuts, true);
      document.removeEventListener('keyup', handleKeyUp, true);
      document.removeEventListener('copy', blockClipboard, true);
      document.removeEventListener('cut', blockClipboard, true);
      document.removeEventListener('paste', blockClipboard, true);
    };
  }, []);

  return null;
};

export default SecurityDeterrents;
