import { useState, useEffect } from 'react';

/**
 * Reusable hook to monitor fullscreen status and manage protection states.
 * Automatically resets all protection states when exiting fullscreen.
 */
export const useFullscreenProtection = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBlackoutActive, setIsBlackoutActive] = useState(false);
  const [isFullscreenBlurred, setIsFullscreenBlurred] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isFullscreenAlertActive, setIsFullscreenAlertActive] = useState(false);
  const [fullscreenAlertMessage, setFullscreenAlertMessage] = useState('');

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);

      if (active) {
        // Show "Protected fullscreen mode enabled." entry notification
        setShowNotification(true);
        const timer = setTimeout(() => {
          setShowNotification(false);
        }, 4000);
        return () => clearTimeout(timer);
      } else {
        // Reset all states upon exit
        setIsBlackoutActive(false);
        setIsFullscreenBlurred(false);
        setShowNotification(false);
        setIsFullscreenAlertActive(false);
        setFullscreenAlertMessage('');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Initial check in case it's already fullscreen
    setIsFullscreen(!!document.fullscreenElement);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  return {
    isFullscreen,
    isBlackoutActive,
    setIsBlackoutActive,
    isFullscreenBlurred,
    setIsFullscreenBlurred,
    showNotification,
    setShowNotification,
    isFullscreenAlertActive,
    setIsFullscreenAlertActive,
    fullscreenAlertMessage,
    setFullscreenAlertMessage,
  };
};
