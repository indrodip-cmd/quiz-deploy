import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Your $5K/Month Path | The5th",
  description: "Answer 8 questions and get your personalized 15-day AI roadmap to $5,000/month from your expertise.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#0a0f0a' }}>{children}</body>
    </html>
  );
}
