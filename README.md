
# ImageVault - Professional Image Management Platform

A full-stack image management platform built with React, TypeScript, Express.js, and PostgreSQL. Features include image upload, processing, organization, user authentication, admin panel, and comprehensive API.

## 🚀 Features

- **Modern Tech Stack**: React 18, TypeScript, Tailwind CSS, Express.js, PostgreSQL
- **Advanced Image Processing**: Upload, resize, optimize, and transform images with Sharp
- **User Authentication**: JWT-based auth with secure session management
- **Admin Dashboard**: User management, system monitoring, analytics, and settings
- **Real-time Notifications**: In-app notification system
- **API-First Design**: RESTful APIs with comprehensive documentation
- **Cloud Storage**: Backblaze B2 integration for scalable storage with custom domain support
- **Responsive Design**: Mobile-first responsive UI with dark mode
- **Payment Integration**: PayU, PayPal payment processing for premium features
- **Custom Domains**: Support for user custom domains with CNAME setup
- **Advanced Upload**: Filename customization, folder organization, metadata handling

## 🏗️ Architecture

### Single Application with Multiple Services
- **Main Server** (Port 5000): Complete application with all features integrated
- Authentication and user management
- File upload and processing
- Image metadata and retrieval
- Admin panel and system management
- Payment processing

### Database Schema
- Users with role-based access control and plan management
- Images with metadata, custom filenames, and folder organization
- API keys with scoped permissions
- Collections for image organization
- Notifications system
- System settings and configurations
- Activity logs and analytics
- Payment transactions and billing

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
SESSION_SECRET="your-session-secret-key"

# Backblaze B2 Storage
BACKBLAZE_APPLICATION_KEY_ID="your-key-id"
BACKBLAZE_APPLICATION_KEY="your-application-key"
BACKBLAZE_BUCKET_ID="your-bucket-id"
BACKBLAZE_BUCKET_NAME="your-bucket-name"

# Email Service (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Payment Processing
PAYU_MERCHANT_KEY="your-payu-merchant-key"
PAYU_SALT="your-payu-salt"
PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-client-secret"

# Application Settings
PORT="5000"
NODE_ENV="development"
BASE_URL="http://0.0.0.0:5000"
CUSTOM_DOMAIN_ENABLED="false"
PLATFORM_DOMAIN="yourdomain.com"
```

### Installation

1. **Fork or import the project** to your Replit account

2. **Install dependencies**
```bash
npm install
```

3. **Set up the database**
```bash
# Push schema to database (creates tables automatically)
npm run db:push
```

4. **Start development server**
```bash
npm run dev
```

5. **Access the application**
- Frontend: http://0.0.0.0:5000
- API: http://0.0.0.0:5000/api/v1

## 📦 Production Deployment

### Deploy on Replit

1. **Fork/Import the project** to your Replit account

2. **Set up environment variables** in the Replit Secrets tab:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   JWT_SECRET=your-super-secure-jwt-secret-key
   SESSION_SECRET=your-session-secret-key
   BACKBLAZE_APPLICATION_KEY_ID=your-backblaze-key-id
   BACKBLAZE_APPLICATION_KEY=your-backblaze-application-key
   BACKBLAZE_BUCKET_ID=your-bucket-id
   BACKBLAZE_BUCKET_NAME=your-bucket-name
   PAYU_MERCHANT_KEY=your-payu-merchant-key
   PAYU_SALT=your-payu-salt
   CUSTOM_DOMAIN_ENABLED=true
   PLATFORM_DOMAIN=yourdomain.com
   ```

3. **Deploy** using Replit's deployment feature:
   - Go to the Deployments tab
   - Click "Create deployment" 
   - Choose Autoscale deployment
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

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start main application server

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
│   │   ├── lib/          # Utilities and configs
│   │   └── api/          # API client functions
│   └── index.html
├── server/                # Backend services
│   ├── services/         # Business logic services
│   ├── routes.ts         # API routes
│   ├── db.ts            # Database connection
│   ├── storage.ts       # Storage utilities
│   ├── sitemap.ts       # SEO sitemap generation
│   └── index.ts         # Main server entry point
├── shared/               # Shared types and schemas
│   └── schema.ts        # Database schema
├── docs/                # Documentation
│   ├── API_DOCUMENTATION.md
│   └── SDK_DOCUMENTATION.md
└── package.json         # Dependencies and scripts
```

## 🔑 API Documentation

### Core Features Available

#### Authentication
- User registration and login
- Email verification
- Password reset
- JWT-based session management

#### Image Management
- Upload with custom filenames and folders
- Image optimization and processing
- Metadata management
- Custom domain support for URLs
- Copy URL, download, and view details

#### User Management
- Profile management
- Password change
- Plan upgrades and billing
- API key generation with permissions

#### Admin Features
- Real-time system monitoring
- User management
- Settings configuration (20+ settings)
- Analytics and activity logs
- Payment tracking

### API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password` - Password reset
- `GET /api/v1/auth/verify-email` - Email verification

#### Images
- `POST /api/v1/images/upload` - Upload images with processing options
- `GET /api/v1/images` - Get user images with filtering
- `DELETE /api/v1/images/:id` - Delete image
- `PUT /api/v1/images/:id` - Update image metadata

#### Collections
- `POST /api/v1/collections` - Create collection
- `GET /api/v1/collections` - Get user collections
- `DELETE /api/v1/collections/:id` - Delete collection

#### User Profile
- `GET /api/v1/user/profile` - Get profile
- `PUT /api/v1/user/profile` - Update profile
- `POST /api/v1/user/change-password` - Change password

#### API Keys
- `POST /api/v1/api-keys` - Create API key
- `GET /api/v1/api-keys` - Get user API keys
- `DELETE /api/v1/api-keys/:id` - Delete API key

#### Admin (Admin only)
- `GET /api/v1/admin/stats` - System statistics
- `GET /api/v1/admin/users` - User management
- `POST /api/v1/admin/settings` - Update system settings
- `GET /api/v1/admin/notifications` - Manage notifications

#### Payment
- `POST /api/v1/payment/create` - Create payment
- `POST /api/v1/payment/verify` - Verify payment
- `GET /api/v1/payment/plans` - Get available plans

## 🎨 Features

### Image Upload & Processing
- Custom filename support
- Folder organization
- Multiple file upload
- Image optimization with Sharp
- Metadata preservation/stripping
- Custom domain URL generation

### User Experience
- Responsive sidebar navigation
- Dark/light mode
- Real-time notifications
- Advanced search and filtering
- Pagination support

### Admin Panel
- System monitoring dashboard
- User management
- Settings management (20+ configurable settings)
- Payment tracking
- Analytics and reporting

### Payment Integration
- PayU payment gateway
- PayPal integration
- Plan management
- Trial system
- Billing history

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Input validation with Zod
- CORS protection
- SQL injection protection
- XSS protection
- API rate limiting
- Secure file upload validation

## 📊 Current Status

### Working Features
✅ User authentication and registration  
✅ Image upload with custom filenames  
✅ Image management (copy URL, download, view details)  
✅ Collections and folder organization  
✅ API key management  
✅ Admin panel with real settings  
✅ Payment integration (PayU, PayPal)  
✅ Custom domain support  
✅ Real-time notifications  
✅ Profile and password management  
✅ Plan management and trials  
✅ Activity logging  
✅ SEO optimization with sitemap  
✅ Responsive design  

### Known Issues
- Sitemap generation error (require issue in TypeScript module)
- Some sidebar navigation styling needs improvement
- Prism syntax highlighting setup needed for docs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- Check the GitHub Issues
- Review the API documentation at `/docs`
- Contact support through the admin panel

## 🔄 Version History

- **v1.0.0** - Initial release with complete image management platform
- Features include image upload, user auth, admin panel, payment integration, and custom domains

---

Built with ❤️ using modern web technologies on Replit
