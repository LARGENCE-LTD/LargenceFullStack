"use client";

import Image from "next/image";
import Link from "next/link";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Button } from "../components/Button";
import { Modal } from "../components/Modal";

import SignupForm from "../components/authForm/SignupForm";
import LoginForm from "../components/authForm/LoginForm";

import { useDocumentQuery } from "@/contexts/promptContext";

// Main LandingPage component
export default function LandingPage({
  initialModal,
}: {
  initialModal?: "login" | "signup";
}) {
  const router = useRouter();
  const { storeDocumentQuery } = useDocumentQuery();

  // State for modal and user input
  const [modal, setModal] = useState<"login" | "signup" | null>(
    initialModal || null
  );
  const [userInput, setUserInput] = useState<string>(initialModal ? "" : "");

  // Handle input submission for document query
  const handleInputSubmit = () => {
    if (userInput.trim()) {
      storeDocumentQuery(userInput.trim());
      setModal("login");
    }
  };

  return (
    <>
      <header className="w-full py-4 px-6 md:pl-12 md:pr-12 flex items-center justify-between">
        <Link href="/" className="logo-container cursor-pointer">
          <Image
            src="/logo.png"
            alt="Logo"
            width={49}
            height={59}
            className="logo"
            onClick={() => router.push("/")}
          />
        </Link>

        <div className="flex items-center space-x-8 md:space-x-16">
          <Link
            href="#"
            className="hidden md:block font-medium text-lg md:text-xl hover:text-red-600 transition-colors cursor-pointer"
          >
            WATCH DEMO
          </Link>

          <Link
            href="#"
            className="hidden md:block font-medium text-lg md:text-xl hover:text-red-600 transition-colors cursor-pointer"
          >
            PRICING
          </Link>

          <Button
            onClick={() => setModal("login")}
            className="bg-black text-white font-medium text-lg md:text-xl px-4 md:px-6 py-2 md:py-3 rounded-lg flex items-center hover:bg-gray-800 transition-colors cursor-pointer"
          >
            SIGN IN
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="ml-2"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </div>
      </header>
      <div className="relative flex flex-col items-center justify-center px-4 py-12">
        {/* Main content */}
        <div
          className={`w-full max-w-2xl mx-auto text-center transition-all duration-300 ${
            modal ? "blur-sm" : ""
          }`}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Get Legal Documents
            <br />
            Instantly
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
            Describe your needs or the scenario for your agreement
            <br />
            in a few words or sentences.
          </p>
          <p className="text-sm md:text-base text-gray-500 mb-2">
            AI-powered legal documents, tailored for your business and personal
            needs in minutes.
          </p>

          <div className="relative w-full max-w-xl mx-auto mt-10 mb-60">
            <textarea
              className="w-full h-60 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg placeholder-gray-400 shadow-sm"
              placeholder="I need a contract for a new client project..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <Button
              aria-label="Submit legal request"
              onClick={handleInputSubmit}
              disabled={!userInput.trim()}
              className={`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                userInput.trim()
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-lg"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <ArrowRight className="h-6 w-6" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Your input is private and encrypted. Only you can access your
            documents.
          </p>

          <div className="mt-8 flex items-center justify-center gap-1">
            <p className="text-sm text-gray-600 mb-0">
              Already have an account?
            </p>
            <Button
              className="text-red-600 hover:text-red-700 font-medium text-sm px-1 py-0 h-auto cursor-pointer"
              onClick={() => setModal("login")}
            >
              Sign in
            </Button>
          </div>
        </div>

        {/* Modal for Login */}
        <Modal
          open={modal === "login"}
          onClose={() => {
            setModal(null);
          }}
        >
          <LoginForm onSwitch={() => setModal("signup")} />
        </Modal>

        {/* Modal for Signup */}
        <Modal
          open={modal === "signup"}
          onClose={() => {
            setModal(null);
          }}
        >
          <SignupForm onSwitch={() => setModal("login")} />
        </Modal>
      </div>
    </>
  );
}
