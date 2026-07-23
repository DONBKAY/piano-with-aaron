import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";
import MetaPixel from "../components/MetaPixel";

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

        {/* Site Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Site Footer */}
        <Footer />

        {/* Floating WhatsApp Button */}
        <WhatsAppButton />
      </body>
    </html>
  );
}
