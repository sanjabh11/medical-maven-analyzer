import React from "react";
import { Button } from "@/components/ui/button";
import { FileIcon, ImageIcon } from "lucide-react";

interface FilePreviewProps {
  file: File;
  previewUrl: string | null;
  onReset: () => void;
}

const FilePreview = ({ file, previewUrl, onReset }: FilePreviewProps) => {
  const isImage = file.type.startsWith('image/');

  return (
    <div className="w-full p-4">
      {isImage ? (
        <img
          src={previewUrl}
          alt="Preview"
          className="max-h-[400px] mx-auto object-contain rounded-lg"
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
          <FileIcon className="w-12 h-12 text-medical-blue mb-2" />
          <p className="text-sm font-medium text-gray-900">{file.name}</p>
          <p className="text-xs text-gray-500">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}
      <div className="flex justify-center mt-4">
        <Button
          type="button"
          onClick={onReset}
          variant="outline"
          className="text-medical-blue hover:bg-medical-blue hover:text-white"
        >
          Upload Different File
        </Button>
      </div>
    </div>
  );
};

export default FilePreview;