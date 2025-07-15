"use client";

import { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Workspace from "../workflow/Workspace";
import Sidebar from "../history/Sidebar";
import ConnectionStatus from "@/app/components/ConnectionStatus";
import NotificationContainer from "@/app/components/NotificationContainer";
import { useDocument } from "@/contexts/document/context";

export default function AppShell() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const { actions } = useDocument();

  // Pass open/close handlers as props to header/sidebar
  const handleOpenHistory = () => setHistoryOpen(true);
  const handleCloseHistory = () => setHistoryOpen(false);

  // Handle document selection from history
  const handleSelectDocument = (documentId: string) => {
    actions.loadDocumentFromHistory(documentId);
    handleCloseHistory(); // Close sidebar when document is selected
  };

  return (
    <div className="min-h-screen min-w-screen flex flex-col relative">
      {/* Connection Status Indicator */}
      <ConnectionStatus />

      {/* Notification Container */}
      <NotificationContainer />

      {/* Header stays at the very top, overlayed */}
      <Header
        onOpenHistory={handleOpenHistory}
        onCloseHistory={handleCloseHistory}
        isHistoryOpen={historyOpen}
      />

      {/* Main document workspace area */}
      <main>
        <Workspace onOpenHistory={handleOpenHistory} />
      </main>

      {/* Tiny, unobtrusive footer */}
      <Footer />

      {/* Slide-out history sidebar (overlays workspace, positioned on left) */}
      <Sidebar
        isOpen={historyOpen}
        onSelectDocument={handleSelectDocument}
        onClose={handleCloseHistory}
      />
    </div>
  );
}
