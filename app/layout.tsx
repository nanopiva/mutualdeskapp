"use client";
import "@/app/globals.css";
import "@/app/reset.css";
import { Poppins } from "next/font/google";
import Link from "next/link";
import Header from "@/app/components/Header/header";
import { usePathname } from "next/navigation";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <html lang="en" className={poppins.className} suppressHydrationWarning>
      <body>
        {!pathname.startsWith("/dashboard") && <Header />}

        {children}
      </body>
    </html>
  );
}
