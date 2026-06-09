import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Discover Your Expert Income Archetype™ | The5th Consulting",
  description: "Find out exactly why you're stuck and get a personalised growth blueprint in 5 minutes. Built for coaches and experts over 40.",
  openGraph: {
    title: "Discover Your Expert Income Archetype™ | The5th Consulting",
    description: "Find out exactly why you're stuck and get a personalised growth blueprint in 5 minutes. Built for coaches and experts over 40.",
  },
  twitter: {
    title: "Discover Your Expert Income Archetype™ | The5th Consulting",
    description: "Find out exactly why you're stuck and get a personalised growth blueprint in 5 minutes. Built for coaches and experts over 40.",
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#0a0f0a' }}>{children}<Analytics /></body>
    </html>
  );
}
