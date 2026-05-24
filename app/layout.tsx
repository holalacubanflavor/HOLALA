import type { Metadata } from "next";
import { Poppins, Baloo_2 } from "next/font/google";
import "./globals.css";

// Body font — Poppins (legibilidad en móvil, tono premium pero accesible)
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

// Display font — Baloo 2 (headings con carácter cubano/tropical)
const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HOLALA Cuban Flavor | Comida Cubana en San Antonio TX",
    template: "%s | HOLALA Cuban Flavor",
  },
  description:
    "Latin tropical street food experience — Cuban roots, modern flavor. Food truck en San Antonio, TX. Miércoles–domingo 4pm–10pm.",
  keywords: [
    "Cuban food San Antonio",
    "Cuban sandwich San Antonio",
    "Cuban food truck Texas",
    "comida cubana San Antonio",
    "Latin catering San Antonio",
    "food truck catering San Antonio",
  ],
  metadataBase: new URL("https://holalacubanflavor.com"),
  openGraph: {
    type: "website",
    locale: "es_US",
    alternateLocale: "en_US",
    siteName: "HOLALA Cuban Flavor",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${poppins.variable} ${baloo.variable}`}
    >
      <body className="font-body antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
