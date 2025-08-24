import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
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

// API key authentication middleware
const authenticateApiKey = async (req: any, res: Response, next: Function) => {
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    const key = await storage.getApiKey(apiKey);
    if (!key) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    await storage.updateApiKeyUsage(key.id);
    req.apiKey = key;
    req.user = { claims: { sub: key.userId } };
    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Image upload endpoint (supports both authenticated users and API keys)
  app.post('/api/v1/images/upload', apiRateLimit, uploadRateLimit, upload.single('image'), async (req: any, res) => {
    try {
      // Try API key authentication first
      const apiKey = req.headers.authorization?.replace('Bearer ', '');
      let userId: string;

      if (apiKey) {
        const key = await storage.getApiKey(apiKey);
        if (!key) {
          return res.status(401).json({ error: 'Invalid API key' });
        }
        userId = key.userId;
        await storage.updateApiKeyUsage(key.id);
      } else if (req.isAuthenticated()) {
        userId = req.user.claims.sub;
      } else {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Validate and parse upload parameters
      const uploadParams = {
        privacy: req.body.privacy || 'public',
        description: req.body.description,
        altText: req.body.altText,
        tags: req.body.tags ? req.body.tags.split(',').map((tag: string) => tag.trim()) : [],
        quality: parseInt(req.body.quality) || 80,
        format: req.body.format,
        width: req.body.width ? parseInt(req.body.width) : undefined,
        height: req.body.height ? parseInt(req.body.height) : undefined,
      };

      // Process image if transformation parameters are provided
      let processedBuffer = req.file.buffer;
      let contentType = req.file.mimetype;

      const transformOptions: ImageTransformOptions = {};
      if (uploadParams.width) transformOptions.width = uploadParams.width;
      if (uploadParams.height) transformOptions.height = uploadParams.height;
      if (uploadParams.format) transformOptions.format = uploadParams.format as any;
      if (uploadParams.quality) transformOptions.quality = uploadParams.quality;

      if (Object.keys(transformOptions).length > 0) {
        processedBuffer = await ImageProcessor.processImage(req.file.buffer, transformOptions);
        if (uploadParams.format) {
          contentType = `image/${uploadParams.format}`;
        }
      }

      // Get image metadata
      const metadata = await ImageProcessor.getImageMetadata(processedBuffer);

      // Upload to Backblaze B2
      const uploadResult = await backblazeService.uploadFile(
        processedBuffer,
        req.file.originalname,
        contentType,
        {
          userId,
          privacy: uploadParams.privacy,
          description: uploadParams.description || '',
        }
      );

      // Save image record to database
      const imageData = {
        filename: uploadResult.fileName,
        originalName: req.file.originalname,
        mimeType: contentType,
        size: processedBuffer.length,
        width: metadata.width || null,
        height: metadata.height || null,
        privacy: uploadParams.privacy as 'public' | 'private',
        description: uploadParams.description,
        altText: uploadParams.altText,
        tags: uploadParams.tags,
        backblazeFileId: uploadResult.fileId,
        backblazeFileName: uploadResult.fileName,
        cdnUrl: backblazeService.getFileUrl(uploadResult.fileName),
      };

      const image = await storage.createImage(userId, imageData);

      await storage.createSystemLog('info', `Image uploaded: ${image.filename}`, userId);

      res.status(201).json({
        success: true,
        id: image.id,
        url: image.cdnUrl,
        filename: image.filename,
        size: image.size,
        dimensions: {
          width: image.width,
          height: image.height,
        },
        privacy: image.privacy,
      });
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await storage.createSystemLog('error', `Image upload failed: ${errorMessage}`, req.user?.claims?.sub);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  // Get image by ID
  app.get('/api/v1/images/:id', apiRateLimit, async (req, res) => {
    try {
      const image = await storage.getImage(req.params.id);
      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }

      // Check privacy permissions
      if (image.privacy === 'private') {
        const apiKey = req.headers.authorization?.replace('Bearer ', '');
        let userId: string | null = null;

        if (apiKey) {
          const key = await storage.getApiKey(apiKey);
          userId = key?.userId || null;
        } else if (req.isAuthenticated()) {
          userId = req.user.claims.sub;
        }

        if (!userId || userId !== image.userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      await storage.incrementImageView(image.id);
      await storage.recordImageAnalytic(image.id, 'view', {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        referer: req.headers.referer,
      });

      res.json(image);
    } catch (error) {
      console.error('Get image error:', error);
      res.status(500).json({ error: 'Failed to fetch image' });
    }
  });

  // Get user's images
  app.get('/api/v1/images', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const images = await storage.getUserImages(userId, limit, offset);
      res.json({ images, limit, offset });
    } catch (error) {
      console.error('Get user images error:', error);
      res.status(500).json({ error: 'Failed to fetch images' });
    }
  });

  // Update image
  app.put('/api/v1/images/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const image = await storage.getImage(req.params.id);

      if (!image || image.userId !== userId) {
        return res.status(404).json({ error: 'Image not found' });
      }

      const updateData = {
        privacy: req.body.privacy,
        description: req.body.description,
        altText: req.body.altText,
        tags: req.body.tags ? req.body.tags.split(',').map((tag: string) => tag.trim()) : undefined,
      };

      const updatedImage = await storage.updateImage(req.params.id, updateData);
      res.json(updatedImage);
    } catch (error) {
      console.error('Update image error:', error);
      res.status(500).json({ error: 'Failed to update image' });
    }
  });

  // Delete image
  app.delete('/api/v1/images/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const image = await storage.getImage(req.params.id);

      if (!image || image.userId !== userId) {
        return res.status(404).json({ error: 'Image not found' });
      }

      // Delete from Backblaze B2
      if (image.backblazeFileId && image.backblazeFileName) {
        await backblazeService.deleteFile(image.backblazeFileId, image.backblazeFileName);
      }

      await storage.deleteImage(req.params.id);
      await storage.createSystemLog('info', `Image deleted: ${image.filename}`, userId);

      res.json({ success: true });
    } catch (error) {
      console.error('Delete image error:', error);
      res.status(500).json({ error: 'Failed to delete image' });
    }
  });

  // Get public images
  app.get('/api/v1/public/images', apiRateLimit, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const images = await storage.getPublicImages(limit, offset);
      res.json({ images, limit, offset });
    } catch (error) {
      console.error('Get public images error:', error);
      res.status(500).json({ error: 'Failed to fetch images' });
    }
  });

  // API Key management
  app.post('/api/v1/api-keys', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const keyData = insertApiKeySchema.parse(req.body);

      const apiKey = await storage.createApiKey(userId, keyData);
      res.status(201).json(apiKey);
    } catch (error) {
      console.error('Create API key error:', error);
      res.status(500).json({ error: 'Failed to create API key' });
    }
  });

  app.get('/api/v1/api-keys', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const apiKeys = await storage.getUserApiKeys(userId);
      res.json(apiKeys);
    } catch (error) {
      console.error('Get API keys error:', error);
      res.status(500).json({ error: 'Failed to fetch API keys' });
    }
  });

  app.delete('/api/v1/api-keys/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const apiKeys = await storage.getUserApiKeys(userId);
      const apiKey = apiKeys.find(key => key.id === req.params.id);

      if (!apiKey) {
        return res.status(404).json({ error: 'API key not found' });
      }

      await storage.deactivateApiKey(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete API key error:', error);
      res.status(500).json({ error: 'Failed to delete API key' });
    }
  });

  // User analytics
  app.get('/api/v1/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analytics = await storage.getUserAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  // Admin routes
  app.get('/api/v1/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error('Get admin stats error:', error);
      res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
  });

  app.get('/api/v1/admin/logs', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getSystemLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error('Get admin logs error:', error);
      res.status(500).json({ error: 'Failed to fetch logs' });
    }
  });

  // Image proxy with transformations
  app.get('/api/v1/transform/:id', apiRateLimit, async (req, res) => {
    try {
      const image = await storage.getImage(req.params.id);
      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }

      // Check privacy permissions
      if (image.privacy === 'private') {
        const apiKey = req.headers.authorization?.replace('Bearer ', '');
        let userId: string | null = null;

        if (apiKey) {
          const key = await storage.getApiKey(apiKey);
          userId = key?.userId || null;
        } else if (req.isAuthenticated()) {
          userId = req.user.claims.sub;
        }

        if (!userId || userId !== image.userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      // Parse transformation parameters
      const transformOptions: ImageTransformOptions = {};
      if (req.query.w) transformOptions.width = parseInt(req.query.w as string);
      if (req.query.h) transformOptions.height = parseInt(req.query.h as string);
      if (req.query.q) transformOptions.quality = parseInt(req.query.q as string);
      if (req.query.f) transformOptions.format = req.query.f as any;
      if (req.query.blur) transformOptions.blur = parseInt(req.query.blur as string);
      if (req.query.sharpen === 'true') transformOptions.sharpen = true;
      if (req.query.grayscale === 'true') transformOptions.grayscale = true;
      if (req.query.rotate) transformOptions.rotate = parseInt(req.query.rotate as string);

      // Fetch original image from Backblaze
      const imageResponse = await fetch(image.cdnUrl!);
      if (!imageResponse.ok) {
        return res.status(404).json({ error: 'Image file not found' });
      }

      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

      // Apply transformations if any
      let finalBuffer = imageBuffer;
      if (Object.keys(transformOptions).length > 0) {
        finalBuffer = await ImageProcessor.processImage(imageBuffer, transformOptions);
      }

      // Set appropriate headers
      const contentType = transformOptions.format 
        ? `image/${transformOptions.format}` 
        : image.mimeType;

      res.set({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // 1 year
        'ETag': `"${image.id}-${JSON.stringify(transformOptions)}"`,
      });

      // Record analytics
      await storage.recordImageAnalytic(image.id, 'transform', {
        transformations: transformOptions,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        referer: req.headers.referer,
      });

      res.send(finalBuffer);
    } catch (error) {
      console.error('Transform image error:', error);
      res.status(500).json({ error: 'Failed to transform image' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
