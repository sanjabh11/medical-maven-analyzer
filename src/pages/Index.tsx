import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ImageAnalysis } from "@/components/analysis/ImageAnalysis";
import SymptomChecker from "@/components/medical/SymptomChecker";
import MentalWellbeing from "@/components/medical/MentalWellbeing";
import HealthRecommendations from "@/components/medical/HealthRecommendations";
import FirstAidGuide from "@/components/medical/FirstAidGuide";
import VitalsMonitor from "@/components/medical/VitalsMonitor";
import { Footer } from "@/components/layout/Footer";
import { toast } from "@/components/ui/use-toast";
import { getGoogleApiKey } from "@/utils/apiKeyManager";
import { compressImage } from "@/utils/imageCompression";

interface ImageAnalysisData {
  file: File;
  results: string | null;
}

const Index = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [currentPatientImages, setCurrentPatientImages] = useState<ImageAnalysisData[]>([]);
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

  const analyzeImage = async (file: File) => {
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please configure your Google API Key first",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Check if the file is an image or a PDF
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        throw new Error('Please upload an image or PDF file');
      }

      let base64Data;
      if (file.type.startsWith('image/')) {
        base64Data = await compressImage(file); // Compress image if it's an image file
      } else {
        // Handle PDF file
        base64Data = await convertPdfToBase64(file); // Convert PDF to base64
        // Remove the prefix if it exists
        base64Data = base64Data.split(',')[1]; // This removes the "data:application/pdf;base64," part
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Analyze this document and provide a detailed report.`,
              }, {
                inline_data: {
                  mime_type: file.type,
                  data: base64Data, // Send the cleaned base64 data
                },
              }],
            }],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to analyze document');
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze document",
        variant: "destructive",
      });
      return null;
    }
  };

  // Function to convert PDF to base64
  const convertPdfToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        reject(new Error('Failed to read PDF file'));
      };
    });
  };

  const handleImageUpload = async (file: File) => {
    setAnalyzing(true);
    const results = await analyzeImage(file);
    if (results) {
      setCurrentPatientImages(prev => [...prev, { file, results }]);
    }
    setAnalyzing(false);
  };

  const handleReset = () => {
    setCurrentPatientImages([]);
    setAnalyzing(false);
    setShowChat(false);
    setSelectedImageIndex(0);
  };

  const handleAddImage = () => {
    setAnalyzing(false);
    setSelectedImageIndex(currentPatientImages.length);
  };

  const handleToggleChat = () => {
    setShowChat(!showChat);
    if (!showChat) {
      toast({
        title: "Chat Feature",
        description: "You can now ask follow-up questions about your diagnosis.",
        duration: 3000,
      });
    }
  };

  const handleSelectImage = (index: number) => {
    setSelectedImageIndex(index);
  };

  const renderContent = () => {
    switch (currentTab) {
      case "image-analysis":
        return (
          <ImageAnalysis
            apiKey={apiKey}
            currentPatientImages={currentPatientImages}
            analyzing={analyzing}
            showChat={showChat}
            selectedImageIndex={selectedImageIndex}
            onImageUpload={handleImageUpload}
            onReset={handleReset}
            onAddImage={handleAddImage}
            onToggleChat={handleToggleChat}
            onSelectImage={handleSelectImage}
          />
        );
      case "symptoms":
        return <SymptomChecker apiKey={apiKey} showChat={showChat} />;
      case "mental":
        return <MentalWellbeing apiKey={apiKey} showChat={showChat} />;
      case "health":
        return <HealthRecommendations apiKey={apiKey} showChat={showChat} />;
      case "first-aid":
        return <FirstAidGuide apiKey={apiKey} showChat={showChat} />;
      case "vitals":
        return <VitalsMonitor apiKey={apiKey} showChat={showChat} />;
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