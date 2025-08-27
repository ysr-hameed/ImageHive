
# ImageVault API Documentation

## Overview
ImageVault provides a comprehensive RESTful API for image hosting, optimization, and management. The API is designed for developers and businesses who need reliable, scalable image hosting with advanced features.

## Base URL
```
Production: https://your-domain.replit.app/api/v1
Development: http://0.0.0.0:5000/api/v1
```

## Authentication
All protected API requests require authentication using Bearer tokens. Include your API key in the Authorization header:

```bash
Authorization: Bearer YOUR_API_KEY
```

### Getting Your API Key
1. Log into your ImageVault dashboard
2. Navigate to Settings > API Keys
3. Generate a new API key with appropriate permissions

## Authentication Endpoints

### Register User
**Endpoint:** `POST /auth/register`

**Body Parameters:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "plan": "free",
    "createdAt": "2024-01-15T14:32:15.000Z"
  },
  "token": "jwt_token_here"
}
```

### Login User
**Endpoint:** `POST /auth/login`

**Body Parameters:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Logout User
**Endpoint:** `POST /auth/logout`

### Forgot Password
**Endpoint:** `POST /auth/forgot-password`

**Body Parameters:**
```json
{
  "email": "john@example.com"
}
```

### Reset Password
**Endpoint:** `POST /auth/reset-password`

**Body Parameters:**
```json
{
  "token": "reset_token_from_email",
  "password": "newpassword123"
}
```

## Image Management Endpoints

### Upload Image
Upload and process images with comprehensive options.

**Endpoint:** `POST /images/upload`

**Content-Type:** `multipart/form-data`

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `image` | File | Yes | Image file (JPEG, PNG, WebP, AVIF, TIFF, BMP) |
| `customFilename` | String | No | Custom filename for the image |
| `title` | String | No | Image title for organization |
| `description` | String | No | Detailed image description |
| `altText` | String | No | Alt text for accessibility |
| `tags` | String | No | Comma-separated tags for categorization |
| `folder` | String | No | Folder/category organization |
| `isPublic` | Boolean | No | Make image publicly accessible (default: true) |
| `override` | Boolean | No | Override existing file with same name |

#### Example Request
```bash
curl -X POST http://0.0.0.0:5000/api/v1/images/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "image=@/path/to/image.jpg" \
  -F "customFilename=my-product-image" \
  -F "title=Professional Product Photo" \
  -F "description=High-quality product showcase image" \
  -F "folder=products/2024" \
  -F "isPublic=true"
```

#### Response
```json
{
  "success": true,
  "image": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "filename": "my-product-image.jpg",
    "originalFilename": "product.jpg",
    "customFilename": "my-product-image",
    "title": "Professional Product Photo",
    "description": "High-quality product showcase image",
    "mimeType": "image/jpeg",
    "size": 245760,
    "width": 1920,
    "height": 1080,
    "isPublic": true,
    "folder": "products/2024",
    "url": "https://yourdomain.com/my-product-image.jpg",
    "cdnUrl": "https://f005.backblazeb2.com/file/bucket/my-product-image.jpg",
    "thumbnailUrl": "https://yourdomain.com/thumb_my-product-image.jpg",
    "views": 0,
    "downloads": 0,
    "createdAt": "2024-01-15T14:32:15.000Z",
    "updatedAt": "2024-01-15T14:32:15.000Z"
  },
  "message": "Image uploaded successfully"
}
```

### List Images
Retrieve your uploaded images with filtering and pagination.

**Endpoint:** `GET /images`

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | Integer | Page number (default: 1) |
| `limit` | Integer | Results per page (default: 20, max: 100) |
| `folder` | String | Filter by folder path |
| `search` | String | Search in title, description, and filename |
| `sortBy` | String | Sort field (createdAt, size, views, title) |
| `sortOrder` | String | Sort direction (asc, desc) |

#### Example Request
```bash
curl -X GET "http://0.0.0.0:5000/api/v1/images?page=1&limit=20&folder=products&sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Response
```json
{
  "images": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "filename": "my-product-image.jpg",
      "customFilename": "my-product-image",
      "title": "Professional Product Photo",
      "url": "https://yourdomain.com/my-product-image.jpg",
      "thumbnailUrl": "https://yourdomain.com/thumb_my-product-image.jpg",
      "size": 245760,
      "folder": "products/2024",
      "createdAt": "2024-01-15T14:32:15.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### Update Image
**Endpoint:** `PUT /images/{imageId}`

**Body Parameters:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "folder": "new-folder",
  "isPublic": false
}
```

### Delete Image
**Endpoint:** `DELETE /images/{imageId}`

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

## User Profile Endpoints

### Get Profile
**Endpoint:** `GET /user/profile`

### Update Profile
**Endpoint:** `PUT /user/profile`

**Body Parameters:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "bio": "Updated bio"
}
```

### Change Password
**Endpoint:** `POST /user/change-password`

**Body Parameters:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

## Collections Endpoints

### Create Collection
**Endpoint:** `POST /collections`

**Body Parameters:**
```json
{
  "name": "My Collection",
  "description": "Collection description",
  "isPublic": true
}
```

### List Collections
**Endpoint:** `GET /collections`

### Delete Collection
**Endpoint:** `DELETE /collections/{collectionId}`

## API Keys Endpoints

### Create API Key
**Endpoint:** `POST /api-keys`

**Body Parameters:**
```json
{
  "name": "My API Key",
  "permissions": ["read", "write", "delete"]
}
```

### List API Keys
**Endpoint:** `GET /api-keys`

### Delete API Key
**Endpoint:** `DELETE /api-keys/{keyId}`

## Payment Endpoints

### Get Plans
**Endpoint:** `GET /payment/plans`

### Create Payment
**Endpoint:** `POST /payment/create`

**Body Parameters:**
```json
{
  "planId": "pro",
  "provider": "payu|paypal",
  "returnUrl": "https://your-site.com/success",
  "cancelUrl": "https://your-site.com/cancel"
}
```

### Verify Payment
**Endpoint:** `POST /payment/verify`

**Body Parameters:**
```json
{
  "paymentId": "payment_123",
  "provider": "payu|paypal",
  "transactionId": "txn_456"
}
```

## Admin Endpoints (Admin Only)

### Get System Stats
**Endpoint:** `GET /admin/stats`

### Manage Users
**Endpoint:** `GET /admin/users`

### Update Settings
**Endpoint:** `POST /admin/settings`

**Body Parameters:**
```json
{
  "settingKey": "max_upload_size",
  "value": "10MB"
}
```

### Manage Notifications
**Endpoint:** `POST /admin/notifications`

**Body Parameters:**
```json
{
  "title": "System Maintenance",
  "message": "Scheduled maintenance tonight",
  "type": "info",
  "targetUsers": "all"
}
```

## Error Responses
All errors follow a consistent format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  },
  "timestamp": "2024-01-15T14:32:15.000Z"
}
```

### Common Error Codes
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `413` - Payload Too Large (file size limit exceeded)
- `415` - Unsupported Media Type (invalid file format)
- `422` - Validation Error (parameter validation failed)
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Rate Limits & Quotas
| Plan | Requests/Hour | Storage | Features |
|------|---------------|---------|----------|
| Free | 100 | 1GB | Basic upload |
| Starter | 1,000 | 10GB | API access |
| Pro | 10,000 | 100GB | Premium features |
| Enterprise | Unlimited | Unlimited | All features |

## Custom Domain Support
When custom domains are configured, image URLs will use your domain instead of the default CDN URL:

```
With custom domain: https://yourdomain.com/filename.jpg
Without custom domain: https://f005.backblazeb2.com/file/bucket/filename.jpg
```

## Best Practices

### Security
- Keep your API keys secure and rotate them regularly
- Use HTTPS for all API requests
- Validate file types on the client side
- Implement proper error handling

### Performance
- Use appropriate file sizes for your use case
- Implement pagination for large datasets
- Cache responses when appropriate
- Use CDN URLs for faster image delivery

### Organization
- Use consistent folder structures
- Add descriptive titles and alt text
- Use tags for better searchability
- Implement proper filename conventions

## Support and Resources
- API Status: Check admin dashboard
- Documentation: /docs endpoint
- Support: Contact through admin panel
- GitHub: Report issues and feature requests

## Version History
- **v1.0.0** - Initial API release
- Core image management functionality
- Authentication and user management
- Payment integration
- Custom domain support
