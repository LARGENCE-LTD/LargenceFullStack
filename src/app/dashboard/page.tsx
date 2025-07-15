"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useUser,
  useUserProfile,
  useUserSubscription,
  useUserUsage,
  useUserActivities,
} from "@/contexts/user/context";
import { Button } from "@/app/components/Button";
import { Loading } from "@/app/components/Loading";

import OverviewTab from "./tabs/Overview";
import DocumentsTab from "./tabs/Documents";
import SettingsTab from "./tabs/Settings";
import ActivityTab from "./tabs/Activity";

import { FileText, Settings, Activity, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { state, actions } = useUser();
  const profile = useUserProfile();
  const subscription = useUserSubscription();
  const usage = useUserUsage();
  const activities = useUserActivities();

  const [activeTab, setActiveTab] = useState<
    "overview" | "documents" | "settings" | "activity"
  >("overview");

  // Redirect if not authenticated
  useEffect(() => {
    if (!state.isAuthenticated && !state.loading) {
      //router.push('/login');
    }
  }, [state.isAuthenticated, state.loading, router]);

  // Handle logout
  const handleLogout = async () => {
    await actions.logout();
    router.push("/");
  };

  // Loading state
  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="large" text="Loading dashboard..." />
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{state.error}</p>
          <Button
            onClick={actions.clearError}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Dismiss Error
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 max-h-[95vh]">
      {/* Navigation Tabs */}
      <nav className="flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-8">
            {[
              { id: "overview", label: "Overview", icon: Activity },
              { id: "documents", label: "Documents", icon: FileText },
              { id: "settings", label: "Settings", icon: Settings },
              { id: "activity", label: "Activity", icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-semibold text-lg cursor-pointer ${
                    activeTab === tab.id
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 h-full">
          {activeTab === "overview" && (
            <OverviewTab
              profile={profile}
              subscription={subscription}
              usage={usage}
            />
          )}
          {activeTab === "documents" && <DocumentsTab />}
          {activeTab === "settings" && <SettingsTab />}
          {activeTab === "activity" && <ActivityTab activities={activities} />}
        </main>
      </div>
    </div>
  );
}

// TODO: configure /dashboard route to pop dashboard if authenticated else redirect to /login
// Instead of setting a fixed w & h centralize and use paddings
