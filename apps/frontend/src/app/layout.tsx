import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Next App",
  description: "Next.js + Clerk demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
        >
          {/* Navbar */}
          <header
            className="fixed top-0 left-0 w-full flex items-center justify-between px-6 py-4 
  border-b border-white/10 backdrop-blur-md bg-transparent z-50"
          >
            {/* Left: Logo */}
            <Link href="/" className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
              </svg>

              <span className="font-semibold text-lg">DrawFlow</span>
            </Link>

            {/* Center: Nav Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/" className="hover:text-gray-300 transition">
                Home
              </Link>
              <Link href="/docs" className="hover:text-gray-300 transition">
                Docs
              </Link>
              <Link href="/about" className="hover:text-gray-300 transition">
                About
              </Link>
            </nav>

            {/* Right: Auth */}
            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="rounded-full bg-white px-6 py-2 font-medium text-black shadow hover:bg-gray-200 transition">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded-full border border-white/30 px-6 py-2 font-medium text-white hover:bg-white/10 transition">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </header>

          {/* Page content */}
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
