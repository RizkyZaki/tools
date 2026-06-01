import type { Metadata } from 'next';
import { Work_Sans } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/provider/theme-provider';

const workSans = Work_Sans({
  variable: '--font-work-sans',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: {
    default: 'Zach Tools',
    template: '%s | Zach Tools',
  },
  description:
    'A focused collection of developer tools — free, fast, no sign-up required.',
  metadataBase: new URL('https://tools.zxch.my.id'),
  openGraph: {
    type: 'website',
    siteName: 'Zach Tools',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${workSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="dot-grid min-h-full flex flex-col bg-white dark:bg-black text-slate-900 dark:text-slate-100 antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
