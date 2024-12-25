import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import FilePreview from "./upload/FilePreview";
import UploadZone from "./upload/UploadZone";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  isLoading?: boolean;
  currentImage?: File;
  onReset?: () => void;
}

const ImageUploader = ({ onImageUpload, isLoading = false, currentImage, onReset }: ImageUploaderProps) => {
  const [dragActive, setDragActive] = React.useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (currentImage && currentImage.type.startsWith('image/')) {
      const url = URL.createObjectURL(currentImage);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [currentImage]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
    onImageUpload(file);
  };

  const handleReset = () => {
    setPreviewUrl(null);
    if (onReset) onReset();
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <Card className={cn(
      "w-full max-w-2xl mx-auto transition-colors",
      dragActive ? "border-medical-blue" : "",
      "mt-4 sm:mt-8"
    )}>
      <CardContent className="p-3 sm:p-6">
        <div
          className={cn(
            "relative flex flex-col items-center justify-center space-y-4",
            "border-2 border-dashed rounded-lg",
            "bg-gray-50 hover:bg-gray-100 transition-colors",
            "min-h-[200px] sm:min-h-[300px]"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {currentImage ? (
            <FilePreview
              file={currentImage}
              previewUrl={previewUrl}
              onReset={handleReset}
            />
          ) : (
            <UploadZone
              isLoading={isLoading}
              onClick={() => inputRef.current?.click()}
            />
          )}
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <p className="text-xs text-center text-gray-500 mt-3 sm:mt-4 px-2">
          Supported formats: JPG, JPEG, PNG, DICOM, PDF, DOC, DOCX
        </p>
      </CardContent>
    </Card>
  );
};

export default ImageUploader;