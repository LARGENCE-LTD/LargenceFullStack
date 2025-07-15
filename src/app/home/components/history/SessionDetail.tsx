"use client";

import { Button } from "@/app/components/Button";
import { ArrowLeftToLine, SquarePen } from "lucide-react";

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
      <Button
        className="mb-3 text-sm text-gray-800 cursor-pointer"
        onClick={onBack}
      >
        <ArrowLeftToLine size={20} />
      </Button>
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
          Document
        </div>
        {onOpenInWorkspace && (
          <Button
            className="mt-2 text-gray-800 cursor-pointer"
            onClick={() => onOpenInWorkspace(session.id)}
          >
            <SquarePen size={20} />
          </Button>
        )}
      </div>
    </div>
  );
}
