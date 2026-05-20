import { useEffect } from 'react';

const SecurityDeterrents = () => {
  useEffect(() => {
    const blockContextMenu = (event) => event.preventDefault();
    const blockDrag = (event) => {
      if (event.target?.tagName === 'IMG' || event.target?.closest?.('.protected-preview')) {
        event.preventDefault();
      }
    };
    const blockShortcuts = (event) => {
      const key = event.key ? event.key.toLowerCase() : '';
      const keyCode = event.keyCode;
      
      const isFKey = (keyCode >= 112 && keyCode <= 123) || /^f(1[0-2]|\d)$/i.test(event.key);
      const isCtrlShiftS = event.ctrlKey && event.shiftKey && (key === 's' || keyCode === 83);
      const isWinSnipping = event.metaKey && event.shiftKey && (key === 's' || keyCode === 83);
      
      const isModifier = event.ctrlKey || event.metaKey;
      const isCopyPasteCut = isModifier && (['c', 'v', 'x'].includes(key) || [67, 86, 88].includes(keyCode));
      
      const blocked =
        isFKey ||
        isCtrlShiftS ||
        isWinSnipping ||
        isCopyPasteCut ||
        (event.ctrlKey && ['s', 'p', 'u'].includes(key)) ||
        (event.ctrlKey && event.shiftKey && ['i', 'j', 'c'].includes(key));

      if (blocked) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const blockClipboard = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('dragstart', blockDrag);
    document.addEventListener('keydown', blockShortcuts, true);
    document.addEventListener('copy', blockClipboard, true);
    document.addEventListener('cut', blockClipboard, true);
    document.addEventListener('paste', blockClipboard, true);

    return () => {
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('dragstart', blockDrag);
      document.removeEventListener('keydown', blockShortcuts, true);
      document.removeEventListener('copy', blockClipboard, true);
      document.removeEventListener('cut', blockClipboard, true);
      document.removeEventListener('paste', blockClipboard, true);
    };
  }, []);

  return null;
};

export default SecurityDeterrents;
