import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JMK Quotation Generator',
  description: 'Generate professional GST quotations for JMK Engineering & Developer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}