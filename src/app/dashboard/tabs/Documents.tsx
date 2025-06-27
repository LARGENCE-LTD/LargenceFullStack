import { Button } from "@/app/componets/Button";
import { FileText } from "lucide-react";

// Documents Tab Component
export default function DocumentsTab() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Your Documents
      </h2>
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No documents generated yet.</p>
        <Button className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
          Create Your First Document
        </Button>
      </div>
    </div>
  );
}
