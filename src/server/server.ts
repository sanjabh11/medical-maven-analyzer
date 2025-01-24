import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { analyzeMedicalImage } from './imageAnalysis';

const app = express();
const port = process.env.PORT || 3001;

// Configure CORS
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    console.log('[Server] Received file:', file.originalname, file.mimetype);
    // Accept images and DICOM files
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype === 'application/dicom' ||
      file.originalname.endsWith('.dcm')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and DICOM files are allowed.'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Endpoint for image analysis
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
  try {
    console.log('[Server] Received image analysis request');
    
    if (!req.file) {
      console.error('[Server] No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`[Server] Processing ${req.file.mimetype} file of size ${req.file.size} bytes`);
    
    const result = await analyzeMedicalImage(
      req.file.buffer,
      req.file.mimetype
    );

    console.log('[Server] Analysis completed successfully');
    res.json(result);
  } catch (error) {
    console.error('[Server] Error processing image:', error);
    res.status(500).json({ 
      error: 'Error processing image',
      details: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`[Server] Running on port ${port}`);
});
