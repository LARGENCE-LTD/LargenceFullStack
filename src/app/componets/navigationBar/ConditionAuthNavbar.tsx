"use client";

import { usePathname } from "next/navigation";
import AuthNavbar from "./AuthNavbar";

export default function ConditionalAuthNavbar({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Define paths where navbar should be shown
  const showNavbarPages = [
    "/",
    "/landing",
    "/forgot-password",
    "/reset-password",
  ];

  // Check if current page should show navbar
  const shouldShowNavbar = showNavbarPages.includes(pathname);

  if (shouldShowNavbar) {
    return (
      <div className="min-h-screen flex flex-col">
        <AuthNavbar />
        <main className="flex-1">{children}</main>
      </div>
    );
  } else {
    // For dashboard and other authenticated pages
    return <div className="min-h-screen">{children}</div>;
  }
}
