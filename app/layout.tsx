import type {Metadata, Viewport} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Education Board Bangladesh',
  description: 'Intermediate and Secondary Education Boards Bangladesh',
  openGraph: {
    title: 'Education Board Bangladesh',
    description: 'Intermediate and Secondary Education Boards Bangladesh',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Education Board Bangladesh',
    description: 'Intermediate and Secondary Education Boards Bangladesh',
  },
};

export const viewport: Viewport = {
  width: 980,
  initialScale: 1,
  userScalable: true,
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
