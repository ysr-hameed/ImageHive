# Overview

ImageVault is a professional image hosting SaaS platform designed for developers and businesses. It provides a comprehensive solution for image storage, processing, and delivery with enterprise-grade features including Backblaze B2 cloud storage integration, real-time image processing, custom domains, and advanced analytics. The platform offers both web-based management and a powerful RESTful API with multiple SDKs for seamless integration.

# User Preferences

Preferred communication style: Simple, everyday language.

## Recent Improvements (August 26, 2025)
- ✅ Enhanced upload form with 10+ CDN optimization parameters
- ✅ Changed fonts from Inter/JetBrains to Poppins/Fira Code/Crimson Text
- ✅ Added "Get Started" banner for logged-in users on landing page
- ✅ Improved landing page responsiveness 
- ✅ Created comprehensive API documentation with CDN parameters
- ✅ Created SDK documentation for all major programming languages
- ✅ Updated database schema with CDN options and altText fields
- ✅ Fixed all TypeScript compilation errors
- ✅ Verified npm build works correctly

# System Architecture

## Frontend Architecture
- **React 18 with TypeScript**: Modern component-based architecture using functional components and hooks
- **Styling**: TailwindCSS utility-first framework with Shadcn/ui component library for consistent UI components
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (@tanstack/react-query) for server state management and caching
- **Build System**: Vite for fast development and optimized production builds
- **Typography**: Three premium fonts (Inter, JetBrains Mono, Playfair Display) loaded via Google Fonts

## Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: OpenID Connect via Replit Auth with session-based authentication
- **File Processing**: Sharp library for high-performance image processing and transformations
- **Upload Handling**: Multer middleware for multipart file uploads with memory storage
- **Rate Limiting**: Express rate limiting for API endpoint protection
- **Session Storage**: PostgreSQL-backed session storage using connect-pg-simple

## Data Storage Solutions
- **Primary Database**: PostgreSQL for user data, image metadata, API keys, and analytics
- **Cloud Storage**: Backblaze B2 for actual image file storage with CDN integration
- **Database Schema**: Comprehensive schema including users, images, API keys, custom domains, system logs, and analytics tables
- **Session Management**: Database-backed sessions with automatic cleanup and TTL

## Authentication and Authorization
- **Primary Auth**: OpenID Connect integration with Replit Auth provider
- **Session Management**: Server-side sessions with secure HTTP-only cookies
- **API Authentication**: Bearer token authentication for API endpoints
- **Role-based Access**: Admin role system for administrative features
- **Security**: CSRF protection, secure cookie settings, and environment-based configuration

## Image Processing Pipeline
- **Upload Flow**: Multer → Sharp processing → Backblaze B2 storage → Database metadata storage
- **Transformation Options**: 15+ parameters including resize, format conversion, quality adjustment, filters
- **Format Support**: JPEG, PNG, WebP, AVIF with automatic optimization
- **Real-time Processing**: On-the-fly image transformations via URL parameters
- **File Validation**: MIME type checking and size limits (50MB default)

## API Design
- **RESTful Architecture**: Standard HTTP methods with consistent JSON responses
- **Versioned Endpoints**: /api/v1/ prefix for API versioning
- **Error Handling**: Centralized error handling with structured error responses
- **Rate Limiting**: Configurable limits per user tier and endpoint type
- **Request Validation**: Zod schema validation for input sanitization

# External Dependencies

## Cloud Services
- **Backblaze B2**: Primary cloud object storage for image files with CDN capabilities
- **Replit Auth**: OpenID Connect authentication provider for user management
- **PostgreSQL**: Database service (configured via DATABASE_URL environment variable)

## Core Libraries
- **Database**: @neondatabase/serverless, drizzle-orm for PostgreSQL operations
- **Image Processing**: Sharp for high-performance image transformations
- **Authentication**: openid-client, passport for OAuth/OIDC integration
- **File Uploads**: Multer for handling multipart form data
- **Session Management**: express-session, connect-pg-simple for database-backed sessions

## Frontend Dependencies
- **UI Components**: Comprehensive Radix UI primitives (@radix-ui/react-*) for accessible components
- **Styling**: TailwindCSS, class-variance-authority for component variants
- **State Management**: @tanstack/react-query for server state and caching
- **Routing**: wouter for lightweight routing
- **Form Handling**: react-hook-form with @hookform/resolvers for validation
- **Icons**: lucide-react for consistent iconography

## Development Tools
- **Build**: Vite with React plugin and TypeScript support
- **Database Migrations**: Drizzle Kit for schema management and migrations
- **Development**: tsx for TypeScript execution, @replit/vite-plugin-* for Replit integration
- **Code Quality**: TypeScript for type safety, ESLint configuration implied by package structure