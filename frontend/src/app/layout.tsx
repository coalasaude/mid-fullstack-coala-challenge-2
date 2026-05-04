import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/core/providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'HealthFlow',
  description:
    'Plataforma de orquestração de exames médicos · Medical exam orchestration platform',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={geistSans.variable}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
