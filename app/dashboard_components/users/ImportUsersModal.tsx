"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "../../../components/ui/button";
import { useUsers } from "../../../src/contexts/UsersContext";
import { Upload } from "lucide-react";

interface ImportUsersModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ImportUsersModal({ open, onClose }: ImportUsersModalProps) {
  const { importFromFile } = useUsers();
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[][]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
      setPreviewData(json.slice(0, 20)); // preview 20 dòng đầu
    };
    reader.readAsArrayBuffer(selected);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await importFromFile(file);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Import fails");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleCancel = () => {
    setFile(null);
    setPreviewData([]);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 flex items-center justify-center z-50 transition-opacity animate-fadeIn bg-black/40"
    >
      <div className="bg-background rounded-2xl shadow-lg p-6 w-[550px] max-h-[80vh] overflow-y-auto relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          ✕
        </button>
        <h2 className="flex items-center justify-center text-xl font-semibold mb-4">Import Users from File</h2>

        <div className="flex items-center gap-3 mb-4">
          <label className="flex items-center gap-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow cursor-pointer hover:bg-blue-600 transition">
            <Upload size={18} />
            <span>Choose File</span>
            <input
              aria-label="Choose file to import"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {file ? (
            <span className="text-foreground text-sm">{file.name}</span>
          ) : (
            <span className="text-muted-foreground text-sm italic">No file chosen</span>
          )}
        </div>

        {errorMsg && <div className="text-red-500 mb-2">{errorMsg}</div>}

        {previewData.length > 0 && (
          <div className="border rounded-lg overflow-x-auto mb-4">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {previewData[0].map((cell, idx) => (
                    <th
                      key={idx}
                      className="border px-2 py-1 text-sm text-left font-semibold"
                    >
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.slice(1).map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-gray-50">
                    {row.map((cell, colIdx) => (
                      <td key={colIdx} className="border px-2 py-1 text-sm">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button onClick={handleCancel} variant="outline" className="cursor-pointer">
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || loading}
            className="cursor-pointer bg-green-500 hover:bg-green-600 text-white"
          >
            {loading ? "Importing..." : "Confirm Import"}
          </Button>
        </div>
      </div>
    </div>
  );
}
