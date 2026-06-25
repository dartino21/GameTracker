import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const terminalFont = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  variable: "--font-terminal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GameTracker",
  description: "Игровой дневник для отслеживания пройденных игр.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${terminalFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <div aria-hidden="true" className="crt-overlay crt-flicker" />
      </body>
    </html>
  );
}
