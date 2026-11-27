import type { Metadata } from "next";
import { AskClient } from "@/components/ask/AskClient";
import { ASK_MODEL_NAME, askEnabled } from "@/lib/ask/config";
import { WORDING } from "@/lib/ask/wording";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ask Watchtower",
  description: "Ask about business news in Watchtower's headlines",
};

// SPEC-MVP3 MVP3.0-R1. While the kill switch is off, the page shows only the switched-off notice (R17).
export default function AskPage() {
  return (
    <main className="ask">
      <header className="ask-header">
        <h1>Ask Watchtower</h1>
        <a href="/">All headlines</a>
      </header>
      {askEnabled() ? (
        <AskClient modelName={ASK_MODEL_NAME} />
      ) : (
        <p className="ask-notice ask-notice-off" role="status">
          {WORDING.switchedOff} <a href="/">Browse all headlines</a>
        </p>
      )}
    </main>
  );
}
