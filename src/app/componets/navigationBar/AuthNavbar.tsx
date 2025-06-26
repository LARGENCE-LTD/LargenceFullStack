"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "../Button";
import { Modal } from "../Modal";
import LoginForm from "../authForm/LoginForm";
import SignupForm from "../authForm/SignupForm";

// Interface for AuthNavbar props
interface AuthNavbarProps {}

// AuthNavbar component
export default function AuthNavbar({}: AuthNavbarProps) {
  // State to control modal visibility (login, signup, or none)
  const [modal, setModal] = useState<"login" | "signup" | null>(null);

  return (
    <>
      <header className="w-full py-4 px-6 md:pl-20 md:pr-12 flex items-center justify-between">
        <Link href="/" className="logo-container">
          <Image
            src="/logo.png"
            alt="Logo"
            width={49}
            height={59}
            className="logo"
          />
        </Link>

        <div className="flex items-center space-x-8 md:space-x-16">
          <Link
            href="#"
            className="hidden md:block font-medium text-lg md:text-xl hover:text-red-600 transition-colors"
          >
            WATCH DEMO
          </Link>

          <Link
            href="#"
            className="hidden md:block font-medium text-lg md:text-xl hover:text-red-600 transition-colors"
          >
            PRICING
          </Link>

          <Button
            onClick={() => setModal("login")}
            className="bg-black text-white font-medium text-lg md:text-xl px-4 md:px-6 py-2 md:py-3 rounded-lg flex items-center hover:bg-gray-800 transition-colors"
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

      {/* Modal for Login */}
      <Modal
        open={modal === "login"}
        onClose={() => setModal(null)}
        className="flex items-center justify-center"
        backdropClassName="bg-black/50 backdrop-blur-sm"
      >
        <div className="max-w-md w-full">
          <LoginForm onSwitch={() => setModal("signup")} />
        </div>
      </Modal>

      {/* Modal for Signup */}
      <Modal
        open={modal === "signup"}
        onClose={() => setModal(null)}
        className="flex items-center justify-center"
        backdropClassName="bg-black/50 backdrop-blur-sm"
      >
        <div className="max-w-md w-full">
          <SignupForm onSwitch={() => setModal("login")} />
        </div>
      </Modal>
    </>
  );
}
