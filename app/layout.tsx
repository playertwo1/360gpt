import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { isDashboardUserAllowed, requireChatGPTUser } from './chatgpt-auth';
import './globals.css';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireChatGPTUser('/');
  const allowed = isDashboardUserAllowed(user);

  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {allowed ? children : <AccessDenied email={user.email} />}
      </body>
    </html>
  );
}

function AccessDenied({ email }: { email: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#0d1c2b] p-6 text-white">
      <section className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[.16em] text-[#65e5c3]">Visão 360</p>
        <h1 className="mt-4 text-3xl font-black tracking-tight">Acesso não autorizado</h1>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          A conta {email} foi autenticada, mas não está na lista privada de acesso ao Dashboard 360.
        </p>
        <a className="mt-6 inline-flex rounded-xl bg-[#39d6ac] px-4 py-2.5 text-sm font-black text-[#0b2730]" href="/signout-with-chatgpt?return_to=/">
          Entrar com outra conta
        </a>
      </section>
    </main>
  );
}
