"use client";

import Link from "next/link";
import { useState } from "react";
import axios from "axios";

import { Button } from "../Button";
import { InputField } from "../InputField";
import { Loading } from "../Loading";

// Interfaces for form data and errors
interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface FormErrors {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Custom hook for managing signup form
export function useRegisterForm(
  initial: RegisterFormData = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  }
) {
  const [formData, setFormData] = useState<RegisterFormData>(initial);
  const [errors, setErrors] = useState<FormErrors>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors: FormErrors = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    };
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
      valid = false;
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      valid = false;
    }
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
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  return {
    formData,
    errors,
    setErrors,
    handleChange,
    validateForm,
  };
}

// Props interface for SignupForm component
interface SignupFormProps {
  onSwitch: () => void;
}

// SignupForm component
export default function SignupForm({ onSwitch }: SignupFormProps) {
  // Form state and handlers from custom hook
  const { formData, errors, handleChange, validateForm } = useRegisterForm();

  // Component state
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setGeneralError(null);
      await axios.post("/api/users/signup", formData);

      onSwitch(); // Switch to login form
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Signup failed. Please try again.";
      setGeneralError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <Loading
          size="large"
          text="Creating your account..."
          className="min-h-[400px]"
        />
      </div>
    );
  }

  // Render signup form
  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">
          Unlock Smarter Legal <br />
          Solutions
        </h1>
        <p className="text-base md:text-l text-gray-600 mb-4 text-center">
          Join and draft your next agreement <br />
          in minutes with AI.
        </p>
        {generalError && (
          <p className="text-red-500 text-sm mb-4">{generalError}</p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="w-full md:w-1/2">
              <InputField
                label="First name"
                id="firstName"
                name="firstName"
                type="text"
                classNameLabel="form-label"
                classNameInput="form-input"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                disabled={loading}
                placeholder="Jane"
              />
            </div>
            <div className="w-full md:w-1/2">
              <InputField
                label="Last name"
                id="lastName"
                name="lastName"
                type="text"
                classNameLabel="form-label"
                classNameInput="form-input"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                disabled={loading}
                placeholder="Doe"
              />
            </div>
          </div>
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
          <p className="terms-text">
            By creating an account, you agree to the Terms and Privacy Policy
          </p>
          <Button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Continue"}
          </Button>
        </form>
        <p className="text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <Button
            type="button"
            className="text-red-600 hover:text-red-700 cursor-pointer"
            onClick={onSwitch}
          >
            Sign in
          </Button>
        </p>
      </div>
    </div>
  );
}
