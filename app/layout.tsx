import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://visao-360-diretor.fael360092.chatgpt.site'),
  title: 'Visão 360 | Diretor de Carteira',
  description: 'Inteligência executiva para gestão de carteira empresarial.',
  openGraph: {
    title: 'Visão 360',
    description: 'Inteligência para decisões empresariais.',
    url: 'https://visao-360-diretor.fael360092.chatgpt.site',
    images: [{ url: 'https://visao-360-diretor.fael360092.chatgpt.site/og.png', width: 1200, height: 630, alt: 'Visão 360 — Inteligência para decisões empresariais' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visão 360',
    description: 'Inteligência para decisões empresariais.',
    images: ['https://visao-360-diretor.fael360092.chatgpt.site/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body></html>;
}
