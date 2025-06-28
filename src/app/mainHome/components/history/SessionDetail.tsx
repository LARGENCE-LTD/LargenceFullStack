"use client";

type Field = {
  field: string;
  explanation: string;
  example: string;
};

type SessionDetailData = {
  id: string;
  title: string;
  createdAt: string;
  prompt: string;
  missingFields: Field[];
  answers: { [field: string]: string };
  content: string;
};

interface SessionDetailProps {
  session: SessionDetailData;
  onBack: () => void;
  onOpenInWorkspace?: (id: string) => void;
}

export default function SessionDetail({
  session,
  onBack,
  onOpenInWorkspace,
}: SessionDetailProps) {
  return (
    <div className="p-4">
      <button
        className="mb-3 text-sm text-blue-500 hover:underline"
        onClick={onBack}
      >
        ← Back to list
      </button>
      <div className="mb-2">
        <div className="text-base font-semibold text-gray-800">
          {session.title}
        </div>
        <div className="text-xs text-gray-500 mb-1">
          {new Date(session.createdAt).toLocaleString()}
        </div>
      </div>
      {session.prompt && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Prompt
          </div>
          <div className="bg-gray-50 rounded px-2 py-1 text-sm">
            {session.prompt}
          </div>
        </div>
      )}
      {session.missingFields.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Missing Fields
          </div>
          <ul className="space-y-2">
            {session.missingFields.map((field) => (
              <li key={field.field} className="bg-gray-50 rounded p-2">
                <div className="font-medium text-gray-700">{field.field}</div>
                <div className="text-xs text-gray-500 mb-1">
                  {field.explanation}
                </div>
                <div className="text-xs text-gray-400 italic mb-1">
                  e.g. {field.example}
                </div>
                <div className="text-xs text-green-700">
                  Answer:{" "}
                  <span className="font-semibold">
                    {session.answers[field.field]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Generated Document
        </div>
        <pre className="bg-gray-50 rounded p-2 text-sm text-gray-800 overflow-x-auto max-h-36">
          {session.content.slice(0, 600)}
          {session.content.length > 600 ? " ..." : ""}
        </pre>
        {onOpenInWorkspace && (
          <button
            className="mt-2 text-blue-500 hover:underline text-xs"
            onClick={() => onOpenInWorkspace(session.id)}
          >
            Open in workspace
          </button>
        )}
      </div>
    </div>
  );
}
