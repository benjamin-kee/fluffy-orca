import { gnews } from "./gnews";
import type { NewsSource } from "./newsSource";

// Active sources. Replacing a provider means changing its adapter and this list only.
export const sources: NewsSource[] = [gnews];
