import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import CommandPalette from '@/components/command-palette/CommandPalette';
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'MoneyJournal',
  description: 'Clean & Functional Minimalism Desktop Financial Journal',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", "font-sans", geist.variable)}>
      <body className={`${inter.variable} antialiased relative`}>
        {children}
        <CommandPalette />
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
