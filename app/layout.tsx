import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Vocab Practice App',
  description: 'Study and match vocabulary words from Google Sheets',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="min-h-screen font-sans antialiased">
        <Navbar />
        <main className="p-4 sm:p-8">{children}</main>
      </body>
    </html>
  );
}