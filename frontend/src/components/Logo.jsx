export default function Logo({ size = 36, showText = true }) {
  const iconSize = size;
  const fontSize = Math.round(size * 0.45);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.3 }}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <rect width="36" height="36" rx="9" fill="url(#logo-grad)" />
        <path d="M12 24c4-8 8-4 12-12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M12 12c4 8 8 4 12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6" />
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--primary, #2563EB)" />
            <stop offset="1" stopColor="var(--secondary, #06B6D4)" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <span style={{
          fontSize,
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1,
          letterSpacing: '-0.3px',
        }}>
          SoftLine
        </span>
      )}
    </div>
  );
}
