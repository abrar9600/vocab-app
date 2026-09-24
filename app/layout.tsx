import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Vocabulary Matching App',
  description: 'Learn vocabulary by matching words with their definitions',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen text-slate-800 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-6xl w-full mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}