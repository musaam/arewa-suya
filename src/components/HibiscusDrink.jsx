/**
 * HibiscusDrink — inline SVG illustration of a hibiscus refresher
 * in a tall transparent cup with ice, bubbles, and a flower garnish.
 *
 * Props:
 *   variant  — 'left' | 'right'  controls which side the straw leans
 *   color    — primary liquid color (defaults to #B21E5B)
 *   colorDark — darker shade for depth (defaults to #7E1440)
 */
export default function HibiscusDrink({
  variant = 'left',
  color = '#B21E5B',
  colorDark = '#7E1440',
}) {
  const flip = variant === 'right' ? 'scale(-1,1) translate(-120,0)' : ''

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 260"
      aria-hidden="true"
      className="hibiscus-drink-svg"
    >
      <defs>
        {/* Glass body clip */}
        <clipPath id={`glass-clip-${variant}`}>
          <path d="M22,30 L14,240 Q14,248 24,248 L96,248 Q106,248 106,240 L98,30 Z" />
        </clipPath>

        {/* Liquid gradient — vibrant at top, deeper at bottom */}
        <linearGradient id={`liquid-grad-${variant}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={colorDark} stopOpacity="0.85" />
          <stop offset="50%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={colorDark} stopOpacity="0.85" />
        </linearGradient>

        {/* Glass shine gradient */}
        <linearGradient id={`glass-shine-${variant}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.18" />
          <stop offset="35%" stopColor="white" stopOpacity="0.06" />
          <stop offset="100%" stopColor="white" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* ── Cup outline (glass) ── */}
      {/* Back wall */}
      <path
        d="M22,30 L14,240 Q14,248 24,248 L96,248 Q106,248 106,240 L98,30 Z"
        fill="rgba(255,255,255,0.08)"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
      />

      {/* ── Liquid fill ── */}
      <g clipPath={`url(#glass-clip-${variant})`}>
        {/* Main liquid body */}
        <rect
          x="0" y="80" width="120" height="170"
          fill={`url(#liquid-grad-${variant})`}
        />

        {/* Liquid surface highlight — slightly wavy */}
        <path
          d="M14,80 Q35,74 60,79 Q85,84 106,78"
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Ice cube 1 */}
        <rect x="28" y="100" width="22" height="20" rx="3"
          fill="rgba(255,255,255,0.35)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
        <line x1="30" y1="103" x2="30" y2="117" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
        <line x1="28" y1="107" x2="50" y2="107" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />

        {/* Ice cube 2 */}
        <rect x="68" y="115" width="20" height="18" rx="3"
          fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
        <line x1="70" y1="118" x2="70" y2="130" stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" />

        {/* Ice cube 3 — partially submerged */}
        <rect x="42" y="145" width="18" height="15" rx="2"
          fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.35)" strokeWidth="0.7" />

        {/* Bubbles */}
        <circle cx="38" cy="175" r="3.5" fill="rgba(255,255,255,0.22)" />
        <circle cx="55" cy="200" r="2.5" fill="rgba(255,255,255,0.18)" />
        <circle cx="75" cy="185" r="4" fill="rgba(255,255,255,0.2)" />
        <circle cx="85" cy="210" r="2" fill="rgba(255,255,255,0.15)" />
        <circle cx="45" cy="220" r="3" fill="rgba(255,255,255,0.17)" />
        <circle cx="65" cy="160" r="2" fill="rgba(255,255,255,0.2)" />
      </g>

      {/* ── Glass shine overlay ── */}
      <path
        d="M22,30 L14,240 Q14,248 24,248 L40,248 L32,30 Z"
        fill={`url(#glass-shine-${variant})`}
        clipPath={`url(#glass-clip-${variant})`}
      />

      {/* ── Rim ── */}
      <ellipse cx="60" cy="30" rx="38" ry="6"
        fill="rgba(255,255,255,0.1)"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1.5"
      />

      {/* ── Bottom ellipse ── */}
      <ellipse cx="55" cy="248" rx="32" ry="5"
        fill="rgba(255,255,255,0.08)"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1"
      />

      {/* ── Straw ── */}
      <g transform={flip}>
        <rect x="78" y="10" width="6" height="130" rx="3"
          fill="#89D3B0"
          opacity="0.9"
        />
        {/* Straw highlight */}
        <rect x="79.5" y="12" width="2" height="126" rx="1"
          fill="rgba(255,255,255,0.4)"
        />
      </g>

      {/* ── Hibiscus flower garnish on the rim ── */}
      <g transform={`translate(${variant === 'right' ? 30 : 80}, 22)`}>
        {/* 5 petals */}
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <ellipse
            key={i}
            cx={Math.cos((angle * Math.PI) / 180) * 9}
            cy={Math.sin((angle * Math.PI) / 180) * 9}
            rx="6"
            ry="4"
            fill={i % 2 === 0 ? color : colorDark}
            opacity="0.92"
            transform={`rotate(${angle}, ${Math.cos((angle * Math.PI) / 180) * 9}, ${Math.sin((angle * Math.PI) / 180) * 9})`}
          />
        ))}
        {/* Center */}
        <circle cx="0" cy="0" r="4" fill="#FDF6F1" />
        <circle cx="0" cy="0" r="2" fill="#B21E5B" />
        {/* Stamen dots */}
        {[0, 60, 120, 180, 240, 300].map((a, i) => (
          <circle
            key={i}
            cx={Math.cos((a * Math.PI) / 180) * 2.5}
            cy={Math.sin((a * Math.PI) / 180) * 2.5}
            r="0.8"
            fill="#FDF6F1"
          />
        ))}
      </g>

      {/* ── Condensation drops on outside of glass ── */}
      <ellipse cx="26" cy="140" rx="2" ry="4" fill="rgba(255,255,255,0.18)" />
      <ellipse cx="96" cy="170" rx="1.5" ry="3.5" fill="rgba(255,255,255,0.15)" />
      <ellipse cx="24" cy="190" rx="1.5" ry="3" fill="rgba(255,255,255,0.12)" />
      <ellipse cx="98" cy="130" rx="1.5" ry="3" fill="rgba(255,255,255,0.12)" />
    </svg>
  )
}
