import type { Metadata } from "next";
import { Inter, Syncopate } from "next/font/google";
import "./globals.css";
import { SocialAccountsProvider } from "@/context/SocialAccountsContext";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const syncopate = Syncopate({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "TOXIC PREMIUM | Unapologetically Ambitious",
  description: "The ultimate toolkit for the new elite. Master money, mindset, and influence with AI-driven dominance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${syncopate.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-toxic-black text-white">
        <SocialAccountsProvider>
          {children}
        </SocialAccountsProvider>
      </body>
    </html>
  );
}
