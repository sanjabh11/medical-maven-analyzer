import React from "react";
import ConfigurationSidebar from "@/components/ConfigurationSidebar";
import ImageUploader from "@/components/ImageUploader";
import AnalysisResults from "@/components/AnalysisResults";
import ChatInterface from "@/components/ChatInterface";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { MessageSquare, Image, Plus } from "lucide-react";

const Index = () => {
  const [apiKey, setApiKey] = React.useState<string | null>(
    localStorage.getItem("GOOGLE_API_KEY")
  );
  const [selectedImages, setSelectedImages] = React.useState<File[]>([]);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [results, setResults] = React.useState<string | null>(null);
  const [showChat, setShowChat] = React.useState(false);

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
    setSelectedImages([]);
    setResults(null);
    setAnalyzing(false);
    setShowChat(false);
  };

  const addAnotherImage = () => {
    // Keep existing images but allow adding more
    setAnalyzing(false);
    setResults(null);
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
      return;
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
        throw new Error(`API request failed: ${response.statusText}`);
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
    setSelectedImages(prev => [...prev, file]);
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
                Upload medical images for professional AI-powered analysis
              </p>
            </div>

            {selectedImages.map((image, index) => (
              <div key={index} className="mb-8">
                <ImageUploader
                  onImageUpload={handleImageUpload}
                  isLoading={analyzing}
                  currentImage={image}
                />
              </div>
            ))}

            {selectedImages.length === 0 && (
              <ImageUploader
                onImageUpload={handleImageUpload}
                isLoading={analyzing}
              />
            )}

            <AnalysisResults loading={analyzing} results={results} />

            {results && (
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

            {showChat && results && (
              <ChatInterface apiKey={apiKey} analysisResults={results} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
