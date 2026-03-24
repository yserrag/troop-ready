import type { Metadata } from "next";
import "./globals.css";
import { ServiceWorkerProvider } from "@/components/sw-provider";

export const metadata: Metadata = {
  title: "TroopReady",
  description: "Offline-first event companion for scout troops",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1a2744" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen flex flex-col">
        <header
          className="bg-[#1a2744] text-white px-4 py-3"
          role="banner"
        >
          <nav aria-label="Main navigation" className="flex items-center justify-between max-w-4xl mx-auto">
            <a href="/" className="text-xl font-bold">
              TroopReady
            </a>
            <ul className="flex gap-4 text-sm" role="list">
              <li>
                <a href="/" className="hover:underline">
                  Events
                </a>
              </li>
              <li>
                <a href="/dashboard" className="hover:underline">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/settings" className="hover:underline">
                  Settings
                </a>
              </li>
            </ul>
          </nav>
        </header>

        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6" role="main">
          {children}
        </main>

        <footer
          className="bg-gray-100 text-gray-600 text-center text-sm px-4 py-3"
          role="contentinfo"
        >
          TroopReady &mdash; offline-first for scouts
        </footer>

        <ServiceWorkerProvider />
      </body>
    </html>
  );
}
