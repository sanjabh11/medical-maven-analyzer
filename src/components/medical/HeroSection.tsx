import { Button } from "@/components/ui/button";
import { FileImage, Droplet } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="py-12 bg-gradient-to-b from-medical-light to-white">
      <div className="container mx-auto text-center px-4">
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-medical-blue mb-6 tracking-tight">
            Medical Diagnosis and Recommendations
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Upload medical images or blood sample reports for professional AI-powered diagnostics, 
            analysis and recommendations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-medical-blue hover:bg-medical-blue/90 transform transition-all duration-200 hover:scale-105"
            >
              <FileImage className="mr-2 h-5 w-5" />
              Upload Medical Image
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-medical-blue text-medical-blue hover:bg-medical-blue hover:text-white transform transition-all duration-200 hover:scale-105"
            >
              <Droplet className="mr-2 h-5 w-5" />
              Upload Blood Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;