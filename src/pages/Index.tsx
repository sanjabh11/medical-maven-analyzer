import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ImageAnalysis } from "@/components/analysis/ImageAnalysis";
import SymptomChecker from "@/components/medical/SymptomChecker";
import MentalWellbeing from "@/components/medical/MentalWellbeing";
import HealthRecommendations from "@/components/medical/HealthRecommendations";
import FirstAidGuide from "@/components/medical/FirstAidGuide";
import VitalsMonitor from "@/components/medical/VitalsMonitor";
import { Footer } from "@/components/layout/Footer";
import { ApiKeySetup } from "@/components/ApiKeySetup";
import { toast } from "@/components/ui/use-toast";
import { getGoogleApiKey, hasValidApiKey } from "@/utils/apiKeyManager";
import { compressImage } from "@/utils/imageCompression";

interface ImageAnalysisData {
  file: File;
  results: string | null;
}

const Index = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isValidApiKey, setIsValidApiKey] = useState<boolean>(false);
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(true);
  const [currentPatientImages, setCurrentPatientImages] = useState<ImageAnalysisData[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [currentTab, setCurrentTab] = useState("image-analysis");

  useEffect(() => {
    const checkApiKey = async () => {
      setIsCheckingApiKey(true);
      try {
        const key = await getGoogleApiKey();
        const isValid = await hasValidApiKey();
        
        setApiKey(key);
        setIsValidApiKey(isValid);
        
        if (!isValid) {
          console.log('No valid API key found, showing setup screen');
        }
      } catch (error) {
        console.error('Error checking API key:', error);
        setIsValidApiKey(false);
      } finally {
        setIsCheckingApiKey(false);
      }
    };
    
    checkApiKey();
  }, []);

  const handleApiKeySet = (newApiKey: string) => {
    setApiKey(newApiKey);
    setIsValidApiKey(true);
  };

  const analyzeImage = async (file: File) => {
    if (!apiKey || !isValidApiKey) {
      toast({
        title: "Error",
        description: "Please configure your Google API Key first",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Check if the file is an image, DICOM, or PDF
      const isDicom = file.name.toLowerCase().endsWith('.dcm') || file.type === 'application/dicom';
      if (!file.type.startsWith('image/') && !isDicom && file.type !== 'application/pdf') {
        throw new Error('Please upload an image, DICOM, or PDF file');
      }

      let base64Data;
      if (isDicom) {
        // For DICOM files, send directly to the server
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('http://localhost:3001/api/analyze-image', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to analyze DICOM file');
        }
        
        const data = await response.json();
        return data.findings?.extractedText || 'No findings available';
      } else if (file.type.startsWith('image/')) {
        base64Data = await compressImage(file); // Compress image if it's an image file
      } else {
        // Handle PDF file
        base64Data = await convertPdfToBase64(file);
        base64Data = base64Data.split(',')[1];
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `As a medical expert, analyze this medical document/image and provide a comprehensive analysis in the following format:

1. **Image Type & Region**: Identify what type of medical image or document this is and what body region/system it shows.

2. **Key Findings**: List the main observations, abnormalities, or notable features visible in the image.

3. **Diagnostic Assessment**: Provide your professional assessment of what these findings might indicate, including possible conditions or diagnoses.

4. **Patient-Friendly Explanation**: Explain the findings in simple, non-technical language that a patient could understand.

Please be thorough but clear in your analysis.`,
              }, {
                inline_data: {
                  mime_type: file.type,
                  data: base64Data,
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
        return <SymptomChecker apiKey={apiKey} />;
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

  // Show loading screen while checking API key
  if (isCheckingApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show API key setup if no valid key is found
  if (!isValidApiKey) {
    return <ApiKeySetup onApiKeySet={handleApiKeySet} />;
  }

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