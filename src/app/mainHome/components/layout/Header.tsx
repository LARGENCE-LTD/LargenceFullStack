"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Notebook, User, Settings, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Modal } from "@/app/componets/Modal";
import DashboardPage from "@/app/dashboard/page";

interface HeaderProps {
  onOpenHistory: () => void;
}

export default function Header({ onOpenHistory }: HeaderProps) {
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState(false);
  const [modal, setModal] = useState<true | false>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(false);
      }
    }
    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openDropdown]);

  // Sign out logic placeholder
  const handleSignOut = () => {
    // Sign out logic here (clear token, call API, etc)
    router.push("/login");
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-30 flex items-start justify-between pointer-events-none px-4 pt-3 h-16">
        {/* Logo at left */}
        <div className="flex items-center pointer-events-auto">
          <button
            onClick={() => router.push("/")}
            className="flex items-center focus:outline-none"
            aria-label="Go to home"
          >
            <Image
              src="/logo.png"
              alt="Largence Logo"
              width={44}
              height={48}
              className="rounded-lg"
              priority
            />
          </button>
        </div>

        {/* Right: history & avatar */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          {/* History Button */}
          <button
            className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
            onClick={onOpenHistory}
            aria-label="Open history sidebar"
          >
            <Notebook size={20} />
            <span className="sr-only">History</span>
          </button>

          {/* User Avatar Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 hover:ring-2 hover:ring-blue-400 transition-all"
              onClick={() => setOpenDropdown((v) => !v)}
              aria-label="User menu"
            >
              <Image
                src="/diverse-group.png"
                alt="User Avatar"
                width={40}
                height={40}
                className="object-cover"
              />
            </button>

            {/* Dropdown */}
            {openDropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-xl border border-gray-100 py-2 z-50 animate-fade-in">
                <button
                  className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setOpenDropdown(false);
                    setModal(true);
                  }}
                >
                  <User size={18} className="mr-2" />
                  Dashboard
                </button>
                <button
                  className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setOpenDropdown(false);
                    router.push("/settings");
                  }}
                >
                  <Settings size={18} className="mr-2" />
                  Settings
                </button>
                <button
                  className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                  onClick={handleSignOut}
                >
                  <LogOut size={18} className="mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal for Dashboard */}
      <Modal
        open={modal === true}
        onClose={() => {
          setModal(false);
        }}
        contentClassName="h-[650px] w-[950px] max-w-full max-h-[95vh] p-0"
        content_bg="bg-gray-50"
      >
        <DashboardPage />
      </Modal>
    </>
  );
}
