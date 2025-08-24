import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { backblazeService } from "./services/backblaze";
import { ImageProcessor, type ImageTransformOptions } from "./services/imageProcessor";
import { emailService } from "./services/emailService";
import { insertImageSchema, insertApiKeySchema, insertCustomDomainSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import bcrypt from "bcrypt";
import crypto from "crypto";
import session from "express-session";

// Extend Express Request type to include session properties
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        emailVerified: boolean;
        plan: string;
        storageUsed: number;
        storageLimit: number;
      };
      apiKey?: any;
    }
  }
}

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
    secure: process.env.STATUS === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.STATUS === 'production' ? 'strict' : 'lax',
  },
  name: 'imagevault.session',
});

// Authentication middleware - checks for session or API key
async function isAuthenticated(req: Request, res: Response, next: Function) {
  try {
    // Check for session-based authentication first
    if (req.session?.userId) {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        // Require email verification for web sessions
        if (!user.emailVerified) {
          req.session.destroy(() => {});
          return res.status(403).json({ 
            error: 'Email verification required',
            code: 'EMAIL_NOT_VERIFIED' 
          });
        }
        
        req.user = {
          id: user.id,
          email: user.email || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          name: `${user.firstName || ''} ${user.lastName || ''}`,
          emailVerified: user.emailVerified || false,
          isAdmin: user.isAdmin || false,
          plan: user.plan || 'free',
          apiRequestsUsed: user.apiRequestsUsed || 0,
          apiRequestsLimit: user.apiRequestsLimit || 1000,
          storageUsed: user.storageUsed || 0,
          storageLimit: user.storageLimit || 1024 * 1024 * 1024, // 1GB default
        };
        return next();
      }
    }

    // Check for API key in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const apiKey = authHeader.substring(7);
      const keyData = await storage.getApiKey(apiKey);
      if (keyData && keyData.isActive) {
        const user = await storage.getUser(keyData.userId);
        if (user) {
          req.user = {
            id: user.id,
            email: user.email || '',
            name: `${user.firstName || ''} ${user.lastName || ''}`,
            emailVerified: user.emailVerified || false,
            plan: user.plan || 'free',
            storageUsed: user.storageUsed || 0,
            storageLimit: user.storageLimit || 1024 * 1024 * 1024,
          };
          req.apiKey = keyData;
          return next();
        }
      }
    }

    return res.status(401).json({ error: 'Authentication required' });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
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
      email: user.email || '',
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      emailVerified: user.emailVerified || false,
      plan: user.plan || 'free',
      storageUsed: user.storageUsed || 0,
      storageLimit: user.storageLimit || 1024 * 1024 * 1024,
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
        plan: 'free',
        storageUsed: 0,
        storageLimit: 1024 * 1024 * 1024, // 1GB
      };

      const user = await storage.createUser(userData);

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      await storage.createEmailVerificationToken(user.id, verificationToken);

      // Send verification email
      try {
        const emailSent = await emailService.sendVerificationEmail(email, verificationToken);
        if (emailSent) {
          console.log(`Verification email sent to ${email}`);
        } else {
          console.error(`Failed to send verification email to ${email}`);
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
      }

      res.json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        userId: user.id
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
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

      // Check email verification requirement
      if (!user.emailVerified) {
        return res.status(403).json({ 
          error: 'Email verification required', 
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Please verify your email address before logging in. Check your inbox for the verification email.' 
        });
      }

      // Create session
      req.session.userId = user.id;

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          name: `${user.firstName} ${user.lastName}`,
          emailVerified: user.emailVerified || false,
          isAdmin: user.isAdmin || false,
          plan: user.plan || 'free',
          apiRequestsUsed: user.apiRequestsUsed || 0,
          apiRequestsLimit: user.apiRequestsLimit || 1000,
          storageUsed: user.storageUsed || 0,
          storageLimit: user.storageLimit || 1024 * 1024 * 1024,
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
  app.get('/api/auth/user', async (req, res) => {
    if (req.session?.userId) {
      try {
        const user = await storage.getUser(req.session.userId);
        if (user) {
          res.json({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            name: `${user.firstName} ${user.lastName}`,
            emailVerified: user.emailVerified || false,
            isAdmin: user.isAdmin || false,
            plan: user.plan || 'free',
            apiRequestsUsed: user.apiRequestsUsed || 0,
            apiRequestsLimit: user.apiRequestsLimit || 1000,
            storageUsed: user.storageUsed || 0,
            storageLimit: user.storageLimit || 1024 * 1024 * 1024,
          });
        } else {
          res.status(401).json({ message: 'User not found' });
        }
      } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
      }
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  });

  // Resend email verification endpoint
  app.post('/api/auth/resend-verification', async (req, res) => {
    try {
      const { email } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.emailVerified) {
        return res.status(400).json({ error: 'Email already verified' });
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      await storage.createEmailVerificationToken(user.id, verificationToken);

      // Send verification email
      try {
        const emailSent = await emailService.sendVerificationEmail(email, verificationToken);
        if (emailSent) {
          console.log(`Verification email resent to ${email}`);
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
      }

      res.json({ success: true, message: 'Verification email sent' });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ error: 'Failed to resend verification email' });
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

      // Send reset email
      try {
        const emailSent = await emailService.sendPasswordResetEmail(email, resetToken);
        if (emailSent) {
          console.log(`Password reset email sent to ${email}`);
        } else {
          console.error(`Failed to send password reset email to ${email}`);
        }
      } catch (emailError) {
        console.error('Password reset email error:', emailError);
      }

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
      if (tokenData.id) {
        await storage.updateUserPassword(tokenData.id, hashedPassword);
      }

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
      if (tokenData.id) {
        await storage.markEmailAsVerified(tokenData.id);
      }

      // Delete the token
      await storage.deleteEmailVerificationToken(token);

      res.json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
      console.error('Verify email error:', error);
      res.status(500).json({ error: 'Failed to verify email' });
    }
  });

  // Google OAuth endpoints
  app.get('/api/auth/google', (req, res) => {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const isProduction = process.env.STATUS === 'production';
    const baseUrl = isProduction 
      ? process.env.BASE_URL || `https://${req.get('host')}`
      : `http://0.0.0.0:5000`;

    if (!googleClientId) {
      return res.redirect('/login?error=oauth_not_configured');
    }

    const redirectUri = `${baseUrl}/api/auth/google/callback`;
    const scope = 'openid profile email';
    const googleAuthUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${googleClientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=code&` +
      `access_type=offline`;

    res.redirect(googleAuthUrl);
  });

  app.get('/api/auth/google/callback', async (req, res) => {
    try {
      const { code, error } = req.query;

      if (error) {
        console.error('Google OAuth error:', error);
        return res.redirect('/login?error=oauth_failed');
      }

      if (!code) {
        return res.redirect('/login?error=oauth_failed');
      }

      const googleClientId = process.env.GOOGLE_CLIENT_ID;
      const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const isProduction = process.env.STATUS === 'production';
      const baseUrl = isProduction 
        ? process.env.BASE_URL || `https://${req.get('host')}`
        : `http://0.0.0.0:5000`;

      if (!googleClientId || !googleClientSecret) {
        return res.redirect('/login?error=oauth_not_configured');
      }

      // Exchange code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: googleClientId,
          client_secret: googleClientSecret,
          code: code as string,
          grant_type: 'authorization_code',
          redirect_uri: `${baseUrl}/api/auth/google/callback`,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        console.error('Google token exchange failed:', tokenData);
        return res.redirect('/login?error=oauth_failed');
      }

      // Get user info from Google
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const googleUser = await userResponse.json();

      if (!userResponse.ok) {
        console.error('Google user info failed:', googleUser);
        return res.redirect('/login?error=oauth_failed');
      }

      // Check if user exists
      let user = await storage.getUserByEmail(googleUser.email);

      if (!user) {
        // Create new user
        const userData = {
          email: googleUser.email,
          firstName: googleUser.given_name || googleUser.name.split(' ')[0] || '',
          lastName: googleUser.family_name || googleUser.name.split(' ').slice(1).join(' ') || '',
          passwordHash: null, // OAuth users don't have passwords
          emailVerified: true, // Google emails are pre-verified
          profileImageUrl: googleUser.picture || null,
          plan: 'free',
          storageUsed: 0,
          storageLimit: 1024 * 1024 * 1024, // 1GB
        };

        user = await storage.createUser(userData);
      } else if (!user.emailVerified) {
        // Mark email as verified for existing users
        await storage.markEmailAsVerified(user.id);
      }

      // Create session
      req.session.userId = user.id;

      res.redirect('/dashboard');
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect('/login?error=oauth_failed');
    }
  });

  // GitHub OAuth endpoints
  app.get('/api/auth/github', (req, res) => {
    const githubClientId = process.env.GITHUB_CLIENT_ID;

    if (!githubClientId) {
      return res.redirect('/login?error=oauth_not_configured');
    }

    const isProduction = process.env.STATUS === 'production';
    const baseUrl = isProduction 
      ? process.env.BASE_URL || `https://${req.get('host')}`
      : `http://0.0.0.0:5000`;

    const redirectUri = `${baseUrl}/api/auth/github/callback`;
    const scope = 'user:email';
    const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
      `client_id=${githubClientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}`;

    res.redirect(githubAuthUrl);
  });

  app.get('/api/auth/github/callback', async (req, res) => {
    try {
      const { code, error } = req.query;

      if (error) {
        console.error('GitHub OAuth error:', error);
        return res.redirect('/login?error=oauth_failed');
      }

      if (!code) {
        return res.redirect('/login?error=oauth_failed');
      }

      const githubClientId = process.env.GITHUB_CLIENT_ID;
      const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

      if (!githubClientId || !githubClientSecret) {
        return res.redirect('/login?error=oauth_not_configured');
      }

      // Exchange code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: githubClientId,
          client_secret: githubClientSecret,
          code: code as string,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || tokenData.error) {
        console.error('GitHub token exchange failed:', tokenData);
        return res.redirect('/login?error=oauth_failed');
      }

      // Get user info from GitHub
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'Your-App-Name',
        },
      });

      const githubUser = await userResponse.json();

      if (!userResponse.ok) {
        console.error('GitHub user info failed:', githubUser);
        return res.redirect('/login?error=oauth_failed');
      }

      // Get user emails from GitHub (primary email might be private)
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'Your-App-Name',
        },
      });

      const emails = await emailResponse.json();
      const primaryEmail = emails.find((email: any) => email.primary)?.email || githubUser.email;

      if (!primaryEmail) {
        console.error('No email found for GitHub user');
        return res.redirect('/login?error=oauth_no_email');
      }

      // Check if user exists
      let user = await storage.getUserByEmail(primaryEmail);

      if (!user) {
        // Create new user
        const userData = {
          email: primaryEmail,
          firstName: githubUser.name?.split(' ')[0] || githubUser.login || '',
          lastName: githubUser.name?.split(' ').slice(1).join(' ') || '',
          passwordHash: null, // OAuth users don't have passwords
          emailVerified: true, // GitHub emails are pre-verified
          profileImageUrl: githubUser.avatar_url || null,
          plan: 'free',
          storageUsed: 0,
          storageLimit: 1024 * 1024 * 1024, // 1GB
        };

        user = await storage.createUser(userData);
      } else if (!user.emailVerified) {
        // Mark email as verified for existing users
        await storage.markEmailAsVerified(user.id);
      }

      // Create session
      req.session.userId = user.id;

      res.redirect('/dashboard');
    } catch (error) {
      console.error('GitHub OAuth callback error:', error);
      res.redirect('/login?error=oauth_failed');
    }
  });

  // Upload endpoint - requires authentication with folder path support
  app.post('/api/v1/images/upload', isAuthenticated, uploadRateLimit, upload.single('image'), async (req, res) => {
    console.log('Upload endpoint hit:', req.method, req.path);
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const user = req.user!;
      const folder = req.body.folder || ''; // Optional folder path for organization

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
      if (req.body.sharpen) transforms.sharpen = req.body.sharpen === 'true';
      if (req.body.brightness) transforms.brightness = parseFloat(req.body.brightness);
      if (req.body.contrast) transforms.contrast = parseFloat(req.body.contrast);
      if (req.body.saturation) transforms.saturation = parseFloat(req.body.saturation);
      if (req.body.hue) transforms.hue = parseInt(req.body.hue);
      if (req.body.grayscale) transforms.grayscale = req.body.grayscale === 'true';

      // Apply transforms if any are specified
      if (Object.keys(transforms).length > 0) {
        processedBuffer = await ImageProcessor.processImage(processedBuffer, transforms);
      }

      // Create folder structure: userId/folder/filename
      const folderPath = folder ? `${folder}/` : '';
      const fileName = `${user.id}/${folderPath}${Date.now()}-${req.file.originalname}`;

      // Upload to Backblaze
      const uploadResult = await backblazeService.uploadFile(processedBuffer, fileName, req.file.mimetype);

      // Get image dimensions
      const metadata = await ImageProcessor.getImageMetadata(processedBuffer);

      // Create custom CDN URL
      const customDomain = await storage.getUserCustomDomain(user.id);
      let cdnUrl = uploadResult.downloadUrl;

      if (customDomain && customDomain.isVerified) {
        // Use custom domain instead of Backblaze URL
        cdnUrl = `https://${customDomain.domain}/${fileName}`;
      }

      // Create image record
      const imageData = {
        title: req.body.title || req.file.originalname,
        description: req.body.description || '',
        filename: fileName,
        originalFilename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: processedBuffer.length,
        width: metadata.width || 0,
        height: metadata.height || 0,
        isPublic: true, // Make all images public by default
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        backblazeFileId: uploadResult.fileId,
        backblazeFileName: uploadResult.fileName,
        cdnUrl: cdnUrl,
        folder: folder,
      };

      const image = await storage.createImage(user.id, imageData);

      // Update user storage usage
      await storage.updateUserStorageUsage(user.id, userData.storageUsed + processedBuffer.length);

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
          folder: image.folder,
          createdAt: image.createdAt,
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Legacy upload endpoint for backward compatibility
  app.post('/api/upload', isAuthenticated, uploadRateLimit, upload.single('image'), async (req, res) => {
    console.log('Legacy upload endpoint hit:', req.method, req.path);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('File info:', req.file ? { name: req.file.originalname, size: req.file.size, mimetype: req.file.mimetype } : 'No file');
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const user = req.user!;
      const folder = req.body.folder || '';

      // Check storage limits
      const userData = await storage.getUser(user.id);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (userData.storageUsed + req.file.size > userData.storageLimit) {
        return res.status(413).json({ error: 'Storage limit exceeded' });
      }

      // Process image with all transforms
      let processedBuffer = req.file.buffer;
      const transforms: ImageTransformOptions = {};

      // Parse transform parameters with better validation
      if (req.body.width && !isNaN(parseInt(req.body.width))) {
        transforms.width = parseInt(req.body.width);
      }
      if (req.body.height && !isNaN(parseInt(req.body.height))) {
        transforms.height = parseInt(req.body.height);
      }
      if (req.body.quality && !isNaN(parseInt(req.body.quality))) {
        transforms.quality = Math.max(1, Math.min(100, parseInt(req.body.quality)));
      }
      if (req.body.format && ['jpeg', 'png', 'webp', 'avif'].includes(req.body.format)) {
        transforms.format = req.body.format;
      }
      if (req.body.fit && ['cover', 'contain', 'fill', 'inside', 'outside'].includes(req.body.fit)) {
        transforms.fit = req.body.fit;
      }
      if (req.body.blur && !isNaN(parseFloat(req.body.blur))) {
        transforms.blur = parseFloat(req.body.blur);
      }
      if (req.body.brightness && !isNaN(parseFloat(req.body.brightness))) {
        transforms.brightness = parseFloat(req.body.brightness);
      }
      if (req.body.contrast && !isNaN(parseFloat(req.body.contrast))) {
        transforms.contrast = parseFloat(req.body.contrast);
      }
      if (req.body.saturation && !isNaN(parseFloat(req.body.saturation))) {
        transforms.saturation = parseFloat(req.body.saturation);
      }
      if (req.body.hue && !isNaN(parseInt(req.body.hue))) {
        transforms.hue = parseInt(req.body.hue);
      }
      if (req.body.rotate && !isNaN(parseInt(req.body.rotate))) {
        transforms.rotate = parseInt(req.body.rotate);
      }
      if (req.body.grayscale === 'true') {
        transforms.grayscale = true;
      }
      if (req.body.sharpen === 'true') {
        transforms.sharpen = true;
      }

      console.log('Applied transforms:', transforms);

      // Apply transforms if any are specified
      if (Object.keys(transforms).length > 0) {
        processedBuffer = await ImageProcessor.processImage(processedBuffer, transforms);
      }

      // Create folder structure: userId/folder/filename
      const folderPath = folder ? `${folder}/` : '';
      const fileName = `${user.id}/${folderPath}${Date.now()}-${req.file.originalname}`;

      // Upload to Backblaze
      const uploadResult = await backblazeService.uploadFile(processedBuffer, fileName, req.file.mimetype);

      // Get image dimensions
      const metadata = await ImageProcessor.getImageMetadata(processedBuffer);

      // Create custom CDN URL
      const customDomain = await storage.getUserCustomDomain(user.id);
      let cdnUrl = uploadResult.downloadUrl;

      if (customDomain && customDomain.isVerified) {
        cdnUrl = `https://${customDomain.domain}/${fileName}`;
      }

      // Parse tags properly
      let tags = [];
      if (req.body.tags) {
        try {
          if (typeof req.body.tags === 'string') {
            // If it's a JSON string, parse it
            if (req.body.tags.startsWith('[') || req.body.tags.startsWith('{')) {
              tags = JSON.parse(req.body.tags);
            } else {
              // If it's comma-separated, split it
              tags = req.body.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
            }
          } else if (Array.isArray(req.body.tags)) {
            tags = req.body.tags;
          }
        } catch (e) {
          console.log('Failed to parse tags:', e);
          tags = [];
        }
      }

      // Create image record
      const imageData = {
        title: req.body.title || req.file.originalname,
        description: req.body.description || '',
        filename: fileName,
        originalFilename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: processedBuffer.length,
        width: metadata.width || 0,
        height: metadata.height || 0,
        isPublic: req.body.isPublic !== 'false', // Default to true unless explicitly false
        tags: tags,
        backblazeFileId: uploadResult.fileId,
        backblazeFileName: uploadResult.fileName,
        cdnUrl: cdnUrl,
        folder: folder,
      };

      const image = await storage.createImage(user.id, imageData);

      // Update user storage usage
      await storage.updateUserStorageUsage(user.id, userData.storageUsed + processedBuffer.length);

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
          folder: image.folder,
          tags: image.tags,
          createdAt: image.createdAt,
        }
      });
    } catch (error) {
      console.error('Legacy upload error:', error);
      res.status(500).json({ error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get user folders
  app.get('/api/v1/folders', isAuthenticated, async (req, res) => {
    try {
      const user = req.user!;
      const images = await storage.getUserImages(user.id, 1000, 0, '');
      
      // Extract unique folders from images
      const folderSet = new Set(images.map(img => img.folder).filter(Boolean));
      const folders = Array.from(folderSet);
      const folderStats = folders.map(folder => ({
        name: folder,
        count: images.filter(img => img.folder === folder).length
      }));
      
      res.json(folderStats);
    } catch (error) {
      console.error('Get folders error:', error);
      res.status(500).json({ error: 'Failed to fetch folders' });
    }
  });

  // Get user's images with folder filtering
  app.get('/api/v1/images', isAuthenticated, async (req, res) => {
    try {
      const user = req.user!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const folder = req.query.folder as string || '';
      const offset = (page - 1) * limit;

      const images = await storage.getUserImages(user.id, limit, offset, folder);

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
        folder: image.folder,
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

  // Legacy images endpoint
  app.get('/api/images', isAuthenticated, async (req, res) => {
    req.url = '/api/v1/images';
    return app._router.handle(req, res);
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
  app.get('/api/v1/api-keys', isAuthenticated, async (req, res) => {
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

  app.post('/api/v1/api-keys', isAuthenticated, async (req, res) => {
    try {
      const user = req.user!;
      const { name } = z.object({ name: z.string().min(1) }).parse(req.body);

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
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data' });
      }
      res.status(500).json({ error: 'Failed to create API key' });
    }
  });

  // Legacy API keys endpoints
  app.get('/api/api-keys', isAuthenticated, async (req, res) => {
    req.url = '/api/v1/api-keys';
    return app._router.handle(req, res);
  });

  app.post('/api/api-keys', isAuthenticated, async (req, res) => {
    req.url = '/api/v1/api-keys';
    return app._router.handle(req, res);
  });

  // Analytics endpoint
  app.get('/api/v1/analytics', isAuthenticated, async (req, res) => {
    try {
      const user = req.user!;
      const analytics = await storage.getUserAnalytics(user.id);
      res.json(analytics);
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  // Custom domains management
  app.get('/api/v1/domains', isAuthenticated, async (req, res) => {
    try {
      const user = req.user!;
      const domains = await storage.getUserCustomDomains(user.id);
      res.json({ domains });
    } catch (error) {
      console.error('Get domains error:', error);
      res.status(500).json({ error: 'Failed to fetch domains' });
    }
  });

  app.post('/api/v1/domains', isAuthenticated, async (req, res) => {
    try {
      const user = req.user!;
      const { domain } = z.object({ domain: z.string().min(1) }).parse(req.body);

      // Generate verification records
      const verificationToken = crypto.randomBytes(16).toString('hex');
      const cnameTarget = process.env.CUSTOM_DOMAIN_CNAME_TARGET || 'cdn.yourdomain.com';

      const domainRecord = await storage.createCustomDomain(user.id, {
        domain,
        verificationToken,
        cnameTarget,
      });

      res.json({
        success: true,
        domain: domainRecord,
        dnsRecords: {
          cname: {
            name: domain,
            value: cnameTarget,
            type: 'CNAME'
          },
          txt: {
            name: `_verification.${domain}`,
            value: verificationToken,
            type: 'TXT'
          }
        },
        instructions: {
          step1: `Add a CNAME record for ${domain} pointing to ${cnameTarget}`,
          step2: `Add a TXT record for _verification.${domain} with value ${verificationToken}`,
          step3: 'Wait for DNS propagation (usually 5-60 minutes)',
          step4: 'Click verify to complete the setup'
        }
      });
    } catch (error) {
      console.error('Create domain error:', error);
      res.status(500).json({ error: 'Failed to create domain' });
    }
  });

  app.post('/api/v1/domains/:id/verify', isAuthenticated, async (req, res) => {
    try {
      const user = req.user!;
      const domainId = req.params.id;

      const domain = await storage.getCustomDomain(domainId);
      if (!domain || domain.userId !== user.id) {
        return res.status(404).json({ error: 'Domain not found' });
      }

      // Verify DNS records
      const isVerified = await storage.verifyCustomDomain(domainId);

      if (isVerified) {
        res.json({ success: true, message: 'Domain verified successfully' });
      } else {
        res.status(400).json({ error: 'Domain verification failed. Please check your DNS records.' });
      }
    } catch (error) {
      console.error('Verify domain error:', error);
      res.status(500).json({ error: 'Failed to verify domain' });
    }
  });

  // Notification routes
  app.get('/api/v1/notifications', async (req, res) => {
    try {
      const notifications = await storage.getActiveNotifications();
      res.json(notifications);
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  // Admin notification routes
  app.get('/api/v1/admin/notifications', isAuthenticated, async (req, res) => {
    try {
      const user = req.user!;
      
      // Check if user is admin
      const userData = await storage.getUser(user.id);
      if (!userData?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const notifications = await storage.getAllNotifications();
      res.json(notifications);
    } catch (error) {
      console.error('Get admin notifications error:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  app.post('/api/v1/admin/notifications', isAuthenticated, async (req, res) => {
    try {
      const user = req.user!;
      const { title, message, type, isActive } = req.body;

      // Check if user is admin
      const userData = await storage.getUser(user.id);
      if (!userData?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const notification = await storage.createNotification({
        title,
        message,
        type,
        isActive,
        createdBy: user.id,
      });

      res.json({ success: true, notification });
    } catch (error) {
      console.error('Create notification error:', error);
      res.status(500).json({ error: 'Failed to create notification' });
    }
  });

  app.put('/api/v1/admin/notifications/:id', isAuthenticated, async (req, res) => {
    try {
      const user = req.user!;
      const { id } = req.params;
      const { title, message, type, isActive } = req.body;

      // Check if user is admin
      const userData = await storage.getUser(user.id);
      if (!userData?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const notification = await storage.updateNotification(id, {
        title,
        message,
        type,
        isActive,
      });

      res.json({ success: true, notification });
    } catch (error) {
      console.error('Update notification error:', error);
      res.status(500).json({ error: 'Failed to update notification' });
    }
  });

  app.delete('/api/v1/admin/notifications/:id', isAuthenticated, async (req, res) => {
    try {
      const user = req.user!;
      const { id } = req.params;

      // Check if user is admin
      const userData = await storage.getUser(user.id);
      if (!userData?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      await storage.deleteNotification(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  });

  // Debug route to test server connectivity
  app.get('/api/debug', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      authenticated: !!req.user,
      session: !!req.session?.userId
    });
  });

  // File serving with custom domain support
  app.get('/files/:userId/:path(*)', async (req, res) => {
    try {
      const { userId, path } = req.params;

      // Get the image from database
      const image = await storage.getImageByPath(userId, path);
      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }

      // Track view
      await storage.trackImageView(image.id, req.ip, req.get('User-Agent'));

      // Redirect to Backblaze URL or serve directly
      const backblazeUrl = backblazeService.getFileUrl(image.backblazeFileName || image.filename);
      res.redirect(302, backblazeUrl);
    } catch (error) {
      console.error('File serve error:', error);
      res.status(500).json({ error: 'Failed to serve file' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}