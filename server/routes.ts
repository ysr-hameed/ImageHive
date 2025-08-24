import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { backblazeService } from "./services/backblaze";
import { ImageProcessor, type ImageTransformOptions } from "./services/imageProcessor";
import { insertImageSchema, insertApiKeySchema, insertCustomDomainSchema } from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (ImageProcessor.isImageFile(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Rate limiting for API endpoints
const createRateLimit = (windowMs: number, max: number) => 
  rateLimit({
    windowMs,
    max,
    message: { error: 'Rate limit exceeded' },
    standardHeaders: true,
    legacyHeaders: false,
  });

const apiRateLimit = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes
const uploadRateLimit = createRateLimit(60 * 1000, 10); // 10 uploads per minute

// Authentication middleware - checks for API key or session
async function isAuthenticated(req: Request, res: Response, next: Function) {
  // Check for API key in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const apiKey = authHeader.substring(7);
    try {
      const keyData = await storage.getApiKey(apiKey);
      if (keyData && keyData.isActive) {
        const user = await storage.getUser(keyData.userId);
        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified || false,
          };
          req.apiKey = keyData;
          return next();
        }
      }
    } catch (error) {
      console.error('API key authentication error:', error);
    }
  }

  // Check for session-based authentication (if implemented later)
  // For now, return unauthorized
  return res.status(401).json({ error: 'Authentication required' });
}

// API key authentication middleware (separate for API-only endpoints)
async function authenticateApiKey(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'API key required' });
  }

  const apiKey = authHeader.substring(7);
  try {
    const keyData = await storage.getApiKey(apiKey);
    if (!keyData || !keyData.isActive) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Check rate limits based on user's plan
    const user = await storage.getUser(keyData.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified || false,
    };
    req.apiKey = keyData;
    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

export function registerRoutes(app: Express): Server {
  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      // TODO: Implement user registration
      res.status(501).json({ error: 'Registration not yet implemented' });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      // TODO: Implement user login
      res.status(501).json({ error: 'Login not yet implemented' });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    // TODO: Implement logout
    res.json({ success: true });
  });

  app.get('/api/auth/user', (req, res) => {
    if (req.user) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  });

  // Upload endpoint - requires authentication
  app.post('/api/upload', isAuthenticated, uploadRateLimit, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const user = req.user!;

      // Check storage limits
      const userData = await storage.getUser(user.id);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (userData.storageUsed + req.file.size > userData.storageLimit) {
        return res.status(413).json({ error: 'Storage limit exceeded' });
      }

      // Process image with transforms if provided
      let processedBuffer = req.file.buffer;
      const transforms: ImageTransformOptions = {};

      // Parse transform parameters
      if (req.body.width) transforms.width = parseInt(req.body.width);
      if (req.body.height) transforms.height = parseInt(req.body.height);
      if (req.body.quality) transforms.quality = parseInt(req.body.quality);
      if (req.body.format) transforms.format = req.body.format;
      if (req.body.blur) transforms.blur = parseFloat(req.body.blur);
      if (req.body.sharpen) transforms.sharpen = parseFloat(req.body.sharpen);
      if (req.body.brightness) transforms.brightness = parseFloat(req.body.brightness);
      if (req.body.contrast) transforms.contrast = parseFloat(req.body.contrast);
      if (req.body.saturation) transforms.saturation = parseFloat(req.body.saturation);
      if (req.body.hue) transforms.hue = parseInt(req.body.hue);
      if (req.body.sepia) transforms.sepia = req.body.sepia === 'true';
      if (req.body.grayscale) transforms.grayscale = req.body.grayscale === 'true';
      if (req.body.invert) transforms.invert = req.body.invert === 'true';

      // Apply transforms if any are specified
      if (Object.keys(transforms).length > 0) {
        processedBuffer = await ImageProcessor.processImage(processedBuffer, transforms);
      }

      // Upload to Backblaze
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const uploadResult = await backblazeService.uploadFile(processedBuffer, fileName, req.file.mimetype);

      // Create image record
      const imageData = {
        title: req.body.title || req.file.originalname,
        description: req.body.description || '',
        filename: fileName,
        originalFilename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: processedBuffer.length,
        width: 0, // Will be updated after processing
        height: 0, // Will be updated after processing
        isPublic: req.body.isPublic === 'true',
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        backblazeFileId: uploadResult.fileId,
        backblazeFileName: uploadResult.fileName,
        cdnUrl: uploadResult.downloadUrl,
      };

      // Get image dimensions
      const metadata = await ImageProcessor.getImageMetadata(processedBuffer);
      imageData.width = metadata.width || 0;
      imageData.height = metadata.height || 0;

      const image = await storage.createImage(user.id, imageData);

      res.json({
        success: true,
        image: {
          id: image.id,
          title: image.title,
          url: image.cdnUrl,
          thumbnailUrl: `${image.cdnUrl}?w=300&h=300&fit=cover`,
          width: image.width,
          height: image.height,
          size: image.size,
          mimeType: image.mimeType,
          isPublic: image.isPublic,
          createdAt: image.createdAt,
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  // Get user's images
  app.get('/api/images', isAuthenticated, async (req, res) => {
    try {
      const user = req.user!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const images = await storage.getUserImages(user.id, limit, offset);

      const formattedImages = images.map(image => ({
        id: image.id,
        title: image.title,
        description: image.description,
        url: image.cdnUrl,
        thumbnailUrl: `${image.cdnUrl}?w=300&h=300&fit=cover`,
        width: image.width,
        height: image.height,
        size: image.size,
        mimeType: image.mimeType,
        isPublic: image.isPublic,
        tags: image.tags,
        views: image.views,
        downloads: image.downloads,
        createdAt: image.createdAt,
        updatedAt: image.updatedAt,
      }));

      res.json({
        images: formattedImages,
        pagination: {
          page,
          limit,
          hasMore: images.length === limit,
        }
      });
    } catch (error) {
      console.error('Get images error:', error);
      res.status(500).json({ error: 'Failed to fetch images' });
    }
  });

  // Get public images
  app.get('/api/public/images', async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const images = await storage.getPublicImages(limit, offset);

      const formattedImages = images.map(image => ({
        id: image.id,
        title: image.title,
        url: image.cdnUrl,
        thumbnailUrl: `${image.cdnUrl}?w=300&h=300&fit=cover`,
        width: image.width,
        height: image.height,
        size: image.size,
        mimeType: image.mimeType,
        tags: image.tags,
        views: image.views,
        downloads: image.downloads,
        createdAt: image.createdAt,
      }));

      res.json({
        images: formattedImages,
        pagination: {
          page,
          limit,
          hasMore: images.length === limit,
        }
      });
    } catch (error) {
      console.error('Get public images error:', error);
      res.status(500).json({ error: 'Failed to fetch public images' });
    }
  });

  // API Keys management
  app.get('/api/api-keys', isAuthenticated, async (req, res) => {
    try {
      const user = req.user!;
      const apiKeys = await storage.getUserApiKeys(user.id);

      const formattedKeys = apiKeys.map(key => ({
        id: key.id,
        name: key.name,
        keyPreview: `${key.keyHash.substring(0, 8)}...`,
        isActive: key.isActive,
        lastUsed: key.lastUsed,
        createdAt: key.createdAt,
      }));

      res.json({ apiKeys: formattedKeys });
    } catch (error) {
      console.error('Get API keys error:', error);
      res.status(500).json({ error: 'Failed to fetch API keys' });
    }
  });

  app.post('/api/api-keys', isAuthenticated, async (req, res) => {
    try {
      const user = req.user!;
      const { name } = insertApiKeySchema.parse(req.body);

      const apiKey = await storage.createApiKey(user.id, { name });

      res.json({
        success: true,
        apiKey: {
          id: apiKey.id,
          name: apiKey.name,
          key: apiKey.keyHash, // Return full key only on creation
          createdAt: apiKey.createdAt,
        }
      });
    } catch (error) {
      console.error('Create API key error:', error);
      res.status(500).json({ error: 'Failed to create API key' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}