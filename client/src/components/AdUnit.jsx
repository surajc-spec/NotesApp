import { useEffect } from 'react';

const slotMap = {
  top: import.meta.env.VITE_ADSENSE_TOP_SLOT,
  sidebar: import.meta.env.VITE_ADSENSE_SIDEBAR_SLOT,
  footer: import.meta.env.VITE_ADSENSE_FOOTER_SLOT,
};

const labels = {
  top: 'Sponsored',
  sidebar: 'Sponsored',
  footer: 'Sponsored',
};

const AdUnit = ({ placement = 'top', className = '' }) => {
  const client = import.meta.env.VITE_ADSENSE_CLIENT;
  const slot = slotMap[placement];
  const enabled = Boolean(client && slot);

  useEffect(() => {
    if (!enabled || document.querySelector(`script[data-adsense-client="${client}"]`)) return;

    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    script.dataset.adsenseClient = client;
    document.head.appendChild(script);
  }, [client, enabled]);

  useEffect(() => {
    if (!enabled) return;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (error) {
      console.warn('AdSense could not render this slot yet:', error);
    }
  }, [enabled, placement, slot]);

  return (
    <aside className={`overflow-hidden rounded-lg border border-border bg-surface/80 ${className}`}>
      <div className="border-b border-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">
        {labels[placement] || 'Sponsored'}
      </div>
      {enabled ? (
        <ins
          className="adsbygoogle block min-h-24"
          style={{ display: 'block' }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div className="flex min-h-24 items-center justify-center px-4 py-6 text-center text-xs font-medium text-muted">
          Ad placement
        </div>
      )}
    </aside>
  );
};

export default AdUnit;
