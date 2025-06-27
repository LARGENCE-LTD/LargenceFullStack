"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { InputField } from "../InputField";
import { Loading } from "../Loading";
import { Button } from "../Button";

// Define interfaces for type safety
interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email: string;
  password: string;
  general?: string; // For server-side or general errors
}

export default function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();

  // State management with explicit types
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    password: "",
    general: "",
  });
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form fields
  const validateForm = (): boolean => {
    let valid = true;
    const newErrors: FormErrors = { email: "", password: "", general: "" };

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/users/login", formData);

      // Store token in localStorage (consider HttpOnly cookies for better security)
      localStorage.setItem("auth_token", response.data.token);

      // Redirect to application main page
      router.push("/mainHome");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      setErrors((prev) => ({
        ...prev,
        general: errorMessage,
      }));
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Loading
          size="large"
          text="Signing you in..."
          className="min-h-[400px]"
        />
      </div>
    );
  }

  // Render login form
  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">
          Sign in to Largence
        </h1>
        <p className="text-base md:text-l text-gray-600 mb-4 text-center">
          Smarter legal solutions, instantly.
        </p>

        {errors.general && (
          <p className="text-red-500 text-sm mb-1 text-center">
            {errors.general}
          </p>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <InputField
              label="Email address"
              id="email"
              name="email"
              type="email"
              classNameLabel="form-label"
              classNameInput="form-input"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              disabled={loading}
              placeholder="janedoe@gmail.com"
            />
            <InputField
              label="Password"
              id="password"
              name="password"
              type="password"
              classNameLabel="form-label"
              classNameInput="form-input"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              disabled={loading}
              placeholder="*********"
            />
          </div>

          <div>
            <Button type="submit" disabled={loading} className="primary-button">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600 text-center">
            Don’t have an account?{" "}
            <Button
              type="button"
              className="font-medium text-red-600 hover:text-red-700 cursor-pointer"
              onClick={onSwitch}
            >
              Sign up
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
