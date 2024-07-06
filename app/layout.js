// app/layout.js
import Head from 'next/head';
import { Analytics } from '@vercel/analytics/react';
// import './globals.css';

export const metadata = {
  title: "Netdoi Technology",
  description: "netdoi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <link rel="icon" href="/logo.png?v=1" /> {/* เพิ่ม ?v=1 เพื่อล้างแคช */}
      </Head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
