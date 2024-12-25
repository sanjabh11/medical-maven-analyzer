import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  isLoading?: boolean;
}

const ImageUploader = ({ onImageUpload, isLoading }: ImageUploaderProps) => {
  const [dragActive, setDragActive] = React.useState(false);
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
      onImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  return (
    <Card
      className={`w-full max-w-2xl mx-auto ${
        dragActive ? "border-medical-blue" : ""
      }`}
    >
      <CardContent className="p-8">
        <div
          className="relative h-48 flex flex-col items-center justify-center space-y-4 border-2 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-10 h-10 text-medical-blue" />
          <div className="text-center space-y-2">
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