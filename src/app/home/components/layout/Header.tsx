"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Files, User, Settings, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { Modal } from "@/app/components/Modal";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/Avatar";
import DashboardPage from "@/app/dashboard/page";
import { useUser } from "@/contexts/user/context";

interface HeaderProps {
  onOpenHistory: () => void;
  onCloseHistory: () => void;
  isHistoryOpen: boolean;
}

export default function Header({
  onOpenHistory,
  onCloseHistory,
  isHistoryOpen,
}: HeaderProps) {
  const router = useRouter();
  const { state, actions } = useUser();
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

  // Sign out logic using user context
  const handleSignOut = async () => {
    try {
      await actions.logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback redirect
      router.push("/");
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (state.profile?.firstName && state.profile?.lastName) {
      return `${state.profile.firstName[0]}${state.profile.lastName[0]}`.toUpperCase();
    }
    if (state.profile?.firstName) {
      return state.profile.firstName[0].toUpperCase();
    }
    return "U";
  };

  // Handle history button click - toggle sidebar
  const handleHistoryClick = () => {
    if (isHistoryOpen) {
      onCloseHistory();
    } else {
      onOpenHistory();
    }
  };

  return (
    <>
      <header className="w-full py-4 px-6 md:pl-12 md:pr-12 flex items-center justify-between">
        {/* Logo at left */}
        <div className="flex items-center pointer-events-auto">
          <button
            className="flex items-center focus:outline-none"
            aria-label="Go to home"
          >
            <Image
              src="/logo.png"
              alt="Largence Logo"
              width={49}
              height={59}
              className="rounded-lg"
              priority
            />
          </button>
        </div>

        {/* Right: history & avatar */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          {/* History Button */}
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-gray-700 cursor-pointer ${
              isHistoryOpen
                ? "bg-gray-300 hover:bg-gray-200"
                : "hover:bg-gray-300"
            }`}
            onClick={handleHistoryClick}
            aria-label={
              isHistoryOpen ? "Close history sidebar" : "Open history sidebar"
            }
          >
            <Files size={20} />
            <span className="text-sm font-semibold">Documents</span>
          </button>

          {/* User Avatar Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer"
              onClick={() => setOpenDropdown((v) => !v)}
              aria-label="User menu"
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src="/diverse-group.png" alt="User Avatar" />
                <AvatarFallback className="bg-blue-600 text-white">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </button>

            {/* Dropdown */}
            {openDropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-xl border border-gray-100 py-2 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {state.profile?.firstName} {state.profile?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {state.profile?.email}
                  </p>
                </div>
                <button
                  className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setOpenDropdown(false);
                    setModal(true);
                  }}
                >
                  <User size={18} className="mr-2" />
                  Dashboard
                </button>
                <button
                  className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setOpenDropdown(false);
                    router.push("/settings");
                  }}
                >
                  <Settings size={18} className="mr-2" />
                  Settings
                </button>
                <button
                  className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
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
