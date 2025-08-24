import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { backblazeService } from "./services/backblaze";
import { ImageProcessor, type ImageTransformOptions } from "./services/imageProcessor";
import { insertImageSchema, insertApiKeySchema, insertCustomDomainSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import bcrypt from "bcrypt";
import crypto from "crypto";
import session from "express-session";

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

// Authentication schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

// Session configuration
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
});

// Authentication middleware - checks for session or API key
async function isAuthenticated(req: Request, res: Response, next: Function) {
  // Check for session-based authentication first
  if (req.session?.userId) {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          emailVerified: user.emailVerified || false,
        };
        return next();
      }
    } catch (error) {
      console.error('Session authentication error:', error);
    }
  }

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
            name: `${user.firstName} ${user.lastName}`,
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
  // Apply session middleware
  app.use(sessionMiddleware);

  // Registration endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = registerSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const userData = {
        email,
        firstName,
        lastName,
        passwordHash: hashedPassword,
        emailVerified: false,
        profileImageUrl: null,
      };

      const user = await storage.createUser(userData);

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      await storage.createEmailVerificationToken(user.id, verificationToken);

      // TODO: Send verification email
      console.log(`Verification token for ${email}: ${verificationToken}`);

      res.json({ 
        success: true, 
        message: 'Registration successful. Please check your email to verify your account.',
        userId: user.id 
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data' });
      }
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      // Get user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Create session
      req.session.userId = user.id;

      res.json({ 
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          emailVerified: user.emailVerified || false,
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data' });
      }
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  });

  // Get current user
  app.get('/api/auth/user', (req, res) => {
    if (req.session?.userId) {
      storage.getUser(req.session.userId)
        .then(user => {
          if (user) {
            res.json({
              id: user.id,
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              emailVerified: user.emailVerified || false,
            });
          } else {
            res.status(401).json({ message: 'User not found' });
          }
        })
        .catch(error => {
          console.error('Get user error:', error);
          res.status(500).json({ error: 'Failed to get user' });
        });
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  });

  // Forgot password endpoint
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists
        return res.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      await storage.createPasswordResetToken(user.id, resetToken);

      // TODO: Send reset email
      console.log(`Password reset token for ${email}: ${resetToken}`);

      res.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Failed to process request' });
    }
  });

  // Reset password endpoint
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);

      const tokenData = await storage.verifyPasswordResetToken(token);
      if (!tokenData) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user password
      await storage.updateUserPassword(tokenData.userId, hashedPassword);

      // Delete the token
      await storage.deletePasswordResetToken(token);

      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  });

  // Verify email endpoint
  app.post('/api/auth/verify-email', async (req, res) => {
    try {
      const { token } = z.object({ token: z.string() }).parse(req.body);

      const tokenData = await storage.verifyEmailToken(token);
      if (!tokenData) {
        return res.status(400).json({ error: 'Invalid or expired verification token' });
      }

      // Mark email as verified
      await storage.markEmailAsVerified(tokenData.userId);

      // Delete the token
      await storage.deleteEmailVerificationToken(token);

      res.json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
      console.error('Verify email error:', error);
      res.status(500).json({ error: 'Failed to verify email' });
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