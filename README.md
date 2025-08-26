
# ImageVault - Professional Image Management Platform

A full-stack image management platform built with React, TypeScript, Express.js, and PostgreSQL. Features include image upload, processing, organization, user authentication, admin panel, and microservices architecture.

## 🚀 Features

- **Modern Tech Stack**: React 18, TypeScript, Tailwind CSS, Express.js, PostgreSQL
- **Microservices Architecture**: Separate services for auth, uploads, images, and admin
- **Advanced Image Processing**: Upload, resize, optimize, and transform images
- **User Authentication**: JWT-based auth with OAuth (Google, GitHub)
- **Admin Dashboard**: User management, system monitoring, analytics
- **Real-time Notifications**: In-app and email notifications
- **API-First Design**: RESTful APIs with comprehensive documentation
- **Cloud Storage**: Backblaze B2 integration for scalable storage
- **Responsive Design**: Mobile-first responsive UI with dark mode

## 🏗️ Architecture

### Microservices
- **Gateway Server** (Port 5000): Main entry point and frontend serving
- **Auth Server** (Port 5001): Authentication and user management
- **Upload Server** (Port 5002): File upload and processing
- **Images Server** (Port 5003): Image metadata and retrieval
- **Admin Server** (Port 5004): Admin panel and system management

### Database Schema
- Users with role-based access control
- Images with metadata and transformations
- Folders for organization
- Notifications system
- System logs and analytics
- Email campaigns and tracking

## 🛠️ Local Development Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Git

### Environment Variables
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/imagevault"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Backblaze B2 Storage (Optional)
BACKBLAZE_APPLICATION_KEY_ID="your-key-id"
BACKBLAZE_APPLICATION_KEY="your-application-key"
BACKBLAZE_BUCKET_ID="your-bucket-id"
BACKBLAZE_BUCKET_NAME="your-bucket-name"

# Email Service (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Service Ports
PORT="5000"
AUTH_PORT="5001"
UPLOAD_PORT="5002"
IMAGES_PORT="5003"
ADMIN_PORT="5004"

# Environment
NODE_ENV="development"
BASE_URL="http://localhost:5000"
```

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd imagevault
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up the database**
```bash
# Push schema to database (creates tables automatically)
npm run db:push
```

4. **Start development servers**

Run all services:
```bash
npm run dev
```

Or run individual services:
```bash
# Gateway + Frontend
npm run gateway

# Authentication service
npm run auth-server

# Upload service  
npm run upload-server

# Images service
npm run images-server

# Admin service
npm run admin-server
```

5. **Access the application**
- Frontend: http://localhost:5000
- API Gateway: http://localhost:5000/api/v1
- Auth Service: http://localhost:5001
- Upload Service: http://localhost:5002
- Images Service: http://localhost:5003
- Admin Service: http://localhost:5004

## 📦 Production Deployment

### Deploy on Replit

1. **Fork/Import the project** to your Replit account

2. **Set up environment variables** in the Replit Secrets tab:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Strong random secret key
   - Add other optional variables as needed

3. **Configure the run command** in `.replit`:
```
run = "npm run build && npm start"
```

4. **Deploy** using Replit's deployment feature:
   - Go to the Deployments tab
   - Click "Create deployment"
   - Choose your deployment type (Static/Autoscale/Reserved VM)
   - Configure custom domain if needed

### Build Commands

```bash
# Build for production
npm run build

# Start production server
npm start

# Build and start
npm run build && npm start
```

### Production Environment Setup

1. **Database**: Use a managed PostgreSQL service
   - Replit PostgreSQL (recommended)
   - Neon, Supabase, or AWS RDS

2. **Environment Variables**:
   - Set `NODE_ENV=production`
   - Use strong JWT secrets
   - Configure OAuth applications with production URLs
   - Set up Backblaze B2 for file storage

3. **Domain Configuration**:
   - Update `BASE_URL` to your production domain
   - Configure OAuth redirect URLs
   - Set up CORS origins

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start all services in development
npm run gateway          # Gateway server only
npm run auth-server      # Auth service only
npm run upload-server    # Upload service only
npm run images-server    # Images service only
npm run admin-server     # Admin service only

# Production
npm run build           # Build for production
npm start              # Start production server

# Database
npm run db:generate    # Generate migrations
npm run db:push        # Push schema to database
npm run db:studio      # Open Drizzle Studio

# Development Tools
npm run check          # TypeScript type checking
npm audit              # Security audit
```

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/          # Utilities and configs
│   └── index.html
├── server/                # Backend services
│   ├── services/         # Business logic services
│   ├── auth-server.ts    # Authentication service
│   ├── upload-server.ts  # File upload service
│   ├── images-server.ts  # Image management service
│   ├── admin-server.ts   # Admin panel service
│   ├── gateway.ts        # API gateway
│   ├── routes.ts         # API routes
│   ├── db.ts            # Database connection
│   └── storage.ts       # Storage utilities
├── shared/               # Shared types and schemas
│   └── schema.ts        # Database schema
├── package.json         # Dependencies and scripts
├── drizzle.config.ts    # Database configuration
└── README.md           # Documentation
```

## 🔑 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/google` - Google OAuth
- `GET /api/v1/auth/github` - GitHub OAuth
- `POST /api/v1/auth/forgot-password` - Password reset request
- `GET /api/v1/auth/verify-email` - Email verification

### Image Management
- `POST /api/v1/images/upload` - Upload images
- `GET /api/v1/images` - Get user images
- `DELETE /api/v1/images/:id` - Delete image
- `GET /api/v1/public/images` - Get public images

### Admin Endpoints
- `GET /api/v1/admin/stats` - System statistics
- `GET /api/v1/admin/users` - User management
- `GET /api/v1/admin/logs` - System logs
- `GET /api/v1/admin/system-health` - Health monitoring

## 🚦 Health Checks

- `GET /api/v1/health` - Basic health check
- `GET /api/v1/status` - Detailed system status

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Input validation with Zod
- CORS protection
- Rate limiting ready
- SQL injection protection
- XSS protection

## 🎨 UI Components

Built with shadcn/ui components:
- Responsive design system
- Dark/light mode support
- Accessible components
- Customizable themes

## 📊 Monitoring

- System health monitoring
- User activity tracking
- Error logging
- Performance metrics
- Email campaign tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- Check the [GitHub Issues](https://github.com/your-repo/issues)
- Review the API documentation at `/docs`
- Join our community discussions

## 🔄 Version History

- **v1.0.0** - Initial release with full microservices architecture
- Features include image upload, user auth, admin panel, and cloud storage

---

Built with ❤️ using modern web technologies
