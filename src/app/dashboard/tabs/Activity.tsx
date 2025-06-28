import { Activity } from "lucide-react";

export default function ActivityTab({ activities }: { activities: any[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 h-[530px] flex flex-col">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex-shrink-0">
        Recent Activity
      </h2>
      {activities.length === 0 ? (
        <div className="text-center py-8 flex-1 flex items-center justify-center">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No recent activity.</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
          {activities.slice(0, 50).map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium">{activity.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  activity.type === "login"
                    ? "bg-green-100 text-green-800"
                    : activity.type === "document_created"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {activity.type.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
