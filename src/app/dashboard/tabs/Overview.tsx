import { Button } from "@/app/componets/Button";
import { FileText, TrendingUp, HardDrive, Calendar } from "lucide-react";

export default function OverviewTab({ profile, subscription, usage }: any) {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {profile?.firstName}!
        </h2>
        <p className="text-gray-600">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Documents
              </p>
              <p className="text-1xl font-bold text-gray-900">
                {usage?.documentsGenerated || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-1xl font-bold text-gray-900">
                {usage?.documentsThisMonth || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <HardDrive className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Storage Used</p>
              <p className="text-1xl font-bold text-gray-900">
                {usage?.storageUsed || 0}MB / {usage?.storageLimit || 100}MB
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last Active</p>
              <p className="text-sm font-bold text-gray-900">
                {usage?.lastActive
                  ? new Date(usage.lastActive).toLocaleDateString()
                  : "Never"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile & Subscription */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
            <Button className="text-red-600 hover:text-red-700 text-sm">
              Edit
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Name</span>
              <span className="font-medium">
                {profile?.firstName} {profile?.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email</span>
              <span className="font-medium">{profile?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  profile?.isVerified
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {profile?.isVerified ? "Verified" : "Pending Verification"}
              </span>
            </div>
          </div>
        </div>

        {/* Subscription Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Subscription
            </h3>
            <Button className="text-red-600 hover:text-red-700 text-sm">
              Manage
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Plan</span>
              <span className="font-medium">
                {subscription?.plan?.name || "Free Plan"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  subscription?.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {subscription?.status || "Inactive"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Next Bill</span>
              <span className="font-medium">
                {subscription?.nextBillingDate
                  ? new Date(subscription.nextBillingDate).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
