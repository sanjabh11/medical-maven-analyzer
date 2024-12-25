import React, { useEffect, useState } from "react";
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
import { getGoogleApiKey } from "@/utils/apiKeyManager";

interface ImageAnalysis {
  file: File;
  results: string | null;
}

const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB

const Index = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [currentPatientImages, setCurrentPatientImages] = useState<ImageAnalysis[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [currentTab, setCurrentTab] = useState("image-analysis");

  useEffect(() => {
    const fetchApiKey = async () => {
      const key = await getGoogleApiKey();
      setApiKey(key);
    };
    fetchApiKey();
  }, []);

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          const maxDimension = 1024;

          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Get the compressed image data
          const compressedData = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressedData.split(',')[1]);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
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
      if (!imageFile.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      if (imageFile.size > MAX_IMAGE_SIZE) {
        toast({
          title: "Warning",
          description: "Image size is large, compressing...",
        });
      }

      const base64Image = await compressImage(imageFile);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`,
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
                  mime_type: imageFile.type,
                  data: base64Image
                }
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to analyze image');
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
                  currentImage={currentPatientImages[selectedImageIndex]?.file}
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
              results={currentPatientImages[selectedImageIndex]?.results || null} 
            />

            {currentPatientImages[selectedImageIndex]?.results && (
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
                    analysisResults={currentPatientImages[selectedImageIndex].results}
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
