import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from 'next/script'

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Dashboard",
  description: "A simple task board with list and kanban views.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}
 <Script
          src="https://sdk.usegroom.com/index.global.js"
          groom-sdk-key="ws_sdk_093c0b4cab3bbc8c"
          groom-server="aHR0cHM6Ly90b2RvLWFkdmFuY2UtYmUudmVyY2VsLmFwcA=="
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
