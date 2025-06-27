// pages/index.tsx (Next.js Pages Router)
import AppShell from "@/app/mainHome/components/layout/AppShell";
import { DocumentProvider } from "@/contexts/document/context";

export default function Home() {
  return (
    <DocumentProvider>
      <AppShell />
    </DocumentProvider>
  );
}
