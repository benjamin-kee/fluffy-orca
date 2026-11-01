import Link from "next/link";

// Shown when the chosen dates have headlines but none match the search (MVP1.6-R6).
export function NoSearchMatch({ message, clearHref }: { message: string; clearHref: string }) {
  return (
    <div className="empty-day">
      <svg width="140" height="100" viewBox="0 0 140 100" role="img" aria-label="A puzzled miner searching a newspaper with a magnifying glass">
        <rect x="0" y="88" width="140" height="4" rx="2" fill="#8a7357" />
        <rect x="96" y="70" width="4" height="18" fill="#8b5a2b" />
        <rect x="80" y="40" width="40" height="32" rx="2" fill="#f4f1ea" stroke="#a39686" strokeWidth="1.5" />
        <rect x="85" y="45" width="30" height="5" rx="1" fill="#6b6b6b" />
        <line x1="85" y1="55" x2="115" y2="55" stroke="#c9c2b6" strokeWidth="2" />
        <line x1="85" y1="60" x2="115" y2="60" stroke="#c9c2b6" strokeWidth="2" />
        <line x1="85" y1="65" x2="105" y2="65" stroke="#c9c2b6" strokeWidth="2" />
        <rect x="33" y="68" width="7" height="20" rx="2" fill="#2f3b52" />
        <rect x="43" y="68" width="7" height="20" rx="2" fill="#2f3b52" />
        <rect x="30" y="44" width="23" height="28" rx="6" fill="#2f6db5" />
        <circle cx="41" cy="35" r="9" fill="#e9b98f" />
        <path d="M31 33 a10 10 0 0 1 20 0 Z" fill="#f2c21b" />
        <rect x="29" y="31" width="25" height="3.5" rx="1.75" fill="#d9a90f" />
        <circle cx="50" cy="27" r="2.5" fill="#fff6c2" stroke="#d9a90f" />
        <path d="M33 50 Q22 40 31 28" stroke="#2f6db5" strokeWidth="6" fill="none" strokeLinecap="round" />
        <circle cx="31" cy="28" r="3" fill="#e9b98f" />
        <path d="M48 52 L66 50" stroke="#2f6db5" strokeWidth="6" strokeLinecap="round" />
        <circle cx="67" cy="50" r="3" fill="#e9b98f" />
        <line x1="68" y1="50" x2="80" y2="58" stroke="#8b5a2b" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="88" cy="58" r="10" fill="#dff0fb" fillOpacity="0.75" stroke="#6b6b6b" strokeWidth="3" />
        <text x="85" y="62" fontSize="11" fontWeight="700" fill="#e0b13a">?</text>
        <text x="56" y="22" fontSize="16" fontWeight="700" fill="#e0b13a">?</text>
      </svg>
      <p>{message}</p>
      <Link href={clearHref}>Clear search</Link>
    </div>
  );
}
