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
      const key = event.key.toLowerCase();
      const blocked =
        key === 'f12' ||
        (event.ctrlKey && ['s', 'p', 'u'].includes(key)) ||
        (event.ctrlKey && event.shiftKey && ['i', 'j', 'c'].includes(key));

      if (blocked) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('dragstart', blockDrag);
    document.addEventListener('keydown', blockShortcuts, true);

    return () => {
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('dragstart', blockDrag);
      document.removeEventListener('keydown', blockShortcuts, true);
    };
  }, []);

  return null;
};

export default SecurityDeterrents;
