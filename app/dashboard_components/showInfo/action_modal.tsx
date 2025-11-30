"use client";

import { X, Eye, Trash2 } from "lucide-react";

interface ActionModalProps {
  onClose: () => void;
  onShowInfo: () => void;
  onDelete?: () => void;
  userRoles?: string[];
}

export function ActionModal({ onClose, onShowInfo, onDelete }: ActionModalProps) {
  return (
    <div className="relative bg-background text-foreground rounded-lg shadow-xl w-52 p-4 border border-gray-200">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-muted-foreground hover:text-red-600 transition-colors"
        aria-label="Close action modal"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="space-y-2 mt-4">
        <button
          onClick={onShowInfo}
          className="w-full flex items-center gap-3 px-4 py-2 border border-blue-400 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
        >
          <Eye className="h-4 w-4" />
          Show Info
        </button>

        {/* Delete button hiển thị nếu có onDelete */}
        {onDelete && (
          <button
            onClick={onDelete}
            className="w-full flex items-center gap-3 px-4 py-2 border border-red-400 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
