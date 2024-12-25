import React from "react";
import ConfigurationSidebar from "@/components/ConfigurationSidebar";
import ImageUploader from "@/components/ImageUploader";
import AnalysisResults from "@/components/AnalysisResults";
import ChatInterface from "@/components/ChatInterface";
import HeroSection from "@/components/medical/HeroSection";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { MessageSquare, Image, Plus } from "lucide-react";

interface ImageAnalysis {
  file: File;
  results: string | null;
}

const Index = () => {
  const [apiKey, setApiKey] = React.useState<string | null>(
    localStorage.getItem("GOOGLE_API_KEY")
  );
  const [currentPatientImages, setCurrentPatientImages] = React.useState<ImageAnalysis[]>([]);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [showChat, setShowChat] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState<number>(0);

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

  const resetAnalysis = () => {
    setCurrentPatientImages([]);
    setAnalyzing(false);
    setShowChat(false);
    setSelectedImageIndex(0);
  };

  const addAnotherImage = () => {
    setAnalyzing(false);
    setSelectedImageIndex(currentPatientImages.length);
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    if (!showChat) {
      toast({
        title: "Chat Feature",
        description: "You can now ask follow-up questions about your diagnosis.",
        duration: 3000,
      });
    }
  };

  const analyzeImage = async (imageFile: File) => {
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please configure your Google API Key first",
        variant: "destructive",
      });
      return null;
    }

    try {
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]);
        };
        reader.readAsDataURL(imageFile);
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Analyze this medical image and provide a detailed report in the following format:
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
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze image",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleImageUpload = async (file: File) => {
    setAnalyzing(true);
    const results = await analyzeImage(file);
    if (results) {
      setCurrentPatientImages(prev => [...prev, { file, results }]);
    }
    setAnalyzing(false);
  };

  const currentAnalysis = currentPatientImages[selectedImageIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
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
            {currentPatientImages.length > 0 ? (
              <div className="space-y-4">
                <div className="flex gap-2 overflow-x-auto pb-4">
                  {currentPatientImages.map((image, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(image.file)}
                      alt={`Patient image ${index + 1}`}
                      className={`h-20 w-20 object-cover rounded-lg cursor-pointer border-2 ${
                        selectedImageIndex === index ? 'border-medical-blue' : 'border-transparent'
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  ))}
                </div>
                <ImageUploader
                  onImageUpload={handleImageUpload}
                  isLoading={analyzing}
                  currentImage={currentAnalysis?.file}
                  onReset={addAnotherImage}
                />
              </div>
            ) : (
              <ImageUploader
                onImageUpload={handleImageUpload}
                isLoading={analyzing}
              />
            )}

            <AnalysisResults 
              loading={analyzing} 
              results={currentAnalysis?.results || null} 
            />

            {currentAnalysis?.results && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <Button
                  onClick={resetAnalysis}
                  className="flex items-center gap-2 bg-medical-light text-medical-blue hover:bg-medical-blue hover:text-white"
                >
                  <Image className="w-4 h-4" />
                  Analyze New Patient Images
                </Button>
                <Button
                  onClick={addAnotherImage}
                  className="flex items-center gap-2 bg-medical-light text-medical-blue hover:bg-medical-blue hover:text-white"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Image
                </Button>
                <Button
                  onClick={toggleChat}
                  className={`flex items-center gap-2 ${
                    showChat 
                      ? "bg-medical-blue text-white" 
                      : "bg-medical-light text-medical-blue hover:bg-medical-blue hover:text-white"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  {showChat ? "Hide Chat" : "Ask Follow-up Questions"}
                </Button>
              </div>
            )}

            {showChat && currentAnalysis?.results && (
              <ChatInterface 
                apiKey={apiKey} 
                analysisResults={currentAnalysis.results}
                onImageUpload={handleImageUpload}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;