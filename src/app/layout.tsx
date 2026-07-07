import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProofPilot — Turn ambitious claims into credible proof",
  description:
    "ProofPilot audits startup pitches, project reports, and hackathon submissions — showing what is supported, what is risky, and what to validate next.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground scroll-thin">
        {children}
      </body>
    </html>
  );
}
