import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KUSF AEMS',
  description: 'Athlete Eligibility & Management System for KUSF',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
