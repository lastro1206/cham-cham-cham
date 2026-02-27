import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const pixelFont = localFont({
  src: "../public/fonts/DNFBitBitv2.ttf",
  variable: "--font-pixel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "참참참",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ko'>
      <body className={`${pixelFont.variable} font-pixel`}>{children}</body>
    </html>
  );
}
