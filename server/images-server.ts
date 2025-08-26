
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db';
import { images } from '../shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { deleteFromBackblaze } from './services/backblaze';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.IMAGES_PORT || "5003", 10);
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

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

// Health check
app.get('/health', (req, res) => {
  res.json({ service: 'images', status: 'OK', timestamp: new Date().toISOString() });
});

// Get images
app.get('/api/v1/images', isAuthenticated, async (req, res) => {
  try {
    const user = req.user!;
    const { folder, search, limit = 20, offset = 0 } = req.query;

    let query = db.select().from(images).where(eq(images.userId, user.id));

    if (folder) {
      query = query.where(eq(images.folderId, folder as string));
    }

    if (search) {
      query = query.where(
        sql`(${images.title} ilike ${`%${search}%`} or ${images.description} ilike ${`%${search}%`} or ${images.originalName} ilike ${`%${search}%`})`
      );
    }

    const userImages = await query.limit(Number(limit)).offset(Number(offset));
    res.json(userImages);
  } catch (error: any) {
    console.error('Images fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Get single image
app.get('/api/v1/images/:id', isAuthenticated, async (req, res) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const [image] = await db.select().from(images).where(
      and(eq(images.id, id), eq(images.userId, user.id))
    );

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json(image);
  } catch (error: any) {
    console.error('Image fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

// Delete image
app.delete('/api/v1/images/:id', isAuthenticated, async (req, res) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const [image] = await db.select().from(images).where(
      and(eq(images.id, id), eq(images.userId, user.id))
    );

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    try {
      await deleteFromBackblaze(image.filename);
    } catch (deleteError) {
      console.error('Failed to delete from Backblaze:', deleteError);
    }

    await db.delete(images).where(eq(images.id, id));

    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error: any) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Get public images
app.get('/api/v1/public/images', async (req, res) => {
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
    console.error('Public images error:', error);
    res.status(500).json({ error: 'Failed to fetch public images' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🖼️  Images API Server running on http://0.0.0.0:${PORT}`);
});
