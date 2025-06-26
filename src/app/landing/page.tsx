"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Button } from "../componets/Button";
import { Modal } from "../componets/Modal";
import SignupForm from "../componets/authForm/SignupForm";
import LoginForm from "../componets/authForm/LoginForm";
import { useDocumentQuery } from "@/lib/documentQueryContext";

// Interface for component props
interface LandingPageProps {
  initialModal?: "login" | "signup" | null;
}

// Main LandingPage component
export default function LandingPage({ initialModal = null }: LandingPageProps) {
  const router = useRouter();
  const { storeDocumentQuery } = useDocumentQuery();

  // State for modal and user input
  const [modal, setModal] = useState<"login" | "signup" | null>(initialModal);
  const [userInput, setUserInput] = useState<string>("");

  // Handle input submission for document query
  const handleInputSubmit = () => {
    if (userInput.trim()) {
      storeDocumentQuery(userInput.trim());
      setModal("login");
    }
  };

  return (
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
        <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
          Describe your needs or the scenario for your agreement
          <br />
          in a few words or sentences.
        </p>
        <p className="text-sm md:text-base text-gray-400 mb-2">
          AI-powered legal documents, tailored for your business and personal
          needs in minutes.
        </p>

        <div className="relative w-full max-w-xl mx-auto">
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
        <p className="text-xs text-gray-400 mt-2">
          Your input is private and encrypted. Only you can access your
          documents.
        </p>

        <p className="text-sm text-gray-500 mt-10">
          Every question is important. Review documents carefully.
        </p>

        <div className="mt-8 flex items-center justify-center gap-1">
          <p className="text-sm text-gray-600 mb-0">Already have an account?</p>
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
          if (initialModal) router.push("/");
        }}
        className="flex items-center justify-center"
        backdropClassName="bg-black/10 backdrop-blur-[2px]"
      >
        <div className="max-w-md w-full">
          <LoginForm onSwitch={() => setModal("signup")} />
        </div>
      </Modal>

      {/* Modal for Signup */}
      <Modal
        open={modal === "signup"}
        onClose={() => {
          setModal(null);
          if (initialModal) router.push("/");
        }}
        className="flex items-center justify-center"
        backdropClassName="bg-black/10 backdrop-blur-[2px]"
      >
        <div className="max-w-md w-full">
          <SignupForm onSwitch={() => setModal("login")} />
        </div>
      </Modal>
    </div>
  );
}
