
import express from 'express';
import { Request, Response } from 'express';
import { db } from './db';
import { users, images, systemLogs } from '../shared/schema';
import { eq, desc, count, sum } from 'drizzle-orm';

const router = express.Router();

// Admin middleware
const requireAdmin = (req: Request, res: Response, next: any) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// System stats - lightweight query
router.get('/stats', requireAdmin, async (req: Request, res: Response) => {
  try {
    const [userStats, imageStats] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ 
        count: count(),
        totalSize: sum(images.size)
      }).from(images)
    ]);

    // Mock additional stats for demo
    const stats = {
      totalUsers: userStats[0]?.count || 0,
      totalImages: imageStats[0]?.count || 0,
      totalStorage: imageStats[0]?.totalSize || 0,
      apiRequests: Math.floor(Math.random() * 10000),
      userGrowth: Math.floor(Math.random() * 20),
      responsePtime: Math.floor(Math.random() * 200) + 50,
      successRate: 99.5 + Math.random() * 0.5,
      errorRate: Math.random() * 0.5,
      avgFileSize: (imageStats[0]?.totalSize || 0) / (imageStats[0]?.count || 1),
      imagesToday: Math.floor(Math.random() * 100),
      popularFormat: 'JPEG'
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// System health monitoring
router.get('/system-health', requireAdmin, (req: Request, res: Response) => {
  // Mock system health data
  const health = {
    status: 'Operational',
    uptime: '99.98%',
    cpu: Math.floor(Math.random() * 30) + 10,
    memory: Math.floor(Math.random() * 40) + 30,
    disk: Math.floor(Math.random() * 20) + 50,
    networkIO: Math.floor(Math.random() * 1000000),
    networkIn: Math.floor(Math.random() * 500000),
    networkOut: Math.floor(Math.random() * 500000)
  };

  res.json(health);
});

// User management
router.get('/users', requireAdmin, async (req: Request, res: Response) => {
  try {
    const userList = await db
      .select({
        id: users.id,
        email: users.email,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
        status: users.status
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(50);

    // Add mock data for demo
    const enrichedUsers = userList.map(user => ({
      ...user,
      status: user.status || 'active',
      imageCount: Math.floor(Math.random() * 100),
      storageUsed: Math.floor(Math.random() * 1000000000)
    }));

    res.json(enrichedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// User actions
router.post('/users/:id/:action', requireAdmin, async (req: Request, res: Response) => {
  const { id, action } = req.params;
  
  try {
    switch (action) {
      case 'ban':
        await db.update(users).set({ status: 'banned' }).where(eq(users.id, id));
        break;
      case 'unban':
        await db.update(users).set({ status: 'active' }).where(eq(users.id, id));
        break;
      case 'delete':
        await db.delete(users).where(eq(users.id, id));
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.json({ success: true, message: `User ${action} successful` });
  } catch (error) {
    res.status(500).json({ error: `Failed to ${action} user` });
  }
});

// System controls
router.post('/system/:action', requireAdmin, (req: Request, res: Response) => {
  const { action } = req.params;
  
  // Mock system actions for demo
  setTimeout(() => {
    res.json({ 
      success: true, 
      message: `${action} completed successfully`,
      timestamp: new Date().toISOString()
    });
  }, 1000);
});

// System logs
router.get('/logs', requireAdmin, (req: Request, res: Response) => {
  // Mock logs for demo
  const mockLogs = [
    {
      id: 1,
      level: 'info',
      message: 'System startup completed successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      userId: null
    },
    {
      id: 2,
      level: 'warn',
      message: 'High memory usage detected: 89%',
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      userId: null
    },
    {
      id: 3,
      level: 'info',
      message: 'Image optimization completed',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      userId: null
    },
    {
      id: 4,
      level: 'error',
      message: 'Failed to connect to external API',
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      userId: null
    },
    {
      id: 5,
      level: 'info',
      message: 'Database backup completed',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      userId: null
    }
  ];

  res.json(mockLogs);
});

export default router;
