import React from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  isLoading: boolean;
  onClick: () => void;
}

const UploadZone = ({ isLoading, onClick }: UploadZoneProps) => {
  return (
    <div className="p-4 sm:p-8 text-center">
      <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-medical-blue mx-auto mb-3 sm:mb-4" />
      <div className="space-y-2">
        <p className="text-sm text-gray-600 px-2">
          Drag and drop your medical files here, or
        </p>
        <Button
          type="button"
          disabled={isLoading}
          onClick={onClick}
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