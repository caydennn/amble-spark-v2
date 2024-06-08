import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Taviraj } from "next/font/google";
import { Rubik } from "next/font/google";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "amble spark ✨",
  description: "spark meaningful connections with amble spark",
};

const taviraj = Taviraj({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-taviraj",
  weight: "300",
});
const rubik = Rubik({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-rubik",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className={taviraj.className + " " + rubik.className + " " + "bg-white"} >
        <main className="min-h-screen flex flex-col items-center">
          {children}
        </main>
      </body>
    </html>
  );
}
