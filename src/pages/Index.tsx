import React from "react";
import ConfigurationSidebar from "@/components/ConfigurationSidebar";
import ImageUploader from "@/components/ImageUploader";
import AnalysisResults from "@/components/AnalysisResults";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [apiKey, setApiKey] = React.useState<string | null>(
    localStorage.getItem("GOOGLE_API_KEY")
  );
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [results, setResults] = React.useState<string | null>(null);

  const handleApiKeySubmit = (key: string) => {
    localStorage.setItem("GOOGLE_API_KEY", key);
    setApiKey(key);
    toast({
      title: "Success",
      description: "API Key saved successfully!",
      duration: 3000,
    });
  };

  const handleApiKeyReset = () => {
    localStorage.removeItem("GOOGLE_API_KEY");
    setApiKey(null);
    toast({
      title: "Reset",
      description: "API Key has been reset.",
      duration: 3000,
    });
  };

  const analyzeImage = async (imageFile: File) => {
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please configure your Google API Key first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert image to base64
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]); // Remove data URL prefix
        };
        reader.readAsDataURL(imageFile);
      });

      // Using the new gemini-1.5-flash model
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Analyze this medical image and provide a detailed report including:
                  1. Image Type & Region
                  2. Key Findings
                  3. Diagnostic Assessment
                  4. Patient-Friendly Explanation
                  Be thorough and specific in your analysis.`
              }, {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const analysis = data.candidates[0].content.parts[0].text;
      
      setResults(analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze image",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setSelectedImage(file);
    setAnalyzing(true);
    await analyzeImage(file);
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