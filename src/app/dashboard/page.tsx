"use client";

import { useEffect, useState } from "react";
import { useDocumentQuery } from "@/lib/documentQueryContext";
import { useRouter } from "next/navigation";
import { Loading } from "../componets/Loading";

export default function DashboardPage() {
  const { documentQuery, isQueryStored, clearDocumentQuery } =
    useDocumentQuery();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="large" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Welcome to Your Dashboard
          </h1>

          {isQueryStored && documentQuery && (
            <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <h2 className="text-xl font-semibold text-green-800 mb-3">
                Continue with Your Document
              </h2>
              <p className="text-green-700 mb-4">
                We saved your document request. You can continue where you left
                off:
              </p>
              <div className="bg-white p-4 rounded border border-green-300">
                <p className="text-gray-800 italic">"{documentQuery}"</p>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => {
                    // TODO: Implement document generation
                    console.log("Generate document with query:", documentQuery);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Generate Document
                </button>
                <button
                  onClick={() => {
                    clearDocumentQuery();
                    router.push("/landing");
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Start New Request
                </button>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/landing")}
                  className="w-full text-left p-3 bg-white rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <div className="font-medium text-blue-900">
                    Create New Document
                  </div>
                  <div className="text-sm text-blue-600">
                    Generate a new legal document
                  </div>
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement document history
                    console.log("View document history");
                  }}
                  className="w-full text-left p-3 bg-white rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <div className="font-medium text-blue-900">
                    Document History
                  </div>
                  <div className="text-sm text-blue-600">
                    View your previous documents
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-3">
                Account Settings
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    // TODO: Implement profile settings
                    console.log("Open profile settings");
                  }}
                  className="w-full text-left p-3 bg-white rounded border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  <div className="font-medium text-purple-900">
                    Profile Settings
                  </div>
                  <div className="text-sm text-purple-600">
                    Update your account information
                  </div>
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("auth_token");
                    router.push("/landing");
                  }}
                  className="w-full text-left p-3 bg-white rounded border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  <div className="font-medium text-purple-900">Sign Out</div>
                  <div className="text-sm text-purple-600">
                    Log out of your account
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
