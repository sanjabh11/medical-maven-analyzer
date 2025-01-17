import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import axios from 'axios';

interface ImageQualityMetrics {
  brightness: number;
  contrast: number;
  sharpness: number;
  noise: number;
}

interface DicomMetadata {
  patientName?: string;
  patientId?: string;
  studyDate?: string;
  modality?: string;
  manufacturer?: string;
  imageQuality?: {
    bitsAllocated: number;
    bitsStored: number;
    windowCenter: number;
    windowWidth: number;
  };
}

interface AnalysisResult {
  findings: {
    extractedText: string;
  };
  searchResults: any[];
  confidence: number;
  qualityMetrics: ImageQualityMetrics;
  qualityIssues: string[];
  recommendations: string[];
  metadata?: DicomMetadata;
}

const API_URL = 'http://localhost:3001/api';

export function ImageAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [enhancedPreviewUrl, setEnhancedPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('analysis');
  const [showEducationalContent, setShowEducationalContent] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const ext = file.name.toLowerCase().split('.').pop();
      setSelectedFile(file);
      
      // For non-DICOM files, create preview URL
      if (ext !== 'dcm') {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        // For DICOM files, show placeholder or loading state
        setPreviewUrl(null);
      }
      
      setEnhancedPreviewUrl(null);
      setAnalysisResult(null);
      setError(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await axios.post(`${API_URL}/analyze-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Handle DICOM files differently
      const isDicom = selectedFile.name.toLowerCase().endsWith('.dcm') || selectedFile.type === 'application/dicom';
      const enhancedImageUrl = isDicom 
        ? `data:image/jpeg;base64,${response.data.enhancedImage}`
        : `data:${selectedFile.type};base64,${response.data.enhancedImage}`;
      
      setEnhancedPreviewUrl(enhancedImageUrl);

      // Format the analysis result
      setAnalysisResult({
        findings: {
          extractedText: response.data.annotations?.[0]?.description || 'No text found',
        },
        searchResults: response.data.searchResults || [],
        confidence: (response.data.confidence || 0) * 100,
        qualityMetrics: {
          brightness: response.data.originalQuality?.brightness || 0,
          contrast: response.data.originalQuality?.contrast || 0,
          sharpness: response.data.originalQuality?.sharpness || 0,
          noise: response.data.originalQuality?.noise || 0,
        },
        qualityIssues: response.data.qualityIssues || [],
        recommendations: response.data.recommendations || [],
        metadata: isDicom ? response.data.metadata : null
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to analyze image. Please try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getQualityColor = (value: number, threshold: { low: number; high: number }) => {
    if (value < threshold.low) return 'text-red-500';
    if (value < threshold.high) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getQualityBadge = (issue: string) => {
    switch (issue) {
      case 'Low brightness':
        return <Badge variant="destructive">Low Brightness</Badge>;
      case 'Poor contrast':
        return <Badge variant="secondary">Poor Contrast</Badge>;
      case 'Low sharpness':
        return <Badge variant="secondary">Low Sharpness</Badge>;
      case 'High noise levels':
        return <Badge variant="destructive">High Noise</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Medical Image Analyzer</h2>
        
        {/* File Upload */}
        <div className="mb-6">
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,.dcm,application/dicom"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
          />
          <Button
            onClick={() => document.getElementById('image-upload')?.click()}
            className="w-full"
          >
            Select Medical Image
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Supported formats: JPEG, PNG, GIF, DICOM (.dcm)
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Image Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {selectedFile && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Original Image</h3>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Original"
                  className="w-full h-auto rounded-lg"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">
                    {selectedFile.name.toLowerCase().endsWith('.dcm') 
                      ? 'DICOM file selected (preview not available)'
                      : 'Preview not available'}
                  </p>
                </div>
              )}
            </div>
          )}
          {enhancedPreviewUrl && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Enhanced Image</h3>
              <img
                src={enhancedPreviewUrl}
                alt="Enhanced"
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Analysis Button */}
        {selectedFile && !isAnalyzing && (
          <Button
            onClick={analyzeImage}
            className="w-full mb-6"
          >
            Analyze Image
          </Button>
        )}

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="mb-6">
            <Progress value={analysisResult ? 100 : 50} className="mb-2" />
            <p className="text-center text-sm text-gray-500">
              Analyzing image...
            </p>
          </div>
        )}

        {/* Results */}
        {analysisResult && (
          <Tabs defaultValue="analysis" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="quality">Image Quality</TabsTrigger>
              <TabsTrigger value="references">References</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="space-y-4">
              {/* DICOM Metadata */}
              {analysisResult?.metadata && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">DICOM Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(analysisResult.metadata).map(([key, value]) => {
                      if (key === 'imageQuality') return null;
                      return (
                        <React.Fragment key={key}>
                          <span className="font-medium">{key}:</span>
                          <span>{String(value)}</span>
                        </React.Fragment>
                      );
                    })}
                    {analysisResult.metadata.imageQuality && (
                      <>
                        <span className="font-medium col-span-2 mt-2">Image Quality Parameters:</span>
                        {Object.entries(analysisResult.metadata.imageQuality).map(([key, value]) => (
                          <React.Fragment key={key}>
                            <span className="font-medium pl-2">{key}:</span>
                            <span>{String(value)}</span>
                          </React.Fragment>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Findings */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Analysis Findings</h3>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="mb-4">{analysisResult?.findings.extractedText}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Confidence:</span>
                    <Progress 
                      value={analysisResult?.confidence || 0} 
                      className="w-32"
                    />
                    <span className="text-sm text-gray-500">
                      {(analysisResult?.confidence || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="quality" className="space-y-4">
              {/* Image Quality Issues */}
              {analysisResult.qualityIssues.length > 0 && (
                <Alert>
                  <AlertTitle>Image Quality Issues</AlertTitle>
                  <AlertDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {analysisResult.qualityIssues.map((issue, index) => (
                        <TooltipProvider key={index}>
                          <Tooltip>
                            <TooltipTrigger>
                              {getQualityBadge(issue)}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{analysisResult.recommendations[index]}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Quality Metrics */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Image Quality Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Brightness: </span>
                    <span className={getQualityColor(analysisResult.qualityMetrics.brightness, { low: 0.3, high: 0.7 })}>
                      {(analysisResult.qualityMetrics.brightness * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Contrast: </span>
                    <span className={getQualityColor(analysisResult.qualityMetrics.contrast, { low: 0.4, high: 0.8 })}>
                      {(analysisResult.qualityMetrics.contrast * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Sharpness: </span>
                    <span className={getQualityColor(analysisResult.qualityMetrics.sharpness / 100, { low: 0.3, high: 0.6 })}>
                      {analysisResult.qualityMetrics.sharpness.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Noise Level: </span>
                    <span className={getQualityColor(1 - analysisResult.qualityMetrics.noise / 50, { low: 0.3, high: 0.7 })}>
                      {analysisResult.qualityMetrics.noise.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="references" className="space-y-4">
              {/* Search Results */}
              {analysisResult.searchResults.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Related Medical References</h3>
                  <div className="grid gap-4">
                    {analysisResult.searchResults.map((result, index) => (
                      <Card key={index} className="p-4">
                        <a
                          href={result.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {result.title}
                        </a>
                        <p className="text-sm text-gray-600 mt-2">{result.snippet}</p>
                        <Badge className="mt-2" variant="secondary">{result.source}</Badge>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertTitle>No References Found</AlertTitle>
                  <AlertDescription>
                    No related medical references were found for this image.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              {/* Recommendations */}
              {analysisResult.recommendations.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Recommendations</h3>
                  <div className="grid gap-4">
                    {analysisResult.recommendations.map((rec, index) => (
                      <Alert key={index} className="bg-blue-50">
                        <AlertTitle>Recommendation {index + 1}</AlertTitle>
                        <AlertDescription>{rec}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertTitle>No Recommendations</AlertTitle>
                  <AlertDescription>
                    No specific recommendations are available for this image.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        )}
      </Card>
    </div>
  );
} 