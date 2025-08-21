"use client";
import "@/app/globals.css";
import "@/app/reset.css";
import { Poppins } from "next/font/google";
import Header from "@/app/components/Header/header";
import { usePathname } from "next/navigation";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-tiptap/styles.css";
import "./globals.css";

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
