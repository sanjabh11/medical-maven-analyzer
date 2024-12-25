import React from "react";
import ConfigurationSidebar from "@/components/ConfigurationSidebar";
import ImageUploader from "@/components/ImageUploader";
import AnalysisResults from "@/components/AnalysisResults";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [apiKey, setApiKey] = React.useState<string | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [results, setResults] = React.useState<string | null>(null);

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    toast({
      title: "Success",
      description: "API Key saved successfully!",
      duration: 3000,
    });
  };

  const handleApiKeyReset = () => {
    setApiKey(null);
    toast({
      title: "Reset",
      description: "API Key has been reset.",
      duration: 3000,
    });
  };

  const handleImageUpload = (file: File) => {
    setSelectedImage(file);
    // In a real implementation, you would process the image here
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResults(`
        <h3>1. Image Type & Region</h3>
        <ul>
          <li>Imaging modality: X-ray</li>
          <li>Anatomical region: Chest, PA view</li>
          <li>Image quality: Optimal for diagnosis</li>
        </ul>
        
        <h3>2. Key Findings</h3>
        <ul>
          <li>Clear lung fields</li>
          <li>Normal cardiac silhouette</li>
          <li>No active disease process identified</li>
        </ul>
        
        <h3>3. Diagnostic Assessment</h3>
        <p>Normal chest radiograph with no acute cardiopulmonary process.</p>
        
        <h3>4. Patient-Friendly Explanation</h3>
        <p>Your chest X-ray shows healthy lungs and a normal heart size. There are no concerning findings that require immediate attention.</p>
      `);
      toast({
        title: "Analysis Complete",
        description: "Your medical image has been analyzed successfully.",
        duration: 5000,
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <ConfigurationSidebar
              apiKey={apiKey}
              onApiKeySubmit={handleApiKeySubmit}
              onReset={handleApiKeyReset}
            />
          </div>

          <div className="md:col-span-2 space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-medical-blue mb-4">
                🏥 Medical Imaging Diagnosis Agent
              </h1>
              <p className="text-gray-600">
                Upload a medical image for professional AI-powered analysis
              </p>
            </div>

            <ImageUploader
              onImageUpload={handleImageUpload}
              isLoading={analyzing}
            />

            <AnalysisResults loading={analyzing} results={results} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;