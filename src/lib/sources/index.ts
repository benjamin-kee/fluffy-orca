import { malayMail } from "./malayMail";
import type { NewsSource } from "./newsSource";

// Active sources. Replacing a publisher means changing its adapter and this list only.
export const sources: NewsSource[] = [malayMail];
