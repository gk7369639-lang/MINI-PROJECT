import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SQRP - Student Query Resolution Platform",
  description: "AI-Powered University Query Resolution & Automated Academic Routing Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-primary-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
