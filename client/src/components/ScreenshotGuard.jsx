import { useEffect, useRef, useState } from 'react';
import { EyeOff, ShieldAlert } from 'lucide-react';

const ScreenshotGuard = ({ children, isEnabled = true, onBlock }) => {
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isBlurred, setIsBlurred] = useState(false);
  const dummyRef = useRef(null);

  useEffect(() => {
    if (!isEnabled) return;

    const styleId = 'preview-guard-style';

    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
.protected-preview,
.protected-preview * {
  user-select: none !important;
  -webkit-user-select: none !important;
  -webkit-touch-callout: none !important;
  -webkit-user-drag: none !important;
}

@media print {
  .protected-preview {
    display: none !important;
  }
}
`;

      document.head.appendChild(style);
    }
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled) return;

    let timer;

    const warn = (msg) => {
      setAlertMessage(msg);
      setIsAlertActive(true);
      onBlock?.();

      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsAlertActive(false);
      }, 2500);
    };

    const clearClipboard = () => {
      try {
        navigator.clipboard.writeText('');
      } catch {
        // Clipboard access can be denied by the browser.
      }
    };

    const block = (event, msg) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      clearClipboard();
      warn(msg);
      return false;
    };

    const isBlockedShortcut = (event) => {
      const key = (event.key || '').toLowerCase();
      const code = (event.code || '').toLowerCase();
      const keyCode = event.keyCode || event.which;
      const mod = event.ctrlKey || event.metaKey;
      const isPrintScreen = key === 'printscreen' || code === 'printscreen' || keyCode === 44;
      const isWinShiftS =
        event.shiftKey && (event.metaKey || event.ctrlKey) && (key === 's' || code === 'keys');
      const isSavePrintSource = mod && ['s', 'p', 'u'].includes(key);
      const isCopyCutPasteSelect = mod && ['a', 'c', 'v', 'x'].includes(key);
      const isDevTools =
        key === 'f12' ||
        keyCode === 123 ||
        (mod && event.shiftKey && ['i', 'c', 'j'].includes(key));
      const isFullscreenKey = key === 'f11' || keyCode === 122;
      const isCtrlShiftS = mod && event.shiftKey && (key === 's' || keyCode === 83);

      return (
        isPrintScreen ||
        isWinShiftS ||
        isSavePrintSource ||
        isCopyCutPasteSelect ||
        isDevTools ||
        isFullscreenKey ||
        isCtrlShiftS
      );
    };

    const keyDown = (event) => {
      if (isBlockedShortcut(event)) {
        return block(event, 'Protected preview');
      }

      return true;
    };

    const keyUp = (event) => {
      if (isBlockedShortcut(event)) {
        return block(event, 'Protected preview');
      }

      return true;
    };

    const context = (event) => block(event, 'Right click disabled');
    const clip = (event) => block(event, 'Copy disabled');
    const print = (event) => block(event, 'Printing disabled');
    const drag = (event) => {
      event.preventDefault();
      event.stopPropagation();
      return false;
    };
    const select = (event) => {
      event.preventDefault();
      return false;
    };

    const visibility = () => {
      setIsBlurred(document.hidden);
    };

    const focus = () => {
      setIsBlurred(false);
    };

    const blur = () => {
      setIsBlurred(true);
    };

    window.addEventListener('keydown', keyDown, true);
    window.addEventListener('keyup', keyUp, true);
    window.addEventListener('beforeprint', print, true);
    window.addEventListener('focus', focus);
    window.addEventListener('blur', blur);
    document.addEventListener('keydown', keyDown, true);
    document.addEventListener('keyup', keyUp, true);
    document.addEventListener('visibilitychange', visibility);
    document.addEventListener('copy', clip, true);
    document.addEventListener('cut', clip, true);
    document.addEventListener('paste', clip, true);
    document.addEventListener('contextmenu', context, true);
    document.addEventListener('dragstart', drag, true);
    document.addEventListener('selectstart', select, true);

    return () => {
      window.removeEventListener('keydown', keyDown, true);
      window.removeEventListener('keyup', keyUp, true);
      window.removeEventListener('beforeprint', print, true);
      window.removeEventListener('focus', focus);
      window.removeEventListener('blur', blur);
      document.removeEventListener('keydown', keyDown, true);
      document.removeEventListener('keyup', keyUp, true);
      document.removeEventListener('visibilitychange', visibility);
      document.removeEventListener('copy', clip, true);
      document.removeEventListener('cut', clip, true);
      document.removeEventListener('paste', clip, true);
      document.removeEventListener('contextmenu', context, true);
      document.removeEventListener('dragstart', drag, true);
      document.removeEventListener('selectstart', select, true);
      clearTimeout(timer);
    };
  }, [isEnabled, onBlock]);

  return (
    <div className="protected-preview relative h-full w-full">
      <div ref={dummyRef} tabIndex={-1} />

      <div
        style={{
          filter: isBlurred || isAlertActive ? 'blur(22px)' : 'none',
          opacity: isBlurred || isAlertActive ? 0.08 : 1,
        }}
        className="h-full w-full transition-all duration-300"
      >
        {children}
      </div>

      {isAlertActive && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="rounded-3xl bg-surface p-8 text-center">
            <ShieldAlert size={36} />
            <p>{alertMessage}</p>
          </div>
        </div>
      )}

      {isBlurred && !isAlertActive && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="rounded-3xl bg-surface p-8 text-center">
            <EyeOff size={36} />
            <p>View paused</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenshotGuard;
