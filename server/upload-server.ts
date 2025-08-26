
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { images } from '../shared/schema';
import { processImage, getImageInfo } from './services/imageProcessor';
import { uploadToBackblaze } from './services/backblaze';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.UPLOAD_PORT || "5002", 10);
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Auth middleware
const isAuthenticated = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.user = { id: decoded.userId, userId: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|bmp|tiff|svg/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only image files are allowed.'));
    }
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ service: 'upload', status: 'OK', timestamp: new Date().toISOString() });
});

// Upload image
app.post('/api/v1/images/upload', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const user = req.user!;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, description, folder, isPublic } = req.body;

    const processedImageBuffer = await processImage(req.file.buffer);
    const imageInfo = await getImageInfo(req.file.buffer);

    const fileExtension = req.file.originalname.split('.').pop() || 'jpg';
    const filename = `${uuidv4()}.${fileExtension}`;

    let fileUrl: string;
    try {
      const uploadResult = await uploadToBackblaze(processedImageBuffer, filename, req.file.mimetype);
      fileUrl = uploadResult.fileUrl;
    } catch (uploadError) {
      console.error('Backblaze upload failed:', uploadError);
      fileUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${filename}`;
    }

    const [imageRecord] = await db.insert(images).values({
      id: uuidv4(),
      userId: user.id,
      filename,
      originalName: req.file.originalname,
      title: title || req.file.originalname,
      description: description || null,
      url: fileUrl,
      thumbnailUrl: fileUrl,
      size: req.file.size,
      mimeType: req.file.mimetype,
      width: imageInfo.width,
      height: imageInfo.height,
      folderId: folder || null,
      isPublic: isPublic === 'true'
    }).returning();

    res.json({
      success: true,
      image: imageRecord,
      message: 'Image uploaded successfully'
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`📤 Upload Server running on http://0.0.0.0:${PORT}`);
});
