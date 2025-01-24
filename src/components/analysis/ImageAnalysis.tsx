import React, { useRef } from 'react';
import UploadZone from '@/components/upload/UploadZone';
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
  onSelectImage: (index: number) => void;
}

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
  onSelectImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    try {
      await onImageUpload(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload the file. Please try again.',
        variant: 'destructive',
      });
    }
  };

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
                onClick={() => onSelectImage(index)}
              >
                <img
                  src={URL.createObjectURL(image.file)}
                  alt={`Patient Image ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                {index === selectedImageIndex && (
                  <div className="absolute inset-0 bg-medical-blue/10 rounded-lg" />
                )}
              </div>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="w-24 h-24 border-dashed"
              onClick={onAddImage}
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={onReset}>
              Reset Analysis
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleChat}
              className={showChat ? 'bg-medical-blue/10' : ''}
            >
              <MessageSquare className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <img
                src={URL.createObjectURL(currentPatientImages[selectedImageIndex].file)}
                alt="Selected Patient Image"
                className="w-full rounded-lg shadow-md"
              />
              {analyzing && (
                <div className="text-center text-sm text-gray-500">
                  Analyzing image...
                </div>
              )}
            </div>

            <div className="space-y-4">
              {showChat ? (
                <ChatInterface
                  apiKey={apiKey}
                  analysisResults={currentPatientImages[selectedImageIndex].results}
                />
              ) : (
                <AnalysisResults
                  loading={analyzing}
                  results={currentPatientImages[selectedImageIndex].results}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,.dcm"
            onChange={handleFileSelect}
          />
          <UploadZone
            isLoading={analyzing}
            onClick={() => fileInputRef.current?.click()}
          />
        </div>
      )}
    </div>
  );
};