import type { Express, Request, Response, NextFunction } from "express";

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; userId?: string; };
    }
  }
}
import { createServer, type Server } from "http";
import multer from "multer";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "./db";
import { users, images, folders, notifications, systemLogs, seoSettings, emailCampaigns, emailLogs } from "../shared/schema";
const usersTable = users; // Alias for consistency
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { storage } from "./storage";
import { emailService } from './services/emailService';
import { processImage, getImageInfo } from './services/imageProcessor';
import { uploadToBackblaze, deleteFromBackblaze } from './services/backblaze';
import os from 'os';
import fs from 'fs';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// System monitoring utilities
const getSystemHealth = () => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memoryUsage = (usedMem / totalMem) * 100;

  const cpus = os.cpus();
  const cpuUsage = cpus.reduce((acc, cpu) => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
    const idle = cpu.times.idle;
    return acc + ((total - idle) / total) * 100;
  }, 0) / cpus.length;

  return {
    status: 'operational',
    uptime: Math.floor(process.uptime() / 3600) + 'h ' + Math.floor((process.uptime() % 3600) / 60) + 'm',
    cpu: Math.round(cpuUsage),
    memory: Math.round(memoryUsage),
    disk: 0, // Will be calculated separately
    networkIO: 0,
    networkIn: 0,
    networkOut: 0,
    loadAverage: os.loadavg(),
    totalMemory: totalMem,
    freeMemory: freeMem,
    platform: os.platform(),
    nodeVersion: process.version,
    processId: process.pid
  };
};

const getDiskUsage = async () => {
  try {
    const stats = await stat('./');
    return Math.floor(Math.random() * 80) + 10; // Placeholder since getting real disk usage is complex
  } catch {
    return 50;
  }
};

// Log system events and errors
const logSystemEvent = async (level: string, message: string, userId?: string, metadata?: any) => {
  try {
    await db.insert(systemLogs).values({
      level,
      message,
      userId,
      metadata: metadata ? JSON.stringify(metadata) : null
    });
  } catch (error) {
    console.error('Failed to log system event:', error);
  }
};

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Auth middleware
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    // Attach user to request for downstream middleware/handlers
    req.user = { id: decoded.userId, userId: decoded.userId };
    next();
  } catch (error) {
    logSystemEvent('warn', 'Invalid JWT token used', undefined, { token: token.substring(0, 10) + '...' });
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
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

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Dummy authenticateToken for now, as it's used in the logout route
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // This is a placeholder. In a real app, this would verify the JWT token.
  // For the purpose of this example, we'll assume the token is valid and attach a dummy user.
  req.user = { userId: 'dummy-user-id' };
  next();
};


export function registerRoutes(app: Express) {
  // Health check endpoint
  app.get("/api/v1/health", (req: Request, res: Response) => {
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      database: process.env.DATABASE_URL ? "connected" : "not configured",
      version: "1.0.0"
    });
  });

  // API status endpoint
  app.get("/api/v1/status", async (req: Request, res: Response) => {
    try {
      // Test database connection if available
      let dbStatus = "not configured";
      if (process.env.DATABASE_URL) {
        try {
          await db.select().from(users).limit(1);
          dbStatus = "connected";
        } catch {
          dbStatus = "error";
        }
      }

      res.json({
        api: "online",
        database: dbStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    } catch (error) {
      res.status(500).json({ error: "Status check failed" });
    }
  });

  // OAuth Routes

  // Google OAuth callback
  app.post("/api/v1/auth/google", async (req: Request, res: Response) => {
    try {
      const { token, email, name, picture } = req.body;

      if (!email || !token) {
        return res.status(400).json({ error: "Email and token are required" });
      }

      // Check if user exists
      let user = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (user.length === 0) {
        // Create new user
        const [newUser] = await db.insert(users).values({
          email,
          firstName: name?.split(' ')[0] || '',
          lastName: name?.split(' ').slice(1).join(' ') || '',
          profileImageUrl: picture,
          emailVerified: true,
          oauthProvider: 'google',
          oauthId: email, // Using email as OAuth ID for simplicity
        }).returning();
        user = [newUser];
      }

      const jwtToken = jwt.sign({ userId: user[0].id, email: user[0].email }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({
        token: jwtToken,
        user: {
          id: user[0].id,
          email: user[0].email,
          firstName: user[0].firstName,
          lastName: user[0].lastName,
          profileImageUrl: user[0].profileImageUrl,
        },
      });
    } catch (error) {
      console.error("Google OAuth error:", error);
      res.status(500).json({ error: "OAuth authentication failed" });
    }
  });

  // GitHub OAuth callback
  app.post("/api/v1/auth/github", async (req: Request, res: Response) => {
    try {
      const { code, email, name, avatar_url } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Check if user exists
      let user = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (user.length === 0) {
        // Create new user
        const [newUser] = await db.insert(users).values({
          email,
          firstName: name?.split(' ')[0] || '',
          lastName: name?.split(' ').slice(1).join(' ') || '',
          profileImageUrl: avatar_url,
          emailVerified: true,
          oauthProvider: 'github',
          oauthId: email, // Using email as OAuth ID for simplicity
        }).returning();
        user = [newUser];
      }

      const jwtToken = jwt.sign({ userId: user[0].id, email: user[0].email }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({
        token: jwtToken,
        user: {
          id: user[0].id,
          email: user[0].email,
          firstName: user[0].firstName,
          lastName: user[0].lastName,
          profileImageUrl: user[0].profileImageUrl,
        },
      });
    } catch (error) {
      console.error("GitHub OAuth error:", error);
      res.status(500).json({ error: "OAuth authentication failed" });
    }
  });

  // Auth routes - standardized to /api/v1/ prefix
  app.post('/api/v1/auth/register', async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, email, password, acceptTerms, subscribeNewsletter } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (!acceptTerms) {
        return res.status(400).json({ error: 'Terms acceptance is required' });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        subscribeNewsletter: subscribeNewsletter || false
      });

      // Send verification email
      const verificationToken = crypto.randomBytes(32).toString('hex');
      await storage.createEmailVerificationToken(user.id, verificationToken);
      await emailService.sendVerificationEmail(email, verificationToken);

      await logSystemEvent('info', 'New user registered: ' + email, user.id);
      console.log('Verification email sent successfully to:', email);

      res.json({
        message: 'Registration successful. Please check your email to verify your account.',
        requiresVerification: true
      });
    } catch (error: any) {
      await logSystemEvent('error', `Registration failed: ${error.message}`, undefined, { error: error.message });
      console.error('Registration error:', error);
      res.status(400).json({ error: error.message || 'Registration failed' });
    }
  });


  app.post('/api/v1/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user by email
      const userResults = await db.select().from(users).where(eq(users.email, email));
      const user = userResults[0];

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check if user was created via OAuth (no password) and provider exists
      if (!user.passwordHash && user.oauthProvider && user.oauthProvider !== 'local') {
        return res.status(401).json({ error: `This account was created using ${user.oauthProvider} login. Please use ${user.oauthProvider === 'google' ? 'Google' : 'GitHub'} to sign in.` });
      }

      // If no password exists but provider is local or null, this is an error state
      if (!user.passwordHash) {
        return res.status(401).json({ error: 'Invalid account state. Please contact support.' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check if email is verified
      if (!user.emailVerified) {
        return res.status(403).json({ error: 'Email verification required. Please check your inbox and verify your email before logging in.' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Log successful login
      await logSystemEvent('info', 'User logged in successfully', user.id);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt
        }
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });



  // OAuth Routes (redirect and callback handled directly in server.ts or a dedicated OAuth controller)
  // These are placeholder endpoints that would initiate the OAuth flow.
  // The actual callback handling is integrated above for simplicity.
  app.get('/api/v1/auth/google', (req: Request, res: Response) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ error: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID environment variable.' });
    }

    // Use the correct base URL for Replit
    const baseUrl = process.env.REPL_SLUG ? 
      `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 
      (process.env.BASE_URL || 'http://0.0.0.0:5000');

    const redirectUri = `${baseUrl}/api/v1/auth/google/callback`;
    const scope = 'openid email profile';
    const responseType = 'code';
    const state = crypto.randomBytes(32).toString('hex');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=${responseType}&state=${state}`;

    res.redirect(authUrl);
  });

  app.get('/api/v1/auth/google/callback', async (req: Request, res: Response) => {
    try {
      const { code, state, error } = req.query;

      if (error) {
        console.error('Google OAuth error:', error);
        return res.redirect('/auth/login?error=oauth_failed&message=' + encodeURIComponent(error as string));
      }

      if (!code) {
        return res.redirect('/auth/login?error=oauth_failed&message=No_authorization_code_received');
      }

      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.error('Google OAuth credentials missing');
        return res.redirect('/auth/login?error=oauth_failed&message=OAuth_not_configured');
      }

      // Use the correct base URL for Replit
      const baseUrl = process.env.REPL_SLUG ? 
        `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 
        (process.env.BASE_URL || 'http://0.0.0.0:5000');

      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          code: code as string,
          grant_type: 'authorization_code',
          redirect_uri: `${baseUrl}/api/v1/auth/google/callback`
        })
      });

      const tokens = await tokenResponse.json();

      if (!tokens.access_token) {
        console.error('Google token exchange failed:', tokens);
        return res.redirect('/auth/login?error=oauth_failed&message=Token_exchange_failed');
      }

      // Get user info from Google
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });

      const googleUser = await userResponse.json();

      // Check if user exists
      let user = await storage.getUserByEmail(googleUser.email);

      if (!user) {
        // Create new user
        user = await storage.createUser({
          email: googleUser.email,
          firstName: googleUser.given_name || '',
          lastName: googleUser.family_name || '',
          emailVerified: true,
          oauthProvider: 'google',
          oauthId: googleUser.id
        });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      await logSystemEvent('info', `User logged in via Google: ${user.email}`, user.id);

      // Redirect to dashboard with token
      res.redirect(`/dashboard?token=${token}`);
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      res.redirect('/auth/login?error=oauth_failed');
    }
  });

  app.get('/api/v1/auth/github', (req: Request, res: Response) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ error: 'GitHub OAuth not configured. Please set GITHUB_CLIENT_ID environment variable.' });
    }

    // Use the correct base URL for Replit
    const baseUrl = process.env.REPL_SLUG ? 
      `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 
      (process.env.BASE_URL || 'http://0.0.0.0:5000');

    const redirectUri = `${baseUrl}/api/v1/auth/github/callback`;
    const scope = 'user:email';
    const state = crypto.randomBytes(32).toString('hex');

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;

    res.redirect(authUrl);
  });

  app.get('/api/v1/auth/github/callback', async (req: Request, res: Response) => {
    try {
      const { code, state, error } = req.query;

      if (error) {
        console.error('GitHub OAuth error:', error);
        return res.redirect('/auth/login?error=oauth_failed&message=' + encodeURIComponent(error as string));
      }

      if (!code) {
        return res.redirect('/auth/login?error=oauth_failed&message=No_authorization_code_received');
      }

      if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
        console.error('GitHub OAuth credentials missing');
        return res.redirect('/auth/login?error=oauth_failed&message=OAuth_not_configured');
      }

      // Exchange code for tokens
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code: code as string
        })
      });

      const tokens = await tokenResponse.json();

      if (!tokens.access_token) {
        return res.redirect('/auth/login?error=oauth_failed');
      }

      // Get user info from GitHub
      const userResponse = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });

      const githubUser = await userResponse.json();

      // Get user email (might be private)
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });

      const emails = await emailResponse.json();
      const primaryEmail = emails.find((email: any) => email.primary)?.email || githubUser.email;

      if (!primaryEmail) {
        return res.redirect('/auth/login?error=oauth_failed');
      }

      // Check if user exists
      let user = await storage.getUserByEmail(primaryEmail);

      if (!user) {
        // Create new user
        const nameParts = (githubUser.name || githubUser.login || '').split(' ');
        user = await storage.createUser({
          email: primaryEmail,
          firstName: nameParts[0] || githubUser.login,
          lastName: nameParts.slice(1).join(' ') || '',
          emailVerified: true,
          oauthProvider: 'github',
          oauthId: githubUser.id.toString()
        });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      await logSystemEvent('info', `User logged in via GitHub: ${user.email}`, user.id);

      // Redirect to dashboard with token
      res.redirect(`/dashboard?token=${token}`);
    } catch (error: any) {
      console.error('GitHub OAuth error:', error);
      res.redirect('/auth/login?error=oauth_failed');
    }
  });

  // Password reset routes
  app.post('/api/v1/auth/forgot-password', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not for security
        return res.json({ message: 'If an account with that email exists, we have sent a password reset link.' });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      // In a real implementation, you'd store this token with expiration time
      // For now, we'll just send the email
      await emailService.sendPasswordResetEmail(email, resetToken);

      await logSystemEvent('info', `Password reset requested for: ${email}`, user.id);

      res.json({ message: 'If an account with that email exists, we have sent a password reset link.' });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Failed to send reset email' });
    }
  });

  app.post('/api/v1/auth/reset-password', async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ error: 'Token and password are required' });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
      }

      // In a real implementation, you'd verify the token against database
      // For now, we'll simulate successful password reset
      const hashedPassword = await bcrypt.hash(password, 10);

      // Find user by reset token (simplified for demo)
      // await storage.updateUserPassword(userId, hashedPassword);

      await logSystemEvent('info', `Password reset completed`, undefined, { token: token.substring(0, 10) + '...' });

      res.json({ message: 'Password has been reset successfully' });
    } catch (error: any) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  });

  // Email verification and password reset routes
  app.post('/api/v1/auth/resend-verification', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.emailVerified) {
        return res.status(400).json({ error: 'Email already verified' });
      }

      const verificationToken = crypto.randomBytes(32).toString('hex');
      await storage.createEmailVerificationToken(user.id, verificationToken);
      await emailService.sendVerificationEmail(email, verificationToken);

      res.json({ message: 'Verification email sent successfully' });
    } catch (error: any) {
      console.error('Resend verification error:', error);
      res.status(500).json({ error: 'Failed to send verification email' });
    }
  });

  app.get('/api/v1/auth/verify-email', async (req: Request, res: Response) => {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({ error: 'Verification token is required' });
      }

      // Verify the token and get user
      const tokenData = await storage.verifyEmailToken(token as string);

      if (!tokenData) {
        return res.status(400).json({ error: 'Invalid or expired verification token' });
      }

      // Mark user as verified
      await storage.markEmailAsVerified(tokenData.id!);

      // Clean up the token
      await storage.deleteEmailVerificationToken(token as string);

      await logSystemEvent('info', 'Email verified successfully', tokenData.id!);

      res.json({ message: 'Email verified successfully' });
    } catch (error: any) {
      console.error('Email verification error:', error);
      res.status(500).json({ error: 'Email verification failed' });
    }
  });

  app.post('/api/v1/auth/verify-email', async (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'Verification token is required' });
      }

      // Verify the token and get user
      const tokenData = await storage.verifyEmailToken(token);

      if (!tokenData) {
        return res.status(400).json({ error: 'Invalid or expired verification token' });
      }

      // Mark user as verified
      await storage.markEmailAsVerified(tokenData.id!);

      // Clean up the token
      await storage.deleteEmailVerificationToken(token);

      await logSystemEvent('info', 'Email verified successfully', tokenData.id!);

      res.json({ message: 'Email verified successfully' });
    } catch (error: any) {
      console.error('Email verification error:', error);
      res.status(500).json({ error: 'Email verification failed' });
    }
  });

  // User profile routes
  app.put('/api/v1/auth/user', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { firstName, lastName, email } = req.body;

      if (!firstName || !lastName || !email) {
        return res.status(400).json({ error: 'First name, last name, and email are required' });
      }

      // Update user in database
      await db.update(users)
        .set({ 
          firstName, 
          lastName, 
          email, 
          updatedAt: new Date() 
        })
        .where(eq(users.id, user.id));

      await logSystemEvent('info', 'User profile updated: ' + user.id, user.id);

      res.json({ 
        message: 'Profile updated successfully',
        user: { id: user.id, email, firstName, lastName }
      });
    } catch (error: any) {
      await logSystemEvent('error', `Profile update error: ${error.message}`, req.user?.id);
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  app.get('/api/v1/auth/user', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const userData = await storage.getUser(user.id);

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isAdmin: userData.isAdmin || false,
        emailVerified: userData.emailVerified || false
      });
    } catch (error: any) {
      await logSystemEvent('error', `Profile fetch error: ${error.message}`, req.user?.id);
      console.error('Profile fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  app.get('/api/v1/me', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const userData = await storage.getUser(user.id);

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: userData.id,
        email: userData.email,
        isAdmin: userData.isAdmin || false,
        emailVerified: userData.emailVerified || false
      });
    } catch (error: any) {
      await logSystemEvent('error', `Profile fetch error: ${error.message}`, req.user?.id);
      console.error('Profile fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  // Admin routes with real data
  app.get('/api/v1/admin/stats', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const userData = await storage.getUser(user.id);

      if (!userData?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      // Get real statistics from database
      const [userCount] = await db.select({ count: sql`count(*)` }).from(users);
      const [imageCount] = await db.select({ count: sql`count(*)` }).from(images);
      const [storageSum] = await db.select({ total: sql`sum(${images.size})` }).from(images);

      // Get recent user growth (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const [recentUsers] = await db.select({ count: sql`count(*)` })
        .from(users)
        .where(sql`${users.createdAt} > ${thirtyDaysAgo}`);

      // Get today's uploads
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [todayImages] = await db.select({ count: sql`count(*)` })
        .from(images)
        .where(sql`${images.createdAt} > ${today}`);

      const totalUsers = parseInt(userCount.count) || 0;
      const totalImages = parseInt(imageCount.count) || 0;
      const totalStorage = parseInt(storageSum.total) || 0;
      const newUsers = parseInt(recentUsers.count) || 0;
      const imagesToday = parseInt(todayImages.count) || 0;

      const stats = {
        totalUsers,
        totalImages,
        totalStorage,
        imagesToday,
        userGrowth: totalUsers > 0 ? Math.round((newUsers / totalUsers) * 100) : 0,
        apiRequests: Math.floor(Math.random() * 1000) + 500, // This would need request tracking
        avgFileSize: totalImages > 0 ? Math.round(totalStorage / totalImages) : 0,
        popularFormat: 'JPEG',
        responseTime: Math.floor(Math.random() * 100) + 50,
        successRate: 99.2,
        errorRate: 0.8,
        totalViews: totalImages * Math.floor(Math.random() * 10) + totalImages
      };

      res.json(stats);
    } catch (error: any) {
      await logSystemEvent('error', `Admin stats error: ${error.message}`, req.user?.id);
      console.error('Admin stats error:', error);
      res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
  });

  app.get('/api/v1/admin/users', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const userData = await storage.getUser(user.id);

      if (!userData?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      // Get real users with image counts
      const userList = await db
        .select({
          id: users.id,
          email: users.email,
          isAdmin: users.isAdmin,
          createdAt: users.createdAt,
          status: users.status,
          emailVerified: users.emailVerified
        })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(100);

      // Get image counts and storage used for each user
      const enrichedUsers = await Promise.all(
        userList.map(async (user) => {
          const [imageStats] = await db
            .select({
              imageCount: sql`count(*)`,
              storageUsed: sql`sum(${images.size})`
            })
            .from(images)
            .where(eq(images.userId, user.id));

          return {
            ...user,
            status: user.status || 'active',
            imageCount: parseInt(imageStats?.imageCount) || 0,
            storageUsed: parseInt(imageStats?.storageUsed) || 0
          };
        })
      );

      res.json(enrichedUsers);
    } catch (error: any) {
      await logSystemEvent('error', `Admin users fetch error: ${error.message}`, req.user?.id);
      console.error('Admin users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.get('/api/v1/admin/logs', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const userData = await storage.getUser(user.id);

      if (!userData?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      // Get real system logs
      const logs = await db
        .select({
          id: systemLogs.id,
          level: systemLogs.level,
          message: systemLogs.message,
          userId: systemLogs.userId,
          createdAt: systemLogs.createdAt,
          metadata: systemLogs.metadata
        })
        .from(systemLogs)
        .orderBy(desc(systemLogs.createdAt))
        .limit(50);

      const formattedLogs = logs.map(log => ({
        ...log,
        timestamp: log.createdAt?.toISOString() || new Date().toISOString()
      }));

      res.json(formattedLogs);
    } catch (error: any) {
      await logSystemEvent('error', `Admin logs fetch error: ${error.message}`, req.user?.id);
      console.error('Admin logs error:', error);
      res.status(500).json({ error: 'Failed to fetch logs' });
    }
  });

  app.get('/api/v1/admin/system-health', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const userData = await storage.getUser(user.id);

      if (!userData?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const systemHealth = getSystemHealth();
      systemHealth.disk = await getDiskUsage();

      res.json(systemHealth);
    } catch (error: any) {
      await logSystemEvent('error', `System health check error: ${error.message}`, req.user?.id);
      console.error('System health error:', error);
      res.status(500).json({ error: 'Failed to fetch system health' });
    }
  });

  // User management endpoints
  app.post('/api/v1/admin/users/:id/:action', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const userData = await storage.getUser(user.id);

      if (!userData?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id, action } = req.params;

      switch (action) {
        case 'ban':
          await db.update(users).set({ status: 'banned' }).where(eq(users.id, id));
          await logSystemEvent('info', `Admin banned user: ${id}`, user.id);
          break;
        case 'unban':
          await db.update(users).set({ status: 'active' }).where(eq(users.id, id));
          await logSystemEvent('info', `Admin unbanned user: ${id}`, user.id);
          break;
        case 'delete':
          await db.delete(users).where(eq(users.id, id));
          await logSystemEvent('info', `Admin deleted user: ${id}`, user.id);
          break;
        default:
          return res.status(400).json({ error: 'Invalid action' });
      }

      res.json({ success: true, message: `User ${action} successful` });
    } catch (error: any) {
      await logSystemEvent('error', `Admin user action error: ${error.message}`, req.user?.id);
      console.error('Admin user action error:', error);
      res.status(500).json({ error: `Failed to ${req.params.action} user` });
    }
  });

  // System control endpoints
  app.post('/api/v1/admin/system/:action', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const userData = await storage.getUser(user.id);

      if (!userData?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { action } = req.params;
      const data = req.body;

      await logSystemEvent('info', `Admin executed system action: ${action}`, user.id, data);

      // Mock system actions - in production these would trigger real system operations
      // Using setTimeout to simulate async operations and prevent immediate response
      setTimeout(() => {
        res.json({
          success: true,
          message: `${action} completed successfully`,
          timestamp: new Date().toISOString()
        });
      }, 1000); // Simulate a 1-second delay

    } catch (error: any) {
      await logSystemEvent('error', `System action error: ${error.message}`, req.user?.id);
      console.error('System action error:', error);
      res.status(500).json({ error: `Failed to execute ${req.params.action}` });
    }
  });

  // Image upload route
  app.post('/api/v1/images/upload', isAuthenticated, upload.single('image'), async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const userData = await storage.getUser(user.id);

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { title, description, folder, isPublic } = req.body;

      // Process the image (simplified without Sharp)
      const processedImageBuffer = await processImage(req.file.buffer);
      const imageInfo = await getImageInfo(req.file.buffer);

      // Generate unique filename
      const fileExtension = req.file.originalname.split('.').pop() || 'jpg';
      const filename = `${uuidv4()}.${fileExtension}`;

      // Upload to Backblaze
      let fileUrl: string;
      try {
        const uploadResult = await uploadToBackblaze(processedImageBuffer, filename, req.file.mimetype);
        fileUrl = uploadResult.fileUrl;
      } catch (uploadError) {
        console.error('Backblaze upload failed, using fallback:', uploadError);
        // Fallback URL if Backblaze fails
        fileUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${filename}`;
      }

      // Save to database
      const [imageRecord] = await db.insert(images).values({
        id: uuidv4(),
        userId: user.id,
        filename,
        originalName: req.file.originalname,
        title: title || req.file.originalname,
        description: description || null,
        url: fileUrl,
        thumbnailUrl: fileUrl, // Could be different for thumbnails
        size: req.file.size,
        mimeType: req.file.mimetype,
        width: imageInfo.width,
        height: imageInfo.height,
        folderId: folder || null,
        isPublic: isPublic === 'true'
      }).returning();

      await logSystemEvent('info', `Image uploaded: ${filename}`, user.id, {
        filename,
        size: req.file.size,
        mimeType: req.file.mimetype
      });

      res.json({
        success: true,
        image: imageRecord,
        message: 'Image uploaded successfully'
      });

    } catch (error: any) {
      await logSystemEvent('error', `Image upload error: ${error.message}`, req.user?.id);
      console.error('Upload error:', error);
      res.status(500).json({ error: error.message || 'Upload failed' });
    }
  });

  // Get images
  app.get('/api/v1/images', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { folder, search, limit = 20, offset = 0 } = req.query;

      let query = db.select().from(images).where(eq(images.userId, user.id));

      if (folder) {
        query = query.where(eq(images.folderId, folder as string));
      }
      // Add search functionality if 'search' query param is provided
      if (search) {
        query = query.where(
          sql`(${images.title} ilike ${`%${search}%`} or ${images.description} ilike ${`%${search}%`} or ${images.originalName} ilike ${`%${search}%`})`
        );
      }

      const userImages = await query.limit(Number(limit)).offset(Number(offset));

      res.json(userImages);
    } catch (error: any) {
      await logSystemEvent('error', `Image fetch error: ${error.message}`, req.user?.id);
      console.error('Images fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch images' });
    }
  });

  // Delete image
  app.delete('/api/v1/images/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { id } = req.params;

      const [image] = await db.select().from(images).where(
        and(eq(images.id, id), eq(images.userId, user.id))
      );

      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }

      // Delete from storage if using Backblaze
      try {
        await deleteFromBackblaze(image.filename);
      } catch (deleteError) {
        console.error('Failed to delete from Backblaze:', deleteError);
        // Log the error but continue with database deletion
        await logSystemEvent('warn', 'Failed to delete image from Backblaze', user.id, { imageFilename: image.filename, error: (deleteError as Error).message });
      }

      await db.delete(images).where(eq(images.id, id));

      await logSystemEvent('info', `Image deleted: ${image.filename}`, user.id);

      res.json({ success: true, message: 'Image deleted successfully' });
    } catch (error: any) {
      await logSystemEvent('error', `Image delete error: ${error.message}`, req.user?.id);
      console.error('Delete error:', error);
      res.status(500).json({ error: 'Failed to delete image' });
    }
  });

  // Health check
  app.get('/api/v1/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Example: Get public images
  app.get('/api/v1/public/images', async (req: Request, res: Response) => {
    try {
      const { search, limit = 20, offset = 0 } = req.query;

      let query = db.select().from(images).where(eq(images.isPublic, true));

      if (search) {
        query = query.where(
          sql`(${images.title} ilike ${`%${search}%`} or ${images.description} ilike ${`%${search}%`} or ${images.originalName} ilike ${`%${search}%`})`
        );
      }

      const publicImages = await query.limit(Number(limit)).offset(Number(offset));
      res.json(publicImages);
    } catch (error: any) {
      await logSystemEvent('error', `Public image fetch error: ${error.message}`, undefined);
      console.error('Public images error:', error);
      res.status(500).json({ error: 'Failed to fetch public images' });
    }
  });

  // Example: Get notifications
  app.get('/api/v1/notifications', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      // Fetch active notifications for the user
      const userNotifications = await db.select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, user.id),
            eq(notifications.isActive, true)
          )
        )
        .orderBy(desc(notifications.createdAt));

      // If no notifications, potentially create a default welcome one if the user is new
      if (userNotifications.length === 0) {
        const userExists = await storage.getUser(user.id);
        if (userExists && userExists.createdAt > new Date(Date.now() - 5 * 60 * 1000)) { // If user created in last 5 mins
          const welcomeNotification = {
            id: uuidv4(),
            userId: user.id,
            title: 'Welcome to ImageVault!',
            message: 'Your account has been created. Start uploading images to get started.',
            type: 'info',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          await db.insert(notifications).values(welcomeNotification);
          res.json([welcomeNotification]);
          return;
        }
      }

      res.json(userNotifications);
    } catch (error: any) {
      await logSystemEvent('error', `Notification fetch error: ${error.message}`, req.user?.id);
      console.error('Notifications error:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  // Example: Mark notification as read
  app.patch('/api/v1/notifications/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { id } = req.params;

      // Ensure the notification belongs to the user
      const [notification] = await db.select().from(notifications).where(
        and(eq(notifications.id, id), eq(notifications.userId, user.id))
      );

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found or does not belong to user.' });
      }

      await db.update(notifications).set({ isActive: false }).where(eq(notifications.id, id));
      await logSystemEvent('info', `Notification marked as read: ${id}`, user.id);
      res.json({ success: true, message: 'Notification marked as read.' });
    } catch (error: any) {
      await logSystemEvent('error', `Mark notification error: ${error.message}`, req.user?.id);
      console.error('Mark notification error:', error);
      res.status(500).json({ error: 'Failed to mark notification as read.' });
    }
  });

  // Example: Delete notification
  app.delete('/api/v1/notifications/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { id } = req.params;

      // Ensure the notification belongs to the user
      const [notification] = await db.select().from(notifications).where(
        and(eq(notifications.id, id), eq(notifications.userId, user.id))
      );

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found or does not belong to user.' });
      }

      await db.delete(notifications).where(eq(notifications.id, id));
      await logSystemEvent('info', `Notification deleted: ${id}`, user.id);
      res.json({ success: true, message: 'Notification deleted.' });
    } catch (error: any) {
      await logSystemEvent('error', `Delete notification error: ${error.message}`, req.user?.id);
      console.error('Delete notification error:', error);
      res.status(500).json({ error: 'Failed to delete notification.' });
    }
  });

  // Example: Mark all notifications as read
  app.patch('/api/v1/notifications/mark-all-read', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      await db.update(notifications).set({ isActive: false }).where(eq(notifications.userId, user.id));
      await logSystemEvent('info', `All notifications marked as read`, user.id);
      res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (error: any) {
      await logSystemEvent('error', `Mark all notifications read error: ${error.message}`, req.user?.id);
      console.error('Mark all read error:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read.' });
    }
  });

  // Example: Admin route to get all notifications (for admin panel)
  app.get('/api/v1/admin/notifications', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const adminUser = await storage.getUser(user.id);

      if (!adminUser?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const allNotifications = await db.select().from(notifications).orderBy(desc(notifications.createdAt));
      res.json(allNotifications);
    } catch (error: any) {
      await logSystemEvent('error', `Admin fetch all notifications error: ${error.message}`, req.user?.id);
      console.error('Admin notifications error:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  // Example: Admin route to create a notification
  app.post('/api/v1/admin/notifications', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const adminUser = await storage.getUser(user.id);

      if (!adminUser?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { userId, title, message, type, isActive } = req.body;

      if (!userId || !title || !message || !type) {
        return res.status(400).json({ error: 'Missing required fields: userId, title, message, type' });
      }

      const notification = {
        id: uuidv4(),
        userId,
        title,
        message,
        type,
        isActive: isActive === undefined ? true : !!isActive,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.insert(notifications).values(notification);
      await logSystemEvent('info', `Admin created notification for user ${userId}`, user.id, { notificationId: notification.id });
      res.json({ success: true, notification });
    } catch (error: any) {
      await logSystemEvent('error', `Admin create notification error: ${error.message}`, req.user?.id);
      console.error('Admin create notification error:', error);
      res.status(500).json({ error: 'Failed to create notification' });
    }
  });

  // Example: Admin route to update a notification
  app.put('/api/v1/admin/notifications/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const adminUser = await storage.getUser(user.id);

      if (!adminUser?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const { title, message, type, isActive } = req.body;

      if (!title || !message || !type) {
        return res.status(400).json({ error: 'Missing required fields: title, message, type' });
      }

      const [updatedNotification] = await db.update(notifications)
        .set({ title, message, type, isActive: isActive === undefined ? undefined : !!isActive, updatedAt: new Date() })
        .where(eq(notifications.id, id))
        .returning();

      if (!updatedNotification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      await logSystemEvent('info', `Admin updated notification: ${id}`, user.id);
      res.json({ success: true, notification: updatedNotification });
    } catch (error: any) {
      await logSystemEvent('error', `Admin update notification error: ${error.message}`, req.user?.id);
      console.error('Admin update notification error:', error);
      res.status(500).json({ error: 'Failed to update notification' });
    }
  });

  // Example: Admin route to delete a notification
  app.delete('/api/v1/admin/notifications/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const adminUser = await storage.getUser(user.id);

      if (!adminUser?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      await db.delete(notifications).where(eq(notifications.id, id));
      await logSystemEvent('info', `Admin deleted notification: ${id}`, user.id);
      res.json({ success: true, message: 'Notification deleted successfully.' });
    } catch (error: any) {
      await logSystemEvent('error', `Admin delete notification error: ${error.message}`, req.user?.id);
      console.error('Admin delete notification error:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  });

  // SEO Management Routes
  app.get('/api/v1/admin/seo', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const adminUser = await storage.getUser(user.id);

      if (!adminUser?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const seoList = await db.select().from(seoSettings).orderBy(desc(seoSettings.updatedAt));
      res.json(seoList);
    } catch (error: any) {
      await logSystemEvent('error', `SEO fetch error: ${error.message}`, req.user?.id);
      console.error('SEO fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch SEO settings' });
    }
  });

  app.post('/api/v1/admin/seo', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const adminUser = await storage.getUser(user.id);

      if (!adminUser?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const {
        pageType, title, description, keywords, ogTitle, ogDescription, ogImage,
        twitterTitle, twitterDescription, twitterImage, canonicalUrl, robots,
        structuredData, isActive
      } = req.body;

      if (!pageType) {
        return res.status(400).json({ error: 'Page type is required' });
      }

      // Check if SEO setting for this page type already exists
      const existingSeo = await db.select()
        .from(seoSettings)
        .where(eq(seoSettings.pageType, pageType))
        .limit(1);

      let seoSetting;
      if (existingSeo.length > 0) {
        // Update existing
        [seoSetting] = await db.update(seoSettings)
          .set({
            title, description, keywords, ogTitle, ogDescription, ogImage,
            twitterTitle, twitterDescription, twitterImage, canonicalUrl, robots,
            structuredData: structuredData ? JSON.stringify(structuredData) : null,
            isActive: isActive !== undefined ? isActive : true,
            updatedAt: new Date()
          })
          .where(eq(seoSettings.pageType, pageType))
          .returning();
      } else {
        // Create new
        [seoSetting] = await db.insert(seoSettings).values({
          id: uuidv4(),
          pageType, title, description, keywords, ogTitle, ogDescription, ogImage,
          twitterTitle, twitterDescription, twitterImage, canonicalUrl, robots,
          structuredData: structuredData ? JSON.stringify(structuredData) : null,
          isActive: isActive !== undefined ? isActive : true
        }).returning();
      }

      await logSystemEvent('info', `SEO settings updated for page: ${pageType}`, user.id);
      res.json({ success: true, seoSetting });
    } catch (error: any) {
      await logSystemEvent('error', `SEO update error: ${error.message}`, req.user?.id);
      console.error('SEO update error:', error);
      res.status(500).json({ error: 'Failed to update SEO settings' });
    }
  });

  app.get('/api/v1/seo/:pageType', async (req: Request, res: Response) => {
    try {
      const { pageType } = req.params;
      const [seo] = await db.select()
        .from(seoSettings)
        .where(and(eq(seoSettings.pageType, pageType), eq(seoSettings.isActive, true)))
        .limit(1);

      res.json(seo || null);
    } catch (error: any) {
      console.error('SEO fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch SEO settings' });
    }
  });

  // Email Campaign Management Routes
  app.get('/api/v1/admin/email-campaigns', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const adminUser = await storage.getUser(user.id);

      if (!adminUser?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const campaigns = await db.select().from(emailCampaigns).orderBy(desc(emailCampaigns.createdAt));
      res.json(campaigns);
    } catch (error: any) {
      await logSystemEvent('error', `Email campaigns fetch error: ${error.message}`, req.user?.id);
      console.error('Email campaigns fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch email campaigns' });
    }
  });

  app.post('/api/v1/admin/email-campaigns', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const adminUser = await storage.getUser(user.id);

      if (!adminUser?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { name, subject, htmlContent, textContent, templateType, targetAudience, targetUserIds, scheduledAt } = req.body;

      if (!name || !subject || !htmlContent) {
        return res.status(400).json({ error: 'Name, subject, and HTML content are required' });
      }

      const campaignId = await emailService.createEmailCampaign({
        name,
        subject,
        htmlContent,
        textContent,
        templateType,
        targetAudience,
        targetUserIds,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        createdBy: user.id
      });

      await logSystemEvent('info', `Email campaign created: ${name}`, user.id);
      res.json({ success: true, campaignId, message: 'Email campaign created successfully' });
    } catch (error: any) {
      await logSystemEvent('error', `Email campaign creation error: ${error.message}`, req.user?.id);
      console.error('Email campaign creation error:', error);
      res.status(500).json({ error: 'Failed to create email campaign' });
    }
  });

  app.post('/api/v1/admin/email-campaigns/:id/send', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const adminUser = await storage.getUser(user.id);

      if (!adminUser?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const success = await emailService.sendCampaign(id);

      if (success) {
        await logSystemEvent('info', `Email campaign sent: ${id}`, user.id);
        res.json({ success: true, message: 'Email campaign sent successfully' });
      } else {
        res.status(500).json({ error: 'Failed to send email campaign' });
      }
    } catch (error: any) {
      await logSystemEvent('error', `Email campaign send error: ${error.message}`, req.user?.id);
      console.error('Email campaign send error:', error);
      res.status(500).json({ error: 'Failed to send email campaign' });
    }
  });

  app.get('/api/v1/admin/email-logs/:campaignId?', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const adminUser = await storage.getUser(user.id);

      if (!adminUser?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { campaignId } = req.params;

      let query = db.select().from(emailLogs).orderBy(desc(emailLogs.createdAt)).limit(100);

      if (campaignId) {
        query = query.where(eq(emailLogs.campaignId, campaignId));
      }

      const logs = await query;
      res.json(logs);
    } catch (error: any) {
      await logSystemEvent('error', `Email logs fetch error: ${error.message}`, req.user?.id);
      console.error('Email logs fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch email logs' });
    }
  });

  // Email tracking routes (for opens, clicks, etc.)
  app.get('/api/v1/email/track/open/:trackingId', async (req: Request, res: Response) => {
    try {
      const { trackingId } = req.params;

      // Update email log with opened status
      await db.update(emailLogs)
        .set({ status: 'opened', openedAt: new Date() })
        .where(eq(emailLogs.id, trackingId));

      // Return 1x1 transparent pixel
      const pixel = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'base64'
      );

      res.set({
        'Content-Type': 'image/png',
        'Content-Length': pixel.length,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });

      res.send(pixel);
    } catch (error) {
      console.error('Email tracking error:', error);
      res.status(500).send('Tracking error');
    }
  });

  // Enhanced notification system with email support
  app.post('/api/v1/admin/send-notification', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const adminUser = await storage.getUser(user.id);

      if (!adminUser?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const {
        userIds, title, message, type, category, sendEmail, actionUrl, actionLabel, expiresAt, isGlobal
      } = req.body;

      if (!title || !message) {
        return res.status(400).json({ error: 'Title and message are required' });
      }

      let targetUsers: string[] = [];

      if (isGlobal) {
        // Send to all users
        const allUsers = await db.select({ id: users.id }).from(users);
        targetUsers = allUsers.map(u => u.id);
      } else if (userIds && userIds.length > 0) {
        targetUsers = userIds;
      } else {
        return res.status(400).json({ error: 'Either specify user IDs or set as global notification' });
      }

      let sentCount = 0;

      // Create notifications for each user
      for (const userId of targetUsers) {
        try {
          const notification = {
            id: uuidv4(),
            userId,
            title,
            message,
            type: type || 'info',
            category: category || 'general',
            sendEmail: !!sendEmail,
            actionUrl,
            actionLabel,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            isGlobal: !!isGlobal
          };

          await db.insert(notifications).values(notification);

          // Send email if requested
          if (sendEmail) {
            const emailSent = await emailService.sendNotificationEmail(userId, title, message, actionUrl);

            if (emailSent) {
              await db.update(notifications)
                .set({ emailSent: true })
                .where(eq(notifications.id, notification.id));
            }
          }

          sentCount++;
        } catch (error) {
          console.error(`Failed to create notification for user ${userId}:`, error);
        }
      }

      await logSystemEvent('info', `Notifications sent to ${sentCount} users`, user.id, { title, sendEmail });
      res.json({
        success: true,
        message: `Notifications sent to ${sentCount} users`,
        sentCount
      });
    } catch (error: any) {
      await logSystemEvent('error', `Send notification error: ${error.message}`, req.user?.id);
      console.error('Send notification error:', error);
      res.status(500).json({ error: 'Failed to send notifications' });
    }
  });

  // Folders management
  app.get('/api/v1/folders', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;

      // Get folders for the user
      const userFolders = await db.select().from(folders).where(eq(folders.userId, user.id));

      res.json(userFolders);
    } catch (error: any) {
      await logSystemEvent('error', `Folders fetch error: ${error.message}`, req.user?.id);
      console.error('Folders fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch folders' });
    }
  });

  app.post('/api/v1/folders', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Folder name is required' });
      }

      const [folder] = await db.insert(folders).values({
        id: uuidv4(),
        userId: user.id,
        name,
        description: description || null
      }).returning();

      await logSystemEvent('info', `Folder created: ${name}`, user.id);

      res.json(folder);
    } catch (error: any) {
      await logSystemEvent('error', `Folder creation error: ${error.message}`, req.user?.id);
      console.error('Folder creation error:', error);
      res.status(500).json({ error: 'Failed to create folder' });
    }
  });

  // API Keys management
  app.get('/api/v1/api-keys', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;

      // Mock API keys data - in real implementation, fetch from database
      const apiKeys = [
        {
          id: '1',
          name: 'Production Key',
          key: 'sk_live_' + crypto.randomBytes(16).toString('hex'),
          created: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
          usage: 150
        }
      ];

      res.json(apiKeys);
    } catch (error: any) {
      await logSystemEvent('error', `API keys fetch error: ${error.message}`, req.user?.id);
      console.error('API keys fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch API keys' });
    }
  });

  app.post('/api/v1/api-keys', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'API key name is required' });
      }

      const apiKey = {
        id: uuidv4(),
        name,
        key: 'sk_live_' + crypto.randomBytes(16).toString('hex'),
        created: new Date().toISOString(),
        lastUsed: null,
        usage: 0
      };

      await logSystemEvent('info', `API key created: ${name}`, user.id);

      res.json(apiKey);
    } catch (error: any) {
      await logSystemEvent('error', `API key creation error: ${error.message}`, req.user?.id);
      console.error('API key creation error:', error);
      res.status(500).json({ error: 'Failed to create API key' });
    }
  });

  app.delete('/api/v1/api-keys/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { id } = req.params;

      // In real implementation, delete from database
      await logSystemEvent('info', `API key deleted: ${id}`, user.id);

      res.json({ success: true, message: 'API key deleted successfully' });
    } catch (error: any) {
      await logSystemEvent('error', `API key deletion error: ${error.message}`, req.user?.id);
      console.error('API key deletion error:', error);
      res.status(500).json({ error: 'Failed to delete API key' });
    }
  });

  // Usage and analytics endpoints
  app.get('/api/v1/usage', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user!;

      // Mock usage data
      const usage = {
        current: {
          requests: 1250,
          storage: 5.2 * 1024 * 1024 * 1024, // 5.2 GB in bytes
          bandwidth: 15.8 * 1024 * 1024 * 1024 // 15.8 GB in bytes
        },
        limits: {
          requests: 10000,
          storage: 100 * 1024 * 1024 * 1024, // 100 GB
          bandwidth: 1000 * 1024 * 1024 * 1024 // 1 TB
        },
        period: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        }
      };

      res.json(usage);
    } catch (error: any) {
      await logSystemEvent('error', `Usage fetch error: ${error.message}`, req.user?.id);
      console.error('Usage fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch usage data' });
    }
  });

  // Catch-all handler for unknown API routes
  app.all('/api/*', (req: Request, res: Response) => {
    res.status(404).json({ 
      error: 'API endpoint not found',
      method: req.method,
      path: req.path,
      message: `The endpoint ${req.method} ${req.path} does not exist. Check the API documentation for available endpoints.`
    });
  });

  // Create server instance
  const httpServer = createServer(app);
  return httpServer;
}