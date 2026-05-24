import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DataSpider - AI-Powered Social Media Data Extraction',
  description: 'Extract data from Xiaohongshu, Douyin, and more with AI-powered automation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
