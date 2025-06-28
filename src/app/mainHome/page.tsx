// pages/index.tsx (Next.js Pages Router)
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/app/mainHome/components/layout/AppShell";
import { DocumentProvider } from "@/contexts/document/context";
import { useUser } from "@/contexts/user/context";
import { Loading } from "@/app/componets/Loading";

export default function Home() {
  const router = useRouter();
  const { state } = useUser();

  // // Check authentication on mount
  // useEffect(() => {
  //   if (!state.isAuthenticated && !state.loading) {
  //     router.push("/login");
  //   }
  // }, [state.isAuthenticated, state.loading, router]);

  // Show loading while checking authentication
  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="large" text="Loading..." />
      </div>
    );
  }

  // // Don't render if not authenticated
  // if (!state.isAuthenticated) {
  //   return null;
  // }

  return (
    <DocumentProvider>
      <AppShell />
    </DocumentProvider>
  );
}
