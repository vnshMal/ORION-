import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ORION - Intrusion Detection System & SOC",
  description: "Next-Generation Intelligent Intrusion Detection System & Security Operations Center",
};

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ParticlesBackground } from "@/components/ParticlesBackground";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="h-screen flex flex-col bg-slate-950 text-slate-50 overflow-hidden relative">
        <ParticlesBackground />
        
        {/* Top Navbar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative z-10 bg-slate-950/60 backdrop-blur-sm flex flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent -z-10 pointer-events-none"></div>
          
          {/* Page content wrapper */}
          <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </div>

          {/* Page Footer */}
          <Footer />
        </main>
      </body>
    </html>
  );
}

