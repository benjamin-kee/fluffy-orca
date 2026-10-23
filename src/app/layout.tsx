import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Watchtower",
  description: "Malaysian business news headlines in one feed.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
