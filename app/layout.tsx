import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { createClient } from '@/lib/supabase/server'
import { type UserDetails } from '@/lib/types';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Malaine",
  description: "Malaine – your knitting/crochet assistant",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userDetails: UserDetails | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    userDetails = {
      ...user,
      role: profile?.role || 'user'
    };
  }

  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Providers>
          <Header user={userDetails} />
          <main className="container mx-auto px-4 flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
