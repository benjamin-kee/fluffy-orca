// Lets Node's test runner load the app's TypeScript: maps the "@/" alias to src/
// and resolves extensionless relative imports to .ts files.
import { registerHooks } from "node:module";

const src = new URL("../src/", import.meta.url);

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) specifier = new URL(specifier.slice(2), src).href;
    try {
      return nextResolve(specifier, context);
    } catch (err) {
      const local = specifier.startsWith(".") || specifier.startsWith("file:");
      if (err?.code !== "ERR_MODULE_NOT_FOUND" || !local) throw err;
      return nextResolve(`${specifier}.ts`, context);
    }
  },
});
