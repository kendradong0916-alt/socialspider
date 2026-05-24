import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Skyvern MVP — Computer Use Automation',
  description: 'Automate any website with natural language. Powered by Skyvern + Supabase.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
