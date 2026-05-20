import React, { useEffect, useState } from 'react';
import { ShieldAlert, EyeOff } from 'lucide-react';

const ScreenshotGuard = ({ children, isEnabled = true }) => {
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    if (!isEnabled) return;

    let alertTimeout;

    const triggerTemporaryAlert = (msg) => {
      setAlertMessage(msg);
      setIsAlertActive(true);
      if (alertTimeout) clearTimeout(alertTimeout);
      alertTimeout = setTimeout(() => {
        setIsAlertActive(false);
      }, 3000);
    };

    // 1. Keyboard Shortcuts Prevention
    const handleKeyDown = (e) => {
      // PrintScreen key (standard code 44 or key name), Alt+PrintScreen, Win+PrintScreen, Ctrl+PrintScreen
      if (
        e.key === 'PrintScreen' || 
        e.keyCode === 44 ||
        ((e.altKey || e.metaKey || e.ctrlKey) && (e.key === 'PrintScreen' || e.keyCode === 44))
      ) {
        e.preventDefault();
        triggerTemporaryAlert('Screenshots and downloads are disabled for notes');
        return;
      }

      // OS Snipping/Capture Shortcuts:
      // - Windows: Win + Shift + S (sometimes captures as Meta+Shift+S)
      // - Mac: Cmd + Shift + 3, Cmd + Shift + 4, Cmd + Shift + 5 (Meta+Shift+3/4/5)
      // - Generic: Meta + Shift + S
      if (
        (e.metaKey && e.shiftKey && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) ||
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5' || e.keyCode === 51 || e.keyCode === 52 || e.keyCode === 53))
      ) {
        e.preventDefault();
        triggerTemporaryAlert('Screenshots and downloads are disabled for notes');
        return;
      }

      // Ctrl + C, Ctrl + S, Ctrl + P
      if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        triggerTemporaryAlert(`This action (${e.key.toUpperCase()}) is disabled for notes`);
        return;
      }
    };

    // Print screen or snipping hotkeys on keyup as well
    const handleKeyUp = (e) => {
      if (
        e.key === 'PrintScreen' || 
        e.keyCode === 44 ||
        (e.metaKey && e.shiftKey && (e.key === 's' || e.key === 'S' || e.keyCode === 83))
      ) {
        try {
          navigator.clipboard.writeText(''); // Clear clipboard
        } catch (_) {}
        triggerTemporaryAlert('Screenshots and downloads are disabled for notes');
      }
    };

    // 2. Tab/Window Focus Loss (Blur & Visibility Change)
    const handleFocusLoss = () => {
      // Small delay allows document.activeElement to update
      setTimeout(() => {
        if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
          // Focus shifted into our own PDF preview iframe inside the page.
          // This is a false focus loss, so we ignore it.
          return;
        }
        setIsBlurred(true);
      }, 50);
    };

    const handleFocusGain = () => {
      setIsBlurred(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
      } else {
        setIsBlurred(false);
      }
    };

    // 3. Right-Click Context Menu Prevention
    const handleContextMenu = (e) => {
      e.preventDefault();
      triggerTemporaryAlert('Right-click context menu is disabled');
    };

    // 4. Drag & Drop Prevention
    const handleDragStart = (e) => {
      e.preventDefault();
    };

    // Add listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleFocusLoss);
    window.addEventListener('focus', handleFocusGain);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleFocusLoss);
      window.removeEventListener('focus', handleFocusGain);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      if (alertTimeout) clearTimeout(alertTimeout);
    };
  }, [isEnabled]);

  // CSS classes for selection and copying block
  const guardClasses = isEnabled 
    ? 'select-none pointer-events-auto protected-preview' 
    : '';

  return (
    <div className={`relative ${guardClasses}`}>
      {/* Target content - hidden instantly with 0ms transition when blurred/alerted */}
      <div className={isAlertActive || isBlurred ? 'opacity-0 select-none pointer-events-none' : 'transition-opacity duration-300'}>
        {children}
      </div>

      {/* Temporary Warning Alert Overlay - solid color, zero animations to prevent OS screen capture tools from grabbing contents */}
      {isEnabled && isAlertActive && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black">
          <div className="text-center max-w-sm p-8 bg-surface border border-border rounded-3xl shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mb-4">
              <ShieldAlert size={36} />
            </div>
            <h4 className="text-lg font-bold text-foreground">Action Blocked</h4>
            <p className="text-sm text-muted mt-2 leading-relaxed">{alertMessage}</p>
          </div>
        </div>
      )}

      {/* Focus/Tab Blur Overlay - solid color, zero animations to prevent OS screen capture tools from grabbing contents */}
      {isEnabled && isBlurred && !isAlertActive && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black">
          <div className="text-center max-w-sm p-8 bg-surface border border-border rounded-3xl shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-4">
              <EyeOff size={36} className="animate-pulse" />
            </div>
            <h4 className="text-lg font-bold text-foreground">View Paused</h4>
            <p className="text-sm text-muted mt-2 leading-relaxed">Focus was lost. Click back into the window to resume viewing.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenshotGuard;
