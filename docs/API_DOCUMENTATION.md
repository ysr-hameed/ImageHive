
# ImageVault API Documentation

## Overview
ImageVault provides a comprehensive RESTful API for image hosting, optimization, and CDN delivery. The API is designed for developers and businesses who need reliable, scalable image hosting with advanced optimization features.

## Base URL
```
Production: https://your-domain.replit.app/api/v1
Development: http://0.0.0.0:5000/api/v1
```

## Authentication
All API requests require authentication using Bearer tokens. Include your API key in the Authorization header:

```bash
Authorization: Bearer YOUR_API_KEY
```

### Getting Your API Key
1. Log into your ImageVault dashboard
2. Navigate to Settings > API Keys
3. Generate a new API key with appropriate permissions

## Endpoints

### Upload Image
Upload and optimize images with comprehensive CDN parameters and premium features.

**Endpoint:** `POST /images/upload`

**Content-Type:** `multipart/form-data`

#### Basic Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `image` | File | Yes | Image file (JPEG, PNG, WebP, AVIF, TIFF, BMP) |
| `title` | String | No | Image title for organization |
| `description` | String | No | Detailed image description |
| `altText` | String | No | Alt text for accessibility |
| `tags` | String | No | Comma-separated tags for categorization |
| `folder` | String | No | Folder/category organization |
| `isPublic` | Boolean | No | Make image publicly accessible (default: true) |

#### CDN Optimization Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `quality` | Integer | 85 | Image quality (1-100) |
| `format` | String | auto | Output format (auto, webp, avif, jpeg, png) |
| `width` | Integer | - | Resize width in pixels |
| `height` | Integer | - | Resize height in pixels |
| `fit` | String | cover | Resize mode (cover, contain, fill, inside, outside) |
| `position` | String | center | Crop position (center, top, bottom, left, right, top-left, top-right, bottom-left, bottom-right) |
| `blur` | Integer | 0 | Blur radius (0-50px) |
| `sharpen` | Boolean | false | Enable image sharpening |
| `brightness` | Float | 1.0 | Brightness multiplier (0.0-2.0) |
| `contrast` | Float | 1.0 | Contrast multiplier (0.0-2.0) |
| `saturation` | Float | 1.0 | Saturation multiplier (0.0-2.0) |
| `progressive` | Boolean | true | Enable progressive JPEG |
| `stripMetadata` | Boolean | true | Remove EXIF metadata |
| `cacheTtl` | Integer | 31536000 | Cache TTL in seconds |

#### Premium Parameters (Requires Payment)
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `watermark` | Boolean | false | Add watermark to image |
| `watermarkText` | String | - | Watermark text content |
| `watermarkOpacity` | Integer | 50 | Watermark opacity (10-100) |
| `watermarkPosition` | String | bottom-right | Watermark position |
| `autoBackup` | Boolean | false | Enable automatic backup |
| `encryption` | Boolean | false | End-to-end encryption |
| `expiryDate` | String | - | Image expiry date (ISO format) |
| `downloadLimit` | Integer | - | Maximum download count |
| `geoRestriction` | String | - | Country codes (US,CA,IN) |

#### Security & Access Control
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `accessLevel` | String | public | Access level (public, private, restricted) |
| `password` | String | - | Password protection for image |
| `allowedDomains` | String | - | Comma-separated allowed domains |
| `hotlinkProtection` | Boolean | false | Enable hotlink protection |
| `viewTracking` | Boolean | true | Track image views and analytics |

#### Example Request
```bash
curl -X POST https://your-domain.replit.app/api/v1/images/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "image=@/path/to/image.jpg" \
  -F "title=Professional Product Photo" \
  -F "description=High-quality product showcase image" \
  -F "altText=Professional product photo on white background" \
  -F "tags=product,hero,marketing,professional" \
  -F "folder=products/2024" \
  -F "quality=95" \
  -F "format=webp" \
  -F "width=1920" \
  -F "height=1080" \
  -F "fit=cover" \
  -F "progressive=true" \
  -F "watermark=true" \
  -F "watermarkText=© Your Brand 2024" \
  -F "watermarkOpacity=30" \
  -F "encryption=true" \
  -F "viewTracking=true"
```

#### Response
```json
{
  "success": true,
  "image": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "filename": "a1b2c3d4-professional-product.webp",
    "originalFilename": "product.jpg",
    "title": "Professional Product Photo",
    "description": "High-quality product showcase image",
    "altText": "Professional product photo on white background",
    "mimeType": "image/webp",
    "size": 245760,
    "width": 1920,
    "height": 1080,
    "isPublic": true,
    "tags": ["product", "hero", "marketing", "professional"],
    "folder": "products/2024",
    "cdnUrl": "https://f005.backblazeb2.com/file/bucket/a1b2c3d4-professional-product.webp",
    "thumbnailUrl": "https://f005.backblazeb2.com/file/bucket/thumb_a1b2c3d4-professional-product.webp",
    "views": 0,
    "downloads": 0,
    "encrypted": true,
    "watermarked": true,
    "cdnOptions": {
      "quality": 95,
      "format": "webp",
      "width": 1920,
      "height": 1080,
      "fit": "cover",
      "progressive": true,
      "watermark": true
    },
    "analytics": {
      "uploadTime": "2024-01-15T14:32:15.000Z",
      "processingTime": 1250,
      "compressionRatio": 0.65
    },
    "createdAt": "2024-01-15T14:32:15.000Z",
    "updatedAt": "2024-01-15T14:32:15.000Z",
    "expiresAt": null
  },
  "message": "Image uploaded and processed successfully",
  "processingTime": 1250,
  "originalSize": 1024000,
  "optimizedSize": 245760,
  "compressionRatio": 0.76
}
```

### List Images
Retrieve your uploaded images with advanced filtering and pagination.

**Endpoint:** `GET /images`

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | Integer | Page number (default: 1) |
| `limit` | Integer | Results per page (default: 20, max: 100) |
| `folder` | String | Filter by folder path |
| `tags` | String | Comma-separated tags to filter |
| `search` | String | Search in title, description, and filename |
| `format` | String | Filter by image format |
| `sortBy` | String | Sort field (createdAt, size, views, title) |
| `sortOrder` | String | Sort direction (asc, desc) |
| `dateFrom` | String | Filter from date (ISO format) |
| `dateTo` | String | Filter to date (ISO format) |
| `minSize` | Integer | Minimum file size in bytes |
| `maxSize` | Integer | Maximum file size in bytes |
| `encrypted` | Boolean | Filter encrypted images only |
| `public` | Boolean | Filter public/private images |

#### Example Request
```bash
curl -X GET "https://your-domain.replit.app/api/v1/images?page=1&limit=20&tags=product,hero&sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Image Analytics
Get detailed analytics for your images.

**Endpoint:** `GET /images/{imageId}/analytics`

#### Response
```json
{
  "imageId": "123e4567-e89b-12d3-a456-426614174000",
  "totalViews": 1247,
  "totalDownloads": 89,
  "uniqueViews": 892,
  "viewsByCountry": {
    "US": 456,
    "IN": 234,
    "CA": 123,
    "UK": 89
  },
  "viewsByDevice": {
    "desktop": 756,
    "mobile": 401,
    "tablet": 90
  },
  "bandwidth": {
    "total": 156789123,
    "thisMonth": 23456789
  },
  "topReferrers": [
    "google.com",
    "facebook.com",
    "direct"
  ],
  "averageLoadTime": 234,
  "cacheHitRate": 94.5
}
```

### Payment Integration

#### Create Payment
**Endpoint:** `POST /payment/create`

```json
{
  "provider": "payu|paypal|stripe",
  "amount": 100,
  "currency": "USD|INR",
  "description": "Premium image upload",
  "returnUrl": "https://your-site.com/success",
  "cancelUrl": "https://your-site.com/cancel"
}
```

#### Verify Payment
**Endpoint:** `POST /payment/verify`

```json
{
  "paymentId": "payment_123",
  "provider": "payu|paypal|stripe",
  "transactionId": "txn_456"
}
```

### Rate Limits & Quotas
| Plan | Requests/Hour | Storage | Bandwidth | Premium Features |
|------|---------------|---------|-----------|------------------|
| Free | 100 | 1GB | 10GB/month | No |
| Starter | 1,000 | 10GB | 100GB/month | Limited |
| Pro | 10,000 | 100GB | 1TB/month | Yes |
| Enterprise | Unlimited | Unlimited | Unlimited | Yes |

### Error Responses
All errors follow a consistent format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  },
  "timestamp": "2024-01-15T14:32:15.000Z",
  "requestId": "req_123456789"
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
- `503` - Service Unavailable

### Payment Error Codes
- `PAYMENT_REQUIRED` - Premium feature requires payment
- `PAYMENT_FAILED` - Payment processing failed
- `INVALID_PAYMENT` - Invalid payment details
- `PAYMENT_CANCELLED` - Payment was cancelled by user

## Best Practices

### Optimization for Web Performance
```bash
# For web thumbnails (fast loading)
-F "width=400" -F "height=300" -F "quality=80" -F "format=webp" -F "progressive=true"

# For hero images (balanced quality/size)
-F "width=1920" -F "height=1080" -F "quality=85" -F "format=auto" -F "progressive=true"

# For product galleries (high quality)
-F "width=800" -F "height=600" -F "quality=90" -F "stripMetadata=true"

# For mobile optimization
-F "width=800" -F "format=webp" -F "quality=75" -F "progressive=true"
```

### SEO Optimization
```bash
# Always include descriptive metadata
-F "title=Professional Business Headshot - John Doe CEO" \
-F "altText=Professional headshot of John Doe, CEO, wearing business suit against white background" \
-F "description=High-quality professional headshot for corporate website and marketing materials" \
-F "tags=headshot,professional,business,corporate,ceo"
```

### Security Best Practices
```bash
# For sensitive content
-F "encryption=true" -F "accessLevel=private" -F "downloadLimit=10" -F "expiryDate=2024-12-31"

# For brand protection
-F "watermark=true" -F "watermarkText=© Your Brand 2024" -F "hotlinkProtection=true"

# For geo-restricted content
-F "geoRestriction=US,CA,UK" -F "allowedDomains=yourdomain.com,partner.com"
```

### Performance Optimization
- Use `format=auto` for automatic format selection based on browser support
- Enable `progressive=true` for faster perceived loading
- Set appropriate `cacheTtl` based on content update frequency
- Use `stripMetadata=true` to reduce file size
- Implement responsive images with different sizes for different viewports

## SDKs and Integration

### JavaScript/Node.js
```javascript
const ImageVault = require('@imagevault/sdk');

const client = new ImageVault({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://your-domain.replit.app/api/v1'
});

// Upload with advanced options
const result = await client.upload({
  file: imageFile,
  title: 'Product Image',
  quality: 90,
  format: 'webp',
  watermark: true,
  encryption: true
});
```

### Python
```python
from imagevault import ImageVaultClient

client = ImageVaultClient(api_key='YOUR_API_KEY')

result = client.upload(
    file_path='image.jpg',
    title='Product Image',
    quality=90,
    format='webp',
    watermark=True,
    encryption=True
)
```

### cURL Examples
```bash
# Basic upload
curl -X POST https://your-domain.replit.app/api/v1/images/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "image=@image.jpg" \
  -F "title=My Image"

# Advanced upload with optimization
curl -X POST https://your-domain.replit.app/api/v1/images/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "image=@image.jpg" \
  -F "quality=90" \
  -F "format=webp" \
  -F "width=1200" \
  -F "watermark=true" \
  -F "encryption=true"
```

## Webhooks
Configure webhooks to receive real-time notifications:

### Supported Events
- `image.uploaded` - New image uploaded
- `image.processed` - Image processing completed
- `image.deleted` - Image deleted
- `image.viewed` - Image viewed (if tracking enabled)
- `payment.completed` - Payment successful
- `payment.failed` - Payment failed
- `quota.warning` - Approaching usage limits
- `quota.exceeded` - Usage limits exceeded

### Webhook Payload Example
```json
{
  "event": "image.uploaded",
  "timestamp": "2024-01-15T14:32:15.000Z",
  "data": {
    "imageId": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "user_123",
    "filename": "product.jpg",
    "size": 245760,
    "cdnUrl": "https://cdn.example.com/image.webp"
  }
}
```

## Support and Resources
- API Status Page: https://status.imagevault.com
- Developer Forum: https://forum.imagevault.com
- GitHub Issues: https://github.com/imagevault/api-issues
- Email Support: api-support@imagevault.com
