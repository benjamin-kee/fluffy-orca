// Shown when From is after To.
export function WrongOrder() {
  return (
    <div className="empty-day">
      <svg width="140" height="100" viewBox="0 0 140 100" role="img" aria-label="A puzzled miner by a signpost pointing the wrong way">
        <rect x="0" y="88" width="140" height="4" rx="2" fill="#8a7357" />
        <rect x="33" y="68" width="7" height="20" rx="2" fill="#2f3b52" />
        <rect x="43" y="68" width="7" height="20" rx="2" fill="#2f3b52" />
        <rect x="30" y="44" width="23" height="28" rx="6" fill="#2f6db5" />
        <circle cx="41" cy="35" r="9" fill="#e9b98f" />
        <path d="M31 33 a10 10 0 0 1 20 0 Z" fill="#f2c21b" />
        <rect x="29" y="31" width="25" height="3.5" rx="1.75" fill="#d9a90f" />
        <circle cx="50" cy="27" r="2.5" fill="#fff6c2" stroke="#d9a90f" />
        <path d="M33 50 Q22 40 31 28" stroke="#2f6db5" strokeWidth="6" fill="none" strokeLinecap="round" />
        <circle cx="31" cy="28" r="3" fill="#e9b98f" />
        <line x1="58" y1="88" x2="62" y2="58" stroke="#8b5a2b" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M52 60 Q62 52 72 58" stroke="#6b6b6b" strokeWidth="4" fill="none" strokeLinecap="round" />
        <text x="58" y="20" fontSize="16" fontWeight="700" fill="#e0b13a">?</text>
        <rect x="100" y="34" width="5" height="54" fill="#8b5a2b" />
        <g transform="rotate(-8 102 42)">
          <path d="M84 36 h34 l7 6 l-7 6 h-34 Z" fill="#c9a26b" />
          <text x="96" y="45" fontSize="8" fontWeight="700" fill="#3b2a14">TO</text>
        </g>
        <g transform="rotate(8 102 60)">
          <path d="M120 54 h-34 l-7 6 l7 6 h34 Z" fill="#c9a26b" />
          <text x="88" y="63" fontSize="8" fontWeight="700" fill="#3b2a14">FROM</text>
        </g>
      </svg>
      <p role="alert">From date must be on or before To date.</p>
    </div>
  );
}
