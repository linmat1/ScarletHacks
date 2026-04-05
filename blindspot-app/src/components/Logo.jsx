export default function Logo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer glow */}
      <defs>
        <radialGradient id="logo-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F7B731" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#F7B731" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="logo-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F7B731" />
          <stop offset="100%" stopColor="#D4982A" />
        </linearGradient>
        <linearGradient id="logo-iris" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F7B731" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#E8A825" />
          <stop offset="100%" stopColor="#C48820" />
        </linearGradient>
      </defs>

      {/* Subtle glow behind */}
      <circle cx="32" cy="32" r="28" fill="url(#logo-glow)" />

      {/* Eye shape — upper lid */}
      <path
        d="M6 32C6 32 16 14 32 14C48 14 58 32 58 32"
        stroke="url(#logo-gold)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Eye shape — lower lid */}
      <path
        d="M6 32C6 32 16 50 32 50C48 50 58 32 58 32"
        stroke="url(#logo-gold)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Iris ring */}
      <circle
        cx="32"
        cy="32"
        r="11"
        stroke="url(#logo-iris)"
        strokeWidth="2.5"
        fill="none"
      />

      {/* Pupil */}
      <circle cx="32" cy="32" r="5" fill="url(#logo-gold)" />

      {/* Blind spot — a diagonal slash cutting through the eye */}
      <line
        x1="22"
        y1="22"
        x2="42"
        y2="42"
        stroke="#0C0F17"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1="22"
        y1="22"
        x2="42"
        y2="42"
        stroke="#F7B731"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="3 4"
        opacity="0.7"
      />

      {/* Light reflection dot */}
      <circle cx="28" cy="28" r="2" fill="white" opacity="0.5" />
    </svg>
  )
}
