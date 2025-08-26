import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { emailService } from './services/emailService';
import { storage } from './storage';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.AUTH_PORT || "5001", 10);
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ service: 'auth', status: 'OK', timestamp: new Date().toISOString() });
});

// Auth middleware
export const isAuthenticated = (req: any, res: any, next: any) => {
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

// Register
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, acceptTerms } = req.body;

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
      lastName
    });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await storage.createEmailVerificationToken(user.id, verificationToken);
    await emailService.sendVerificationEmail(email, verificationToken);

    res.json({
      message: 'Registration successful. Please check your email to verify your account.',
      requiresVerification: true
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

// Login
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const userResults = await db.select().from(users).where(eq(users.email, email));
    const user = userResults[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ error: 'Invalid account state. Please contact support.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ error: 'Email verification required.' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        isAdmin: user.isAdmin
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user profile
app.get('/api/v1/auth/user', isAuthenticated, async (req, res) => {
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
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Email verification
app.post('/api/v1/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const tokenData = await storage.verifyEmailToken(token);
    if (!tokenData) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    await storage.markEmailAsVerified(tokenData.id!);
    await storage.deleteEmailVerificationToken(token);

    res.json({ message: 'Email verified successfully' });
  } catch (error: any) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔐 Auth Server running on http://0.0.0.0:${PORT}`);
});