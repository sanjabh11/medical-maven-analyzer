import React from 'react';
import ImageUploader from '@/components/ImageUploader';
import AnalysisResults from '@/components/AnalysisResults';
import ChatInterface from '@/components/ChatInterface';
import { Button } from '@/components/ui/button';
import { MessageSquare, Image as ImageIcon, Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { compressImage } from '@/utils/imageCompression';

interface ImageAnalysis {
  file: File;
  results: string | null;
}

interface ImageAnalysisProps {
  apiKey: string | null;
  currentPatientImages: ImageAnalysis[];
  analyzing: boolean;
  showChat: boolean;
  selectedImageIndex: number;
  onImageUpload: (file: File) => Promise<void>;
  onReset: () => void;
  onAddImage: () => void;
  onToggleChat: () => void;
}

const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB

export const ImageAnalysis: React.FC<ImageAnalysisProps> = ({
  apiKey,
  currentPatientImages,
  analyzing,
  showChat,
  selectedImageIndex,
  onImageUpload,
  onReset,
  onAddImage,
  onToggleChat,
}) => {
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
            onImageUpload={onImageUpload}
            isLoading={analyzing}
            currentImage={currentPatientImages[selectedImageIndex]?.file}
          />
        </div>
      ) : (
        <ImageUploader
          onImageUpload={onImageUpload}
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
              onClick={onReset}
              className="bg-gray-800 text-white hover:bg-gray-700 transform transition-all duration-200 hover:scale-105"
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Analyze New Patient Images
            </Button>
            <Button
              onClick={onAddImage}
              className="bg-gray-800 text-white hover:bg-gray-700 transform transition-all duration-200 hover:scale-105"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another Image
            </Button>
            <Button
              onClick={onToggleChat}
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
              onImageUpload={onImageUpload}
            />
          )}
        </>
      )}
    </div>
  );
};