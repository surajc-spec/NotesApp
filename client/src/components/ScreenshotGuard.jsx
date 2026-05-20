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
      // PrintScreen key (standard code 44 or key name)
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
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

    // Print screen on keyup as well
    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        try {
          navigator.clipboard.writeText(''); // Clear clipboard
        } catch (_) {}
        triggerTemporaryAlert('Screenshots and downloads are disabled for notes');
      }
    };

    // 2. Tab/Window Focus Loss (Blur & Visibility Change)
    const handleFocusLoss = () => {
      setIsBlurred(true);
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
      {/* Target content */}
      <div className={isAlertActive || isBlurred ? 'blur-2xl transition-all duration-300 pointer-events-none' : 'transition-all duration-300'}>
        {children}
      </div>

      {/* Temporary Warning Alert Overlay */}
      {isEnabled && isAlertActive && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl transition-all duration-300 animate-in fade-in duration-200">
          <div className="text-center max-w-sm p-8 bg-surface/90 border border-border/80 rounded-3xl shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mb-4">
              <ShieldAlert size={36} />
            </div>
            <h4 className="text-lg font-bold text-foreground">Action Blocked</h4>
            <p className="text-sm text-muted mt-2 leading-relaxed">{alertMessage}</p>
          </div>
        </div>
      )}

      {/* Focus/Tab Blur Overlay */}
      {isEnabled && isBlurred && !isAlertActive && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-2xl transition-all duration-300 animate-in fade-in duration-100">
          <div className="text-center max-w-sm p-8 bg-surface/90 border border-border/80 rounded-3xl shadow-2xl flex flex-col items-center">
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
