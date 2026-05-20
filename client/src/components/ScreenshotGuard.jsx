import React, { useEffect, useState, useContext } from 'react';
import { ShieldAlert, EyeOff } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

/*
  =============================================================================
  REALITY HANDLING DISCLAIMER (Requirement 11)
  -----------------------------------------------------------------------------
  Browser-based protection cannot fully stop external camera photos or
  OS-level screenshots, but should strongly discourage copying and casual sharing.
  =============================================================================
*/

const ScreenshotGuard = ({ children, isEnabled = true }) => {
  const { user } = useContext(AuthContext);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isBlurred, setIsBlurred] = useState(false);
  const [watermarkTime, setWatermarkTime] = useState('');

  // 1. Dynamic Watermark Timestamp Updater (Requirement 8)
  useEffect(() => {
    const updateTime = () => {
      setWatermarkTime(
        new Date().toLocaleString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // 2. Inject Dynamic CSS Watermark Drift & Mobile Protections (Requirement 5, 6, 8, 9)
  useEffect(() => {
    const styleId = 'screenshot-guard-advanced-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* Watermark float keyframe drifting across the notes area */
        @keyframes float-watermark-drift {
          0% { top: 8%; left: 8%; }
          25% { top: 15%; left: 62%; }
          50% { top: 78%; left: 48%; }
          75% { top: 52%; left: 12%; }
          100% { top: 8%; left: 8%; }
        }
        .animate-watermark-drift {
          animation: float-watermark-drift 22s infinite ease-in-out;
        }

        /* Mobile long-press and selection protection */
        .protected-preview, .protected-preview * {
          -webkit-touch-callout: none !important; /* iOS long-press menu */
          -webkit-user-select: none !important;   /* Safari */
          -khtml-user-select: none !important;     /* Konqueror HTML */
          -moz-user-select: none !important;      /* Firefox */
          -ms-user-select: none !important;       /* IE/Edge */
          user-select: none !important;           /* Standard */
          -webkit-user-drag: none !important;     /* Disable dragging */
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    let alertTimeout;

    const triggerTemporaryAlert = (msg) => {
      setAlertMessage(msg);
      setIsAlertActive(true);
      if (alertTimeout) clearTimeout(alertTimeout);
      // Remove blur after exactly 3 seconds (Requirement 2)
      alertTimeout = setTimeout(() => {
        setIsAlertActive(false);
      }, 3000);
    };

    // Keyboard Shortcuts Prevention (Requirement 1, 6)
    const handleKeyDown = (e) => {
      const key = e.key ? e.key.toLowerCase() : '';
      const keyCode = e.keyCode;

      // --- SCREENSHOT / SNIPPING KEYBOARD ATTEMPTS ---
      // A. Windows & Linux PrintScreen (keyCode 44) and standard modifier variants
      const isPrintScreen = e.key === 'PrintScreen' || keyCode === 44;
      const isAltPrintScreen = e.altKey && isPrintScreen;
      const isWinPrintScreen = e.metaKey && isPrintScreen;
      const isWinAltPrintScreen = e.metaKey && e.altKey && isPrintScreen;
      const isShiftPrintScreen = e.shiftKey && isPrintScreen;

      // B. Custom Fullscreen / Laptop Screenshot Key (F11)
      const isF11 = e.key === 'F11' || keyCode === 122;

      // C. macOS Native Capture Shortcuts (Cmd + Shift + 3 / 4 / 5)
      const isMacCapture =
        e.metaKey &&
        e.shiftKey &&
        (key === '3' || key === '4' || key === '5' || keyCode === 51 || keyCode === 52 || keyCode === 53);

      // D. Windows Snipping Shortcut (Win + Shift + S)
      const isWinSnipping = e.metaKey && e.shiftKey && (key === 's' || keyCode === 83);

      if (isPrintScreen || isAltPrintScreen || isWinPrintScreen || isWinAltPrintScreen || isShiftPrintScreen || isMacCapture || isWinSnipping || isF11) {
        e.preventDefault();
        e.stopPropagation();
        triggerTemporaryAlert('Screenshots and copying are disabled for protected notes.');
        return;
      }

      // --- BROWSER / COPY PROTECTIONS ---
      const isModifier = e.ctrlKey || e.metaKey; // Windows Ctrl or macOS Cmd
      
      const isCopy = isModifier && (key === 'c' || keyCode === 67);
      const isSave = isModifier && (key === 's' || keyCode === 83);
      const isPrint = isModifier && (key === 'p' || keyCode === 80);
      const isViewSource = isModifier && (key === 'u' || keyCode === 85);
      
      // Devtools (F12 or Ctrl+Shift+I)
      const isDevTools = keyCode === 123 || (isModifier && e.shiftKey && (key === 'i' || keyCode === 73));
      
      // Inspect element (Ctrl+Shift+C)
      const isInspectElement = isModifier && e.shiftKey && (key === 'c' || keyCode === 67);
      
      // Console (Ctrl+Shift+J)
      const isConsole = isModifier && e.shiftKey && (key === 'j' || keyCode === 74);

      if (isCopy || isSave || isPrint || isViewSource || isDevTools || isInspectElement || isConsole) {
        e.preventDefault();
        e.stopPropagation();
        triggerTemporaryAlert('Screenshots and copying are disabled for protected notes.');
        return;
      }
    };

    const handleKeyUp = (e) => {
      // Clear clipboard on keyup if screenshot hotkey fired
      if (
        e.key === 'PrintScreen' || 
        e.keyCode === 44 ||
        (e.metaKey && e.shiftKey && (e.key === 's' || e.keyCode === 83))
      ) {
        try {
          navigator.clipboard.writeText(''); 
        } catch (_) {}
        triggerTemporaryAlert('Screenshots and copying are disabled for protected notes.');
      }
    };

    // Tab Switch & Visibility Change Protections (Requirement 7, 9)
    const handleFocusLoss = () => {
      setTimeout(() => {
        if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
          // Focus moved to inner PDF preview iframe; ignore to allow scrolling/reading
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

    // Right-Click Context Menu Blocking (Requirement 6)
    const handleContextMenu = (e) => {
      e.preventDefault();
      triggerTemporaryAlert('Right-click context menu is disabled');
    };

    // Clipboard copy/cut/paste event blocking (Requirement 6)
    const handleClipboardEvent = (e) => {
      e.preventDefault();
      triggerTemporaryAlert('Screenshots and copying are disabled for protected notes.');
    };

    // Drag & Drop Prevention (Requirement 6)
    const handleDragStart = (e) => {
      e.preventDefault();
    };

    // Add comprehensive listeners
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleFocusLoss);
    window.addEventListener('focus', handleFocusGain);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleClipboardEvent, true);
    document.addEventListener('cut', handleClipboardEvent, true);
    document.addEventListener('paste', handleClipboardEvent, true);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', handleFocusLoss);
      window.removeEventListener('focus', handleFocusGain);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleClipboardEvent, true);
      document.removeEventListener('cut', handleClipboardEvent, true);
      document.removeEventListener('paste', handleClipboardEvent, true);
      document.removeEventListener('dragstart', handleDragStart);
      if (alertTimeout) clearTimeout(alertTimeout);
    };
  }, [isEnabled]);

  const guardClasses = isEnabled 
    ? 'select-none pointer-events-auto protected-preview' 
    : '';

  // CSS transition behaviors:
  // Apply instantly (transition-none) when active to stop screen grabbers,
  // but ease back smoothly (duration-500) when restoring (Requirement 2, 5)
  const transitionClass = isAlertActive || isBlurred 
    ? 'transition-none' 
    : 'transition-all duration-500 ease-out';

  return (
    <div className={`relative ${guardClasses} w-full h-full`}>
      
      {/* Target Content Wrapper */}
      <div 
        className={`w-full h-full ${transitionClass}`}
        style={{
          filter: isAlertActive || isBlurred ? 'blur(25px)' : 'none',
          opacity: isAlertActive || isBlurred ? 0.08 : 1,
        }}
      >
        {children}
      </div>

      {/* Dynamic Watermark overlay (Requirement 8) */}
      {isEnabled && !isAlertActive && !isBlurred && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-40 select-none">
          <div className="absolute animate-watermark-drift text-foreground/15 font-semibold text-xs md:text-sm whitespace-nowrap bg-surface/30 px-3 py-1.5 border border-border/10 rounded-full shadow-sm">
            🛡️ Protected Content | {user?.name || 'Authorized User'} ({user?.email || 'note-share-user'}) | {watermarkTime}
          </div>
        </div>
      )}

      {/* Temporary Warning Alert Overlay (Requirement 2, 5) */}
      {isEnabled && isAlertActive && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-[25px] transition-none">
          <div className="text-center max-w-sm p-8 bg-surface border border-border rounded-3xl shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mb-4">
              <ShieldAlert size={36} />
            </div>
            <h4 className="text-lg font-bold text-foreground">Action Blocked</h4>
            <p className="text-sm text-muted mt-2 leading-relaxed">{alertMessage}</p>
          </div>
        </div>
      )}

      {/* Focus/Tab Blur Overlay (Requirement 7) */}
      {isEnabled && isBlurred && !isAlertActive && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-[25px] transition-none">
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
