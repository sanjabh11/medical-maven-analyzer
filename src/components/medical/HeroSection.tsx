import { Button } from "@/components/ui/button";
import { FileImage, Droplet } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="py-12 bg-medical-light">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-medical-blue mb-6">
          Medical Diagnosis and Recommendations
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Upload medical images or blood sample reports for professional AI-powered diagnostics, 
          analysis and recommendations
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-medical-blue hover:bg-medical-blue/90 text-white"
          >
            <FileImage className="mr-2 h-5 w-5" />
            Upload Medical Image
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-medical-blue text-medical-blue hover:bg-medical-blue hover:text-white"
          >
            <Droplet className="mr-2 h-5 w-5" />
            Upload Blood Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;