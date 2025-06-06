import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import I18nProvider from "@/components/I18nProvider";
import "./globals.css";
import { AuthProvider } from "@/utils/AuthContext";
import AuthProfileHandler from "@/components/AuthProfileHandler";
import { generateAppMetadata } from "@/utils/metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = generateAppMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <I18nProvider>
          <AuthProvider>
            <Header />
            <main className="flex-grow pt-20">
              {children}
            </main>
            <Footer />
            <AuthProfileHandler />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
