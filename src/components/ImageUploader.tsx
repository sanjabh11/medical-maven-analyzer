import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  isLoading?: boolean;
}

const ImageUploader = ({ onImageUpload, isLoading }: ImageUploaderProps) => {
  const [dragActive, setDragActive] = React.useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

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
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onImageUpload(file);
  };

  React.useEffect(() => {
    // Cleanup preview URL when component unmounts
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <Card
      className={`w-full max-w-2xl mx-auto ${
        dragActive ? "border-medical-blue" : ""
      }`}
    >
      <CardContent className="p-8">
        <div
          className="relative flex flex-col items-center justify-center space-y-4 border-2 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {previewUrl ? (
            <div className="w-full p-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-[400px] mx-auto object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="p-8 text-center">
              <Upload className="w-10 h-10 text-medical-blue mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Drag and drop your medical image here, or
                </p>
                <Button
                  type="button"
                  disabled={isLoading}
                  onClick={() => inputRef.current?.click()}
                  className="bg-medical-blue hover:bg-medical-blue/90"
                >
                  Choose File
                </Button>
              </div>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <p className="text-xs text-center text-gray-500 mt-4">
          Supported formats: JPG, JPEG, PNG, DICOM
        </p>
      </CardContent>
    </Card>
  );
};

export default ImageUploader;