import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import sharp from 'sharp';
import dicomParser from 'dicom-parser';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    console.log('[Server] Received file:', file.originalname, file.mimetype);
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'application/dicom'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.dcm'];
    
    const ext = path.extname(file.originalname).toLowerCase();
    const isDicom = ext === '.dcm' || file.mimetype === 'application/dicom';
    
    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
      // Set a custom property to identify DICOM files
      (file as any).isDicom = isDicom;
      cb(null, true);
    } else {
      cb(new Error('Please upload an image or DICOM file'));
    }
  }
});

app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const visionClient = new ImageAnnotatorClient({
  keyFilename: path.resolve(__dirname, '../medical serarch keys.json')
});

// Add Google Custom Search configuration
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyCsSivvsYHoMsLNqSjznmSYaQ27PgH0hPA';
const GOOGLE_SEARCH_CX = process.env.GOOGLE_SEARCH_CX || '017576662512468239146:omuauf_lfve';

async function searchMedicalInfo(query: string): Promise<any[]> {
  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_SEARCH_CX,
        q: `medical ${query}`,
        num: 5
      }
    });

    return response.data.items.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      source: 'Google Scholar'
    }));
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

// Add PubMed search
async function searchPubMed(query: string): Promise<any[]> {
  try {
    const searchResponse = await axios.get('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi', {
      params: {
        db: 'pubmed',
        term: query,
        retmax: 5,
        format: 'json'
      }
    });

    const ids = searchResponse.data.esearchresult.idlist;
    
    const summaryResponse = await axios.get('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi', {
      params: {
        db: 'pubmed',
        id: ids.join(','),
        format: 'json'
      }
    });

    return Object.values(summaryResponse.data.result || {})
      .filter((item: any) => item.uid)
      .map((item: any) => ({
        title: item.title,
        link: `https://pubmed.ncbi.nlm.nih.gov/${item.uid}`,
        snippet: item.description || '',
        source: 'PubMed'
      }));
  } catch (error) {
    console.error('PubMed search error:', error);
    return [];
  }
}

interface ImageQualityMetrics {
  brightness: number;
  contrast: number;
  sharpness: number;
  noise: number;
}

async function analyzeImageQuality(imageBuffer: Buffer): Promise<ImageQualityMetrics> {
  const image = sharp(imageBuffer);
  const stats = await image.stats();
  
  // Calculate quality metrics
  const brightness = stats.channels[0].mean / 255;
  const contrast = stats.channels[0].stdev / 128;
  const sharpness = await calculateSharpness(image);
  const noise = await calculateNoise(stats);

  return {
    brightness,
    contrast,
    sharpness,
    noise
  };
}

async function calculateSharpness(image: sharp.Sharp): Promise<number> {
  const { data, info } = await image
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let sharpness = 0;
  for (let y = 1; y < info.height - 1; y++) {
    for (let x = 1; x < info.width - 1; x++) {
      const idx = y * info.width + x;
      const dx = Math.abs(data[idx + 1] - data[idx - 1]);
      const dy = Math.abs(data[idx + info.width] - data[idx - info.width]);
      sharpness += Math.sqrt(dx * dx + dy * dy);
    }
  }
  return sharpness / (info.width * info.height);
}

async function calculateNoise(stats: sharp.Stats): Promise<number> {
  return stats.channels.reduce((acc, channel) => acc + channel.stdev, 0) / stats.channels.length;
}

async function enhanceImage(imageBuffer: Buffer, quality: ImageQualityMetrics): Promise<Buffer> {
  try {
    let pipeline = sharp(imageBuffer)
      .normalize() // Basic normalization
      .gamma(1.2); // Adjust gamma for better contrast

    // Apply adaptive enhancement based on quality metrics
    if (quality.brightness < 0.4) {
      pipeline = pipeline.modulate({ brightness: 1.2 });
    }
    if (quality.contrast < 0.5) {
      pipeline = pipeline.linear(1.2, -0.1);
    }
    if (quality.sharpness < 50) {
      pipeline = pipeline.sharpen(quality.sharpness < 25 ? 2 : 1);
    }
    
    // Apply noise reduction if needed
    if (quality.noise > 20) {
      pipeline = pipeline.median(3);
    }

    // Apply CLAHE for better local contrast
    pipeline = pipeline.clahe({
      width: 128,
      height: 128,
      maxSlope: quality.contrast < 0.3 ? 3 : 2
    });

    return await pipeline.toBuffer();
  } catch (error) {
    console.error('Image enhancement error:', error);
    return imageBuffer;
  }
}

async function isDicomFile(buffer: Buffer): Promise<boolean> {
  try {
    return buffer.toString('ascii', 128, 132) === 'DICM';
  } catch {
    return false;
  }
}

async function processDicomImage(buffer: Buffer): Promise<{
  imageBuffer: Buffer;
  metadata: any;
}> {
  try {
    const dataSet = dicomParser.parseDicom(buffer);
    
    // Extract metadata with null checks
    const width = dataSet.uint16('x00280011') || 512; // Default width if not found
    const height = dataSet.uint16('x00280010') || 512; // Default height if not found
    
    const metadata = {
      patientName: dataSet.string('x00100010'),
      patientId: dataSet.string('x00100020'),
      studyDate: dataSet.string('x00080020'),
      modality: dataSet.string('x00080060'),
      manufacturer: dataSet.string('x00080070'),
      imageQuality: {
        bitsAllocated: dataSet.uint16('x00280100'),
        bitsStored: dataSet.uint16('x00280101'),
        windowCenter: dataSet.floatString('x00281050'),
        windowWidth: dataSet.floatString('x00281051')
      }
    };

    // Get pixel data with proper error handling
    const pixelDataElement = dataSet.elements.x7fe00010;
    if (!pixelDataElement) {
      throw new Error('No pixel data found in DICOM file');
    }

    const pixelData = new Uint8Array(dataSet.byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length);
    
    // Create image from pixel data with validated dimensions
    const imageBuffer = await sharp(pixelData, {
      raw: {
        width,
        height,
        channels: 1
      }
    })
    .normalize() // Normalize the pixel values
    .gamma(1.2) // Adjust gamma for better contrast
    .toBuffer();

    return { imageBuffer, metadata };
  } catch (error) {
    console.error('DICOM processing error:', error);
    throw error;
  }
}

// Add interfaces at the top of the file
interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
}

interface AnalysisResponse {
  enhancedImage: string;
  originalQuality: ImageQualityMetrics;
  qualityIssues: string[];
  annotations: any[];
  metadata: any;
  searchResults: SearchResult[];
  confidence: number;
  recommendations: string[];
}

// Update the analyze-image endpoint
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
  try {
    console.log('[Server] Received image analysis request');
    
    if (!req.file) {
      console.error('[Server] No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`[Server] Processing ${req.file.mimetype} file of size ${req.file.size} bytes`);
    
    let imageBuffer = req.file.buffer;
    let metadata = null;
    let qualityIssues: string[] = [];
    let searchResults: SearchResult[] = [];

    // Check if it's a DICOM file
    const isDicom = (req.file as any).isDicom || 
                   (imageBuffer.length > 132 && imageBuffer.toString('ascii', 128, 132) === 'DICM');

    if (isDicom) {
      console.log('[Server] Processing DICOM file...');
      try {
        const dicomResult = await processDicomImage(imageBuffer);
        imageBuffer = dicomResult.imageBuffer;
        metadata = dicomResult.metadata;
        console.log('[Server] Extracted DICOM metadata:', metadata);
      } catch (dicomError) {
        console.error('DICOM processing error:', dicomError);
        return res.status(400).json({ 
          error: 'Invalid DICOM file format. Please ensure the file is a valid DICOM image.' 
        });
      }
    }

    // Analyze image quality
    try {
      const qualityMetrics = await analyzeImageQuality(imageBuffer);
      
      // Identify quality issues with more detailed messages
      if (qualityMetrics.brightness < 0.3) {
        qualityIssues.push('Low brightness');
      }
      if (qualityMetrics.contrast < 0.4) {
        qualityIssues.push('Poor contrast');
      }
      if (qualityMetrics.sharpness < 30) {
        qualityIssues.push('Low sharpness');
      }
      if (qualityMetrics.noise > 25) {
        qualityIssues.push('High noise levels');
      }

      // Enhance image based on quality metrics
      const enhancedImage = await enhanceImage(imageBuffer, qualityMetrics);

      // Analyze with Google Cloud Vision
      const [result] = await visionClient.documentTextDetection(enhancedImage);
      const annotations = result.textAnnotations || [];

      // Search for medical information if text is found
      if (annotations[0]?.description) {
        const [googleResults, pubmedResults] = await Promise.all([
          searchMedicalInfo(annotations[0].description),
          searchPubMed(annotations[0].description)
        ]);
        searchResults = [...googleResults, ...pubmedResults];
      }

      // Return comprehensive results
      const response: AnalysisResponse = {
        enhancedImage: enhancedImage.toString('base64'),
        originalQuality: qualityMetrics,
        qualityIssues,
        annotations,
        metadata,
        searchResults,
        confidence: annotations[0]?.confidence || 0,
        recommendations: qualityIssues.map(issue => {
          switch (issue) {
            case 'Low brightness':
              return 'Consider adjusting exposure settings during image capture';
            case 'Poor contrast':
              return 'Adjust X-ray intensity or detector settings';
            case 'Low sharpness':
              return 'Check for motion blur or focus issues';
            case 'High noise levels':
              return 'Consider using noise reduction techniques or updating equipment';
            default:
              return '';
          }
        })
      };

      console.log('[Server] Analysis completed successfully');
      res.json(response);
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ 
        error: 'Failed to analyze image. Please ensure the file is a valid medical image.' 
      });
    }
  } catch (error) {
    console.error('Request error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
});
