"use client";

import { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import DocumentWorkspace from "../workflow/DocumentWorkspace";
import Sidebar from "../history/Sidebar";

export default function AppShell() {
  // Sidebar open state (could move to context if global, here is fine for shell)
  const [historyOpen, setHistoryOpen] = useState(false);

  // Pass open/close handlers as props to header/sidebar
  const handleOpenHistory = () => setHistoryOpen(true);
  const handleCloseHistory = () => setHistoryOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 relative">
      {/* Header stays at the very top, overlayed */}
      <Header
        onOpenHistory={handleOpenHistory}
        onCloseHistory={handleCloseHistory}
        isHistoryOpen={historyOpen}
      />

      {/* Main document workspace area - adjusted for left sidebar */}
      <main className="flex-1 flex flex-col items-center justify-center px-2 pb-2">
        <DocumentWorkspace />
      </main>

      {/* Tiny, unobtrusive footer */}
      <Footer />

      {/* Slide-out history sidebar (overlays workspace, positioned on left) */}
      <Sidebar isOpen={historyOpen} onClose={handleCloseHistory} />
    </div>
  );
}
