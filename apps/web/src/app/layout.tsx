import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../index.css';
import Header from '@/components/header';
import Providers from '@/components/providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default:
      'Samfundet medlemskort – Skriv ut profilbilde i riktig størrelse (2.5×3 cm)',
    template: '%s · Samfundet medlemskort',
  },
  description:
    'Gratis verktøy som gjør det enkelt å lage og skrive ut profilbilde i riktig størrelse (2.5×3 cm) til Studentersamfundets medlemskort. Last opp, beskjær og skriv ut – klart for myPrint/NTNU-skrivere.',
  keywords: [
    'Studentersamfundet',
    'Samfundet',
    'medlemskort',
    'medlemskort bilde',
    'profilbilde',
    'riktig størrelse',
    '2.5x3 cm',
    'NTNU',
    'myPrint',
    'Ricoh',
    'utskrift',
    'skriv ut',
    'foto utskrift',
    'passfoto størrelse',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    title:
      'Samfundet medlemskort – Skriv ut profilbilde i riktig størrelse (2.5×3 cm)',
    description:
      'Lag og skriv ut profilbilde i korrekt størrelse til Samfundets medlemskort. Enkelt og gratis, klart for myPrint/NTNU.',
    siteName: 'Samfundet medlemskort',
    locale: 'nb_NO',
    images: [
      {
        url: '/images/logo_samf.png',
        width: 512,
        height: 512,
        alt: 'Studentersamfundet i Trondhjem – logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title:
      'Samfundet medlemskort – Skriv ut profilbilde i riktig størrelse (2.5×3 cm)',
    description:
      'Gratis verktøy for å lage og skrive ut profilbilde til Samfundets medlemskort. Klart for myPrint/NTNU.',
    images: ['/images/logo_samf.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
