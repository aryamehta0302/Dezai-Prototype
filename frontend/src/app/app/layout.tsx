import type { Metadata } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${geistMono.variable}`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}