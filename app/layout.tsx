import type { Metadata } from "next";
import { Roboto, Cinzel } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const cinzel = Cinzel({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cinzel",
});

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Enjoy Farm - Exclusive Sanctuaries",
  description: "Discover our curated portfolio of private Farmhouses, where uncompromising luxury meets absolute tranquility.",
};

import CustomToaster from '@/components/CustomToaster';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar />
          <div className="flex-grow flex flex-col">
            {children}
          </div>
          <Footer />
          <CustomToaster />
        </Providers>
      </body>
    </html>
  );
}