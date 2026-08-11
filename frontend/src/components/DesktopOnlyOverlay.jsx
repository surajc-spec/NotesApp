import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const DesktopOnlyOverlay = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSecurityRestrictions = () => {
      const currentPath = location.pathname;

      // Allow public static pages like /about, /contact, /terms, /privacy without hard block
      const isExemptPath = ['/about', '/privacy', '/terms', '/contact'].includes(currentPath);

      // 1. Check Mobile Device / Screen Width
      const isMobileWidth = window.innerWidth < 1024;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent || ''
      );
      const isMobile = isMobileWidth || isMobileUA;

      // 2. Check Minimized / Non-Maximized Window (Desktop only)
      const widthThreshold = window.screen.availWidth * 0.85;
      const heightThreshold = window.screen.availHeight * 0.85;
      const isMinimizedOrSmall =
        !isMobile &&
        (window.outerWidth < widthThreshold || window.outerHeight < heightThreshold);

      // 3. Check Developer Tools Opened
      const devToolsThreshold = 160;
      const isDevToolsOpen =
        window.outerWidth - window.innerWidth > devToolsThreshold ||
        window.outerHeight - window.innerHeight > devToolsThreshold;

      const isRestricted = (isMobile || isMinimizedOrSmall || isDevToolsOpen) && !isExemptPath;

      if (isRestricted && currentPath !== '/restricted') {
        // Save previous valid route so student can return when maximized
        if (currentPath !== '/') {
          sessionStorage.setItem('last_valid_route', currentPath + location.search);
        }
        navigate('/restricted', { replace: true });
      } else if (!isRestricted && currentPath === '/restricted') {
        // If security checks pass and user is on /restricted, restore previous page
        const lastRoute = sessionStorage.getItem('last_valid_route') || '/notes';
        navigate(lastRoute, { replace: true });
      }
    };

    // Run check on mount & route change
    checkSecurityRestrictions();

    // Event listeners for window resize, focus, and DevTools toggle
    window.addEventListener('resize', checkSecurityRestrictions);
    window.addEventListener('focus', checkSecurityRestrictions);
    const interval = setInterval(checkSecurityRestrictions, 1000);

    return () => {
      window.removeEventListener('resize', checkSecurityRestrictions);
      window.removeEventListener('focus', checkSecurityRestrictions);
      clearInterval(interval);
    };
  }, [location, navigate]);

  return null;
};

export default DesktopOnlyOverlay;
