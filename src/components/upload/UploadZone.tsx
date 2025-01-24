import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDropzone } from 'react-dropzone';

interface UploadZoneProps {
  isLoading: boolean;
  onClick: () => void;
}

const UploadZone = ({ isLoading, onClick }: UploadZoneProps) => {
  const [dragActive, setDragActive] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],
      'application/dicom': ['.dcm'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles?.[0]) {
        onClick();
      }
    },
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'p-4 sm:p-8 text-center border-2 border-dashed rounded-lg transition-colors',
        dragActive ? 'border-medical-blue bg-medical-blue/5' : 'border-gray-300',
        'hover:border-medical-blue hover:bg-medical-blue/5'
      )}
    >
      <input {...getInputProps()} />
      <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-medical-blue mx-auto mb-3 sm:mb-4" />
      <div className="space-y-2">
        <p className="text-sm text-gray-600 px-2">
          Drag and drop your medical files here, or click to browse
        </p>
        <p className="text-xs text-gray-500">
          Supports: DICOM (.dcm), PNG, JPG, JPEG, GIF, BMP (up to 10MB)
        </p>
        <Button
          type="button"
          disabled={isLoading}
          className={cn(
            "bg-medical-blue hover:bg-medical-blue/90",
            "text-sm sm:text-base py-2 px-4"
          )}
        >
          Choose File
        </Button>
      </div>
    </div>
  );
};

export default UploadZone;