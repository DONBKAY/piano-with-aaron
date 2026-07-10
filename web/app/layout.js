import "./globals.css";
import Header from "../components/Header";
import WhatsAppButton from "../components/WhatsAppButton";

export const metadata = {
  title: "Piano with Aaron",
  description: "Learn piano online with structured, premium video courses.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
