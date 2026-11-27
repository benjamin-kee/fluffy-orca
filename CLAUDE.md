# Watchtower Claude Code Instructions

- Product specifications under `docs/specs/` are authoritative.
- Implement only the currently approved MVP specification.
- Never add features, infrastructure, dependencies, abstractions, or data fields outside the active specification without my explicit approval.
- If a deviation from the specification appears technically necessary, stop and ask me before implementing it.
- Do not silently reinterpret product requirements.
- Prefer the simplest implementation that satisfies the approved specification.
- Do not modify product specification files unless I explicitly instruct you to do so.
- Keep implementation changes small and logically grouped.
- Do not implement future MVP functionality simply to "future-proof" the application.
- Suggestions outside scope may be listed as future considerations, but must not be implemented without approval.
- Write PRDs and specs in full sentences, so anyone can understand them without asking for clarification: say what each item is, why it is needed and what it does, and explain technical terms (D-067).
- Follow `docs/product/Product-Principles.md` in all product and UI work, starting with P-1: web first, mobile friendly (design for desktop browsers first; every page must also work well on a phone).

## Naming

- The product is called **Watchtower**. "Phoenix" is its retired former name: never use it in code, docs, commit messages, pull requests or replies. If you find it anywhere in this project, flag it so it can be renamed.
- This does not apply to third-party names that happen to contain the word, such as the `@supabase/phoenix` package in `package-lock.json`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
