"use client";

import { useEffect, useState } from "react";
import { formatPublishedAt } from "@/lib/formatPublishedAt";

// Rendered in the browser so it uses the viewer's clock and time zone.
export function PublishedTime({ iso }: { iso: string }) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    setLabel(formatPublishedAt(new Date(iso), new Date()));
  }, [iso]);

  return <time dateTime={iso}>{label}</time>;
}
