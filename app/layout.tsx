import type { Metadata } from "next";
import { Manrope, Vazirmatn } from "next/font/google";
import "./globals.css";
import type { ReactNode } from "react";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn"
});

export const metadata: Metadata = {
  title: "Hessam Health OS",
  description: "Private health and fitness operating system for daily performance tracking."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${vazirmatn.variable}`}>
      <body>{children}</body>
    </html>
  );
}
