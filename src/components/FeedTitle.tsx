import { askEnabled } from "@/lib/ask/config";

// The feed's title, with the "Ask Watchtower" link beside it in every state of the page (SPEC-MVP3
// MVP3.0-R1). The link is hidden while the kill switch is off (R17).
export function FeedTitle() {
  return (
    <header className="feed-title">
      <h1>Watchtower</h1>
      {askEnabled() && <a href="/ask">Ask Watchtower</a>}
    </header>
  );
}
