export function AppLogo({ size = 36 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      role="img"
      aria-label="Logo"
    >
      <rect x="0" y="0" width="1024" height="1024" rx="192" fill="#111827" />
      <rect x="180" y="210" width="664" height="600" rx="120" fill="#0B1220" stroke="#2B3445" strokeWidth="16" />
      <g stroke="#2B3445" strokeWidth="10" opacity="0.55">
        <line x1="260" y1="350" x2="764" y2="350" />
        <line x1="260" y1="500" x2="764" y2="500" />
        <line x1="260" y1="650" x2="764" y2="650" />
        <line x1="386" y1="300" x2="386" y2="760" />
        <line x1="512" y1="300" x2="512" y2="760" />
        <line x1="638" y1="300" x2="638" y2="760" />
      </g>
      <path
        d="M285 665 L420 560 L525 595 L650 465 L740 395"
        fill="none"
        stroke="#00A3FF"
        strokeWidth="28"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g fill="#FFFFFF" stroke="#00A3FF" strokeWidth="16">
        <circle cx="285" cy="665" r="24" />
        <circle cx="420" cy="560" r="24" />
        <circle cx="525" cy="595" r="24" />
        <circle cx="650" cy="465" r="24" />
        <circle cx="740" cy="395" r="24" />
      </g>
      <g fill="#FFFFFF" opacity="0.95">
        <rect x="270" y="820" width="64" height="120" rx="32" />
        <rect x="372" y="770" width="64" height="170" rx="32" />
        <rect x="474" y="850" width="64" height="90" rx="32" />
        <rect x="576" y="730" width="64" height="210" rx="32" />
        <rect x="678" y="790" width="64" height="150" rx="32" />
      </g>
    </svg>
  );
}
