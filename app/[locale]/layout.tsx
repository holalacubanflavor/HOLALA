import type { Metadata } from 'next';
import { Poppins, Baloo_2 } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import '../globals.css';

// Body font — Poppins
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

// Display font — Baloo 2 (headings con carácter cubano/tropical)
const baloo = Baloo_2({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isSpanish = locale === 'es';

  return {
    title: {
      default: 'HOLALA Cuban Flavor | Comida Cubana San Antonio TX',
      template: '%s | HOLALA Cuban Flavor',
    },
    description: isSpanish
      ? 'Latin tropical street food experience — Cuban roots, modern flavor. Food truck en San Antonio, TX. Miércoles–domingo 4pm–10pm.'
      : 'Latin tropical street food experience — Cuban roots, modern flavor. Food truck in San Antonio, TX. Wednesday–Sunday 4pm–10pm.',
    keywords: [
      'Cuban food San Antonio',
      'Cuban sandwich San Antonio',
      'Cuban food truck Texas',
      'comida cubana San Antonio',
      'Latin catering San Antonio',
      'food truck catering San Antonio',
    ],
    metadataBase: new URL('https://www.holalacubanflavor.com'),
    openGraph: {
      type: 'website',
      locale: isSpanish ? 'es_US' : 'en_US',
      alternateLocale: isSpanish ? 'en_US' : 'es_US',
      siteName: 'HOLALA Cuban Flavor',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'HOLALA Cuban Flavor — Latin Tropical Street Food',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'HOLALA Cuban Flavor | Food Truck San Antonio TX',
      description: 'Cuban roots, modern flavor. Food truck in San Antonio, TX.',
    },
    alternates: {
      canonical: `https://www.holalacubanflavor.com/${locale}`,
      languages: {
        'es-US': 'https://www.holalacubanflavor.com/es',
        'en-US': 'https://www.holalacubanflavor.com/en',
      },
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${poppins.variable} ${baloo.variable}`}
    >
      <body className="font-body antialiased bg-background text-foreground">
        <GoogleAnalytics />
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
