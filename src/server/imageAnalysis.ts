import { ImageAnnotatorClient } from '@google-cloud/vision';
import dicomParser from 'dicom-parser';
import sharp from 'sharp';

interface ImageQualityMetrics {
  brightness: number;
  contrast: number;
  sharpness: number;
  noise: number;
}

interface AnalysisResult {
  metadata?: any;
  qualityMetrics: ImageQualityMetrics;
  findings: any;
  recommendations: string[];
}

export async function analyzeMedicalImage(file: Buffer, fileType: string): Promise<AnalysisResult> {
  console.log('[Analysis] Starting medical image analysis');
  
  // Initialize result object
  const result: AnalysisResult = {
    qualityMetrics: { brightness: 0, contrast: 0, sharpness: 0, noise: 0 },
    findings: {},
    recommendations: []
  };

  try {
    let imageBuffer = file;

    // Handle DICOM files
    if (fileType === 'application/dicom' || fileType.includes('dicom')) {
      console.log('[Analysis] Processing DICOM file');
      const dataSet = dicomParser.parseDicom(file);
      result.metadata = extractDicomMetadata(dataSet);
      console.log('[Analysis] Extracted DICOM metadata:', result.metadata);
      
      // Convert DICOM pixel data to regular image format
      const pixelData = extractPixelDataFromDicom(dataSet);
      if (pixelData) {
        imageBuffer = await convertPixelDataToImage(pixelData, dataSet);
        console.log('[Analysis] Converted DICOM pixel data to standard image format');
      }
    }

    // Analyze image quality using sharp
    console.log('[Analysis] Analyzing image quality with sharp');
    const imageQuality = await analyzeImageQuality(imageBuffer);
    result.qualityMetrics = imageQuality;
    console.log('[Analysis] Image quality metrics:', imageQuality);

    // Use Google Cloud Vision API for advanced analysis
    console.log('[Analysis] Initializing Google Cloud Vision client');
    const visionClient = new ImageAnnotatorClient({
      keyFilename: './musically-438108-761e536a8ba3.json'
    });

    console.log('[Analysis] Sending request to Vision API');
    const [visionResponse] = await visionClient.annotateImage({
      image: { content: imageBuffer.toString('base64') },
      features: [
        { type: 'TEXT_DETECTION' },
        { type: 'LABEL_DETECTION' },
        { type: 'OBJECT_LOCALIZATION' },
        { type: 'IMAGE_PROPERTIES' }
      ]
    });
    console.log('[Analysis] Received Vision API response');

    // Extract findings from Vision API response
    result.findings = {
      labels: visionResponse.labelAnnotations || [],
      objects: visionResponse.localizedObjectAnnotations || [],
      text: visionResponse.fullTextAnnotation?.text || '',
      properties: visionResponse.imagePropertiesAnnotation || {}
    };
    console.log('[Analysis] Extracted findings from Vision API response');

    // Generate recommendations based on quality metrics
    result.recommendations = generateRecommendations(result.qualityMetrics);
    console.log('[Analysis] Generated recommendations');

    return result;
  } catch (error) {
    console.error('[Analysis] Error during image analysis:', error);
    throw error;
  }
}

function extractDicomMetadata(dataSet: any) {
  return {
    patientName: dataSet.string('x00100010'),
    patientId: dataSet.string('x00100020'),
    studyDate: dataSet.string('x00080020'),
    modality: dataSet.string('x00080060'),
    manufacturer: dataSet.string('x00080070'),
    imageQuality: {
      bitsAllocated: dataSet.uint16('x00280100'),
      bitsStored: dataSet.uint16('x00280101'),
      windowCenter: dataSet.int16('x00281050'),
      windowWidth: dataSet.int16('x00281051'),
    },
  };
}

function extractPixelDataFromDicom(dataSet: any): Buffer | null {
  try {
    const pixelDataElement = dataSet.elements.x7fe00010;
    if (!pixelDataElement) {
      return null;
    }
    return Buffer.from(dataSet.byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length);
  } catch (error) {
    console.error('Error extracting pixel data:', error);
    return null;
  }
}

async function convertPixelDataToImage(pixelData: Buffer, dataSet: any): Promise<Buffer> {
  const width = dataSet.uint16('x00280011');
  const height = dataSet.uint16('x00280010');
  const bitsAllocated = dataSet.uint16('x00280100');

  // Create a sharp image from the pixel data
  return sharp(pixelData, {
    raw: {
      width,
      height,
      channels: 1,
      depth: bitsAllocated
    }
  })
    .normalize() // Normalize the pixel values
    .toFormat('png')
    .toBuffer();
}

async function analyzeImageQuality(imageBuffer: Buffer): Promise<ImageQualityMetrics> {
  const image = sharp(imageBuffer);
  const stats = await image.stats();
  const metadata = await image.metadata();

  // Calculate quality metrics
  const brightness = calculateBrightness(stats);
  const contrast = calculateContrast(stats);
  const sharpness = await calculateSharpness(image);
  const noise = calculateNoise(stats);

  return {
    brightness,
    contrast,
    sharpness,
    noise,
  };
}

function calculateBrightness(stats: sharp.Stats): number {
  const channels = [stats.channels[0], stats.channels[1], stats.channels[2]];
  return channels.reduce((sum, channel) => sum + channel.mean, 0) / 3;
}

function calculateContrast(stats: sharp.Stats): number {
  const channels = [stats.channels[0], stats.channels[1], stats.channels[2]];
  return channels.reduce((sum, channel) => sum + (channel.max - channel.min), 0) / 3;
}

async function calculateSharpness(image: sharp.Sharp): Promise<number> {
  const { data } = await image
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let sum = 0;
  for (let i = 1; i < data.length - 1; i++) {
    sum += Math.abs(2 * data[i] - data[i - 1] - data[i + 1]);
  }
  return sum / data.length;
}

function calculateNoise(stats: sharp.Stats): number {
  const channels = [stats.channels[0], stats.channels[1], stats.channels[2]];
  return channels.reduce((sum, channel) => sum + channel.stdev, 0) / 3;
}

function generateRecommendations(metrics: ImageQualityMetrics): string[] {
  const recommendations: string[] = [];

  if (metrics.brightness < 0.3) {
    recommendations.push('Image appears too dark. Consider increasing exposure or brightness.');
  } else if (metrics.brightness > 0.7) {
    recommendations.push('Image appears too bright. Consider decreasing exposure or brightness.');
  }

  if (metrics.contrast < 0.4) {
    recommendations.push('Low contrast detected. Consider adjusting contrast settings.');
  }

  if (metrics.sharpness < 0.5) {
    recommendations.push('Image appears blurry. Consider refocusing or using a higher resolution.');
  }

  if (metrics.noise > 0.6) {
    recommendations.push('High noise levels detected. Consider using noise reduction techniques or improving lighting conditions.');
  }

  return recommendations;
}
