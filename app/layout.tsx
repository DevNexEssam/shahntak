import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import QueryProvider from "@/components/providers/QueryProvider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "شحنتك - منصة إدارة العمليات اللوجستية والشحن",
  description: "منصة سحابية متقدمة لإدارة أساطيل النقل، بوالص الشحن، والفواتير المالية",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>
          <QueryProvider>
            {children}
            <Toaster position="top-center" reverseOrder={false} />
          </QueryProvider>
        </AppProviders>
      </body>
    </html>
  );
}
