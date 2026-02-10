import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

// Modern sans-serif a szövegeknek
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// Elegáns serif a címeknek
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata = {
  title: "Csizi Varrodája - Egyedi Ruhák és Javítás",
  description: "Minőségi varrás, ruhaigazítás és egyedi tervezés.",
  // ITT VAN AZ ÚJ RÉSZ A FAVICONOKNAK:
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    // Opcionális: Android Chrome-hoz
    other: [
      {
        rel: 'icon',
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        rel: 'icon',
        url: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="hu" className="scroll-smooth">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-stone-50 text-stone-900`}>
        {children}
      </body>
    </html>
  );
}