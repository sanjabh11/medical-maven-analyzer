import { ImageAnnotatorClient } from '@google-cloud/vision';
import sharp from 'sharp';
import { healthcareAPI } from './healthcareApi';
import dicomParser from 'dicom-parser';
import cornerstone from 'cornerstone-core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';

interface ImageAnalysisResult {
  enhancedImage: Buffer;
  annotations: any;
  medicalFindings: any;
  dicomMetadata?: any;
}

class ImageAnalysisService {
  private visionClient: ImageAnnotatorClient;

  constructor() {
    this.visionClient = new ImageAnnotatorClient({
      keyFilename: 'medical serarch keys.json'
    });
    
    // Initialize DICOM image loader
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
  }

  private async isDicomFile(buffer: Buffer): Promise<boolean> {
    try {
      // Check for DICOM magic number (DICM at offset 128)
      return buffer.toString('ascii', 128, 132) === 'DICM';
    } catch {
      return false;
    }
  }

  private async processDicomImage(buffer: Buffer): Promise<{
    imageBuffer: Buffer;
    metadata: any;
  }> {
    try {
      // Parse DICOM data
      const dataSet = dicomParser.parseDicom(buffer);

      // Extract metadata
      const metadata = {
        patientName: dataSet.string('x00100010'),
        patientId: dataSet.string('x00100020'),
        studyDate: dataSet.string('x00080020'),
        modality: dataSet.string('x00080060'),
        manufacturer: dataSet.string('x00080070')
      };

      // Convert DICOM to viewable image
      const image = await cornerstone.loadImage(
        cornerstoneWADOImageLoader.wadouri.fileManager.add(buffer)
      );
      
      // Convert cornerstone image to buffer
      const canvas = document.createElement('canvas');
      cornerstone.enable(canvas);
      await cornerstone.displayImage(canvas, image);
      
      // Get image data as buffer
      const imageBuffer = await new Promise<Buffer>((resolve) => {
        canvas.toBlob((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(Buffer.from(reader.result as ArrayBuffer));
          };
          reader.readAsArrayBuffer(blob!);
        }, 'image/png');
      });

      return { imageBuffer, metadata };
    } catch (error) {
      console.error('DICOM processing error:', error);
      throw error;
    }
  }

  async enhanceImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .normalize() // Normalize the image
        .sharpen() // Apply sharpening
        .gamma(1.2) // Adjust gamma for better contrast
        .clahe({ width: 128, height: 128 }) // Contrast Limited Adaptive Histogram Equalization
        .toBuffer();
    } catch (error) {
      console.error('Image enhancement error:', error);
      return imageBuffer; // Return original if enhancement fails
    }
  }

  async analyzeMedicalImage(imageBuffer: Buffer): Promise<ImageAnalysisResult> {
    try {
      let processedImage = imageBuffer;
      let dicomMetadata = null;

      // Check if it's a DICOM file
      if (await this.isDicomFile(imageBuffer)) {
        const { imageBuffer: dicomImage, metadata } = await this.processDicomImage(imageBuffer);
        processedImage = dicomImage;
        dicomMetadata = metadata;
      }

      // Step 1: Enhance the image
      const enhancedImage = await this.enhanceImage(processedImage);

      // Step 2: Get Google Cloud Vision analysis
      const [result] = await this.visionClient.documentTextDetection(enhancedImage);
      const annotations = result.textAnnotations || [];

      // Step 3: Process medical findings
      const medicalFindings = await this.processMedicalFindings(annotations, dicomMetadata);

      return {
        enhancedImage,
        annotations,
        medicalFindings,
        dicomMetadata
      };
    } catch (error) {
      console.error('Medical image analysis error:', error);
      throw error;
    }
  }

  private async processMedicalFindings(annotations: any[], dicomMetadata?: any): Promise<any> {
    try {
      // Extract text from annotations
      const extractedText = annotations[0]?.description || '';

      // Combine with DICOM metadata if available
      const contextualInfo = dicomMetadata 
        ? `${extractedText} [DICOM: ${dicomMetadata.modality} study from ${dicomMetadata.studyDate}]`
        : extractedText;

      // Get medical information using existing healthcare API
      const medicalInfo = await healthcareAPI.getRelevantMedicalInfo(contextualInfo);

      return {
        extractedText,
        medicalInfo,
        dicomMetadata,
        confidence: annotations[0]?.confidence || 0
      };
    } catch (error) {
      console.error('Processing medical findings error:', error);
      return null;
    }
  }
}

export const imageAnalysisService = new ImageAnalysisService(); 