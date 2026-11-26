// Spend cap (SPEC-MVP3 MVP3.0-R16, D-053): the calendar month is counted in Malaysia time (UTC+08:00,
// no daylight saving). Pure functions, unit tested.
import { MONTHLY_PAUSE_USD } from "./config";

const MALAYSIA_OFFSET_MS = 8 * 60 * 60 * 1000;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// The moment the current calendar month began in Malaysia, as an exact UTC instant.
export function monthStartMalaysia(now: Date): Date {
  const local = new Date(now.getTime() + MALAYSIA_OFFSET_MS);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1) - MALAYSIA_OFFSET_MS);
}

export function isPaused(monthSpendUsd: number): boolean {
  return monthSpendUsd >= MONTHLY_PAUSE_USD;
}

// S6 paused wording: "... will be back on 1 <next month>."
export function pausedWording(now: Date): string {
  const local = new Date(now.getTime() + MALAYSIA_OFFSET_MS);
  const next = MONTHS[(local.getUTCMonth() + 1) % 12];
  return `Ask Watchtower has reached its monthly limit and will be back on 1 ${next}.`;
}

// Today's date in Malaysia for the AI (MVP3-S8), for example "Thursday 26 November 2026".
export function todayForAi(now: Date, timeZone = "Asia/Kuala_Lumpur"): string {
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone }).format(now);
}
