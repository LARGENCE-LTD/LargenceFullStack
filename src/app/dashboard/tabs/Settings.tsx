import { Button } from "@/app/components/Button";
import { Shield, Bell, Globe } from "lucide-react";

export default function SettingsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Account Settings
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">Security</p>
                <p className="text-sm text-gray-500">
                  Password and authentication settings
                </p>
              </div>
            </div>
            <Button className="text-red-600 hover:text-red-700">Manage</Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-gray-500">
                  Email and push notification preferences
                </p>
              </div>
            </div>
            <Button className="text-red-600 hover:text-red-700">Manage</Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">Preferences</p>
                <p className="text-sm text-gray-500">
                  Language, theme, and display settings
                </p>
              </div>
            </div>
            <Button className="text-red-600 hover:text-red-700">Manage</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
