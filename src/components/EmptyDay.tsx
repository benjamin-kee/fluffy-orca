// Shown when the chosen day has no headlines.
export function EmptyDay() {
  return (
    <div className="empty-day">
      <svg width="120" height="100" viewBox="0 0 120 100" role="img" aria-label="A miner digging">
        <rect x="0" y="88" width="120" height="4" rx="2" fill="#8a7357" />
        <path d="M70 88 L80 68 L94 60 L108 68 L116 88 Z" fill="#a39686" />
        <circle cx="92" cy="76" r="2.5" fill="#e0b13a" />
        <circle cx="102" cy="80" r="2" fill="#e0b13a" />
        <path d="M76 56 l4 -5 M83 53 l6 -3 M74 63 l-5 -3" stroke="#a39686" strokeWidth="2" strokeLinecap="round" />
        <rect x="33" y="68" width="7" height="20" rx="2" fill="#2f3b52" />
        <rect x="43" y="68" width="7" height="20" rx="2" fill="#2f3b52" />
        <rect x="30" y="44" width="23" height="28" rx="6" fill="#2f6db5" />
        <circle cx="41" cy="35" r="9" fill="#e9b98f" />
        <path d="M31 33 a10 10 0 0 1 20 0 Z" fill="#f2c21b" />
        <rect x="29" y="31" width="25" height="3.5" rx="1.75" fill="#d9a90f" />
        <circle cx="50" cy="27" r="2.5" fill="#fff6c2" stroke="#d9a90f" />
        <line x1="58" y1="54" x2="70" y2="24" stroke="#8b5a2b" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M60 22 Q70 17 81 28" stroke="#6b6b6b" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M47 51 L62 44" stroke="#2f6db5" strokeWidth="6" strokeLinecap="round" />
        <circle cx="63" cy="44" r="3" fill="#e9b98f" />
      </svg>
      <p>Our keyboard warriors are working hard to get your news.</p>
    </div>
  );
}
