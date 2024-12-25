import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import ImageUploader from "@/components/ImageUploader";
import AnalysisResults from "@/components/AnalysisResults";
import ChatInterface from "@/components/ChatInterface";
import SymptomChecker from "@/components/medical/SymptomChecker";
import MentalWellbeing from "@/components/medical/MentalWellbeing";
import HealthRecommendations from "@/components/medical/HealthRecommendations";
import FirstAidGuide from "@/components/medical/FirstAidGuide";
import VitalsMonitor from "@/components/medical/VitalsMonitor";
import { Footer } from "@/components/layout/Footer";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { MessageSquare, Image, Plus } from "lucide-react";

interface ImageAnalysis {
  file: File;
  results: string | null;
}

const Index = () => {
  const [apiKey] = React.useState<string | null>(localStorage.getItem("GOOGLE_API_KEY"));
  const [currentPatientImages, setCurrentPatientImages] = React.useState<ImageAnalysis[]>([]);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [showChat, setShowChat] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState<number>(0);
  const [currentTab, setCurrentTab] = React.useState("image-analysis");

  const handleImageUpload = async (file: File) => {
    setAnalyzing(true);
    const results = await analyzeImage(file);
    if (results) {
      setCurrentPatientImages(prev => [...prev, { file, results }]);
    }
    setAnalyzing(false);
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
          headers: { "Content-Type": "application/json" },
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

      if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);
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

  const currentAnalysis = currentPatientImages[selectedImageIndex];

  const renderContent = () => {
    switch (currentTab) {
      case "image-analysis":
        return (
          <div className="space-y-8 animate-fade-in">
            {currentPatientImages.length > 0 ? (
              <div className="space-y-4">
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                  {currentPatientImages.map((image, index) => (
                    <div
                      key={index}
                      className={`relative group cursor-pointer transition-all duration-200 ${
                        selectedImageIndex === index ? 'ring-2 ring-medical-blue' : ''
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={URL.createObjectURL(image.file)}
                        alt={`Patient image ${index + 1}`}
                        className="h-20 w-20 object-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-medical-blue/0 group-hover:bg-medical-blue/10 rounded-lg transition-all duration-200" />
                    </div>
                  ))}
                </div>
                <ImageUploader
                  onImageUpload={handleImageUpload}
                  isLoading={analyzing}
                  currentImage={currentAnalysis?.file}
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
              <>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                  <Button
                    onClick={() => {
                      setCurrentPatientImages([]);
                      setAnalyzing(false);
                      setShowChat(false);
                      setSelectedImageIndex(0);
                    }}
                    className="bg-gray-800 text-white hover:bg-gray-700 transform transition-all duration-200 hover:scale-105"
                  >
                    <Image className="mr-2 h-4 w-4" />
                    Analyze New Patient Images
                  </Button>
                  <Button
                    onClick={() => {
                      setAnalyzing(false);
                      setSelectedImageIndex(currentPatientImages.length);
                    }}
                    className="bg-gray-800 text-white hover:bg-gray-700 transform transition-all duration-200 hover:scale-105"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Another Image
                  </Button>
                  <Button
                    onClick={() => {
                      setShowChat(!showChat);
                      if (!showChat) {
                        toast({
                          title: "Chat Feature",
                          description: "You can now ask follow-up questions about your diagnosis.",
                          duration: 3000,
                        });
                      }
                    }}
                    className={`transform transition-all duration-200 hover:scale-105 ${
                      showChat 
                        ? "bg-gray-700 text-white" 
                        : "bg-gray-800 text-white hover:bg-gray-700"
                    }`}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {showChat ? "Hide Chat" : "Ask Follow-up Questions"}
                  </Button>
                </div>

                {showChat && (
                  <ChatInterface 
                    apiKey={apiKey} 
                    analysisResults={currentAnalysis.results}
                    onImageUpload={handleImageUpload}
                  />
                )}
              </>
            )}
          </div>
        );
      case "symptoms":
        return <SymptomChecker apiKey={apiKey} />;
      case "mental":
        return <MentalWellbeing />;
      case "health":
        return <HealthRecommendations />;
      case "first-aid":
        return <FirstAidGuide />;
      case "vitals":
        return <VitalsMonitor />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />
      <div className="flex-1 p-8 overflow-y-auto">
        <main className="max-w-4xl mx-auto">
          {renderContent()}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Index;
