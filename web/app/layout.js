import "./globals.css";
import { Suspense } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";
import MetaPixel from "../components/MetaPixel";
import Analytics from "../components/Analytics";

export const metadata = {
  title: "Piano With Aaron",
  description:
    "Master the piano with structured online courses from Piano With Aaron.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-cream dark:bg-ink">
        {/* Facebook Meta Pixel */}
        <MetaPixel />

        {/* Google Analytics, Google Ads, TikTok Pixel and Microsoft Clarity */}
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>

        {/* Site Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Site Footer */}
        <Footer />

        {/* Floating WhatsApp Button */}
        <WhatsAppButton />
      </body>
    </html>
  );
}
