"use client";

import { Button } from "@/app/componets/Button";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
}

interface Subscription {
  plan: string;
  status: string;
  nextBill: Date;
}

interface DashboardPageProps {
  profile: UserProfile;
  subscription: Subscription;
}

export default function DashboardPage({
  profile,
  subscription,
}: DashboardPageProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header: Logo, App name*/}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Largence Logo"
            className="h-12 w-12 object-contain"
          />
          <h1 className="font-bold text-2xl text-gray-900">Largence</h1>
        </div>
      </div>

      {/* Slogan */}
      <div className="mb-7 text-left">
        <p className="text-gray-600 mt-2">
          Legal documents at your fingertips.
        </p>
      </div>

      {/* Profile & Subscription: two columns */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile */}
        <div className="bg-gray-50 rounded-lg p-4 flex flex-col h-full">
          <div>
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <div className="space-y-3 text-sm">
              <div>
                <label className="font-medium text-gray-600">Name</label>
                <p className="text-gray-900">
                  {profile.firstName} {profile.lastName}
                </p>
              </div>
              <div>
                <label className="font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{profile.email}</p>
              </div>
            </div>
          </div>
          <Button className="mt-auto w-fit bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded transition-colors text-sm cursor-pointer">
            Edit Profile
          </Button>
        </div>

        {/* Subscription */}
        <div className="bg-gray-50 rounded-lg p-4 flex flex-col h-full">
          <div>
            <h2 className="text-xl font-semibold mb-4">Subscription</h2>
            <div className="space-y-3 text-sm">
              <div>
                <label className="font-medium text-gray-600">Plan</label>
                <p className="text-gray-900">{subscription.plan}</p>
              </div>
              <div>
                <label className="font-medium text-gray-600">Status</label>
                <p className="text-gray-900">{subscription.status}</p>
              </div>
              <div>
                <label className="font-medium text-gray-600">Next Bill</label>
                <p className="text-gray-900">
                  {subscription.nextBill.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          <Button
            className="mt-6 w-fit bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors text-sm"
            disabled
          >
            Upgrade Plan
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t pt-3 mt-6 text-center text-xs text-gray-500">
        Largence v1.0.0 | All rights reserved | Need help? Contact{" "}
        <a href="mailto:support@largence.com" className="underline">
          support@largence.com
        </a>
      </div>
    </div>
  );
}
