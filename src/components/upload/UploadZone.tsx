import React from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface UploadZoneProps {
  isLoading: boolean;
  onClick: () => void;
}

const UploadZone = ({ isLoading, onClick }: UploadZoneProps) => {
  return (
    <div className="p-4 sm:p-8 text-center">
      <Upload className="w-10 h-10 text-medical-blue mx-auto mb-4" />
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          Drag and drop your medical files here, or
        </p>
        <Button
          type="button"
          disabled={isLoading}
          onClick={onClick}
          className="bg-medical-blue hover:bg-medical-blue/90"
        >
          Choose File
        </Button>
      </div>
    </div>
  );
};

export default UploadZone;