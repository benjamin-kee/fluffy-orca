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

## Naming

- The product is called **Watchtower**. "Phoenix" is its retired former name: never use it in code, docs, commit messages, pull requests or replies. If you find it anywhere in this project, flag it so it can be renamed.
- This does not apply to third-party names that happen to contain the word, such as the `@supabase/phoenix` package in `package-lock.json`.
