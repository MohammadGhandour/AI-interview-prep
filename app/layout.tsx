import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";

import "./globals.css";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MoeJob",
  description: "An AI powered platform for preparing for mock interviews",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${monaSans.variable} antialiased pattern`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
};
