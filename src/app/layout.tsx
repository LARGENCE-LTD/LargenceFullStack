import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DocumentPromptProvider } from "@/contexts/promptContext";
import { UserProvider } from "@/contexts/user/context";
import ConditionalAuthNavbar from "./componets/navigationBar/ConditionAuthNavbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Largence - Document Generation Platform",
  description: "Create and manage your documents with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          <DocumentPromptProvider>
            <ConditionalAuthNavbar>{children}</ConditionalAuthNavbar>
          </DocumentPromptProvider>
        </UserProvider>
      </body>
    </html>
  );
}
