"use client";

import { useDocument } from "@/contexts/document/context";
import { SESSION_STATUS } from "@/contexts/document/constants";
import {
  Wifi,
  WifiOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function ConnectionStatus() {
  const { state } = useDocument();

  // Don't show anything if we're idle
  if (state.sessionStatus === SESSION_STATUS.IDLE) {
    return null;
  }

  const getStatusInfo = () => {
    switch (state.sessionStatus) {
      case SESSION_STATUS.STARTING:
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: "Connecting...",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
        };
      case SESSION_STATUS.GENERATING:
        return {
          icon: state.isStreaming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Wifi className="w-4 h-4" />
          ),
          text: state.isStreaming ? "Generating..." : "Processing...",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case SESSION_STATUS.MISSING_INFO:
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: "Need more info",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
        };
      case SESSION_STATUS.COMPLETED:
        return {
          icon: <CheckCircle2 className="w-4 h-4" />,
          text: "Completed",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case SESSION_STATUS.ERROR:
        return {
          icon: <WifiOff className="w-4 h-4" />,
          text: "Connection error",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
      default:
        return {
          icon: <Wifi className="w-4 h-4" />,
          text: "Connected",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor} shadow-sm`}
    >
      <span className={statusInfo.color}>{statusInfo.icon}</span>
      <span className={`text-sm font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    </div>
  );
}
