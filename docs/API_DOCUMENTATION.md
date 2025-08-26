# ImageVault API Documentation

## Overview
ImageVault provides a comprehensive RESTful API for image hosting, optimization, and CDN delivery. The API is designed for developers and businesses who need reliable, scalable image hosting with advanced optimization features.

## Base URL
```
Production: https://your-domain.replit.app/api/v1
Development: http://localhost:5000/api/v1
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
Upload and optimize images with comprehensive CDN parameters.

**Endpoint:** `POST /images/upload`

**Content-Type:** `multipart/form-data`

#### Basic Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `image` | File | Yes | Image file (JPEG, PNG, WebP, AVIF) |
| `title` | String | No | Image title |
| `description` | String | No | Image description |
| `altText` | String | No | Alt text for accessibility |
| `tags` | String | No | Comma-separated tags |
| `folder` | String | No | Folder/category organization |

#### CDN Optimization Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `quality` | Integer | 85 | Image quality (1-100) |
| `format` | String | auto | Output format (auto, webp, avif, jpeg, png) |
| `width` | Integer | - | Resize width in pixels |
| `height` | Integer | - | Resize height in pixels |
| `fit` | String | cover | Resize mode (cover, contain, fill, inside, outside) |
| `position` | String | center | Crop position (center, top, bottom, left, right) |
| `blur` | Integer | 0 | Blur radius (0-50px) |
| `sharpen` | Boolean | false | Enable image sharpening |
| `brightness` | Float | 1.0 | Brightness multiplier (0.0-2.0) |
| `contrast` | Float | 1.0 | Contrast multiplier (0.0-2.0) |
| `saturation` | Float | 1.0 | Saturation multiplier (0.0-2.0) |
| `progressive` | Boolean | true | Enable progressive JPEG |
| `stripMetadata` | Boolean | true | Remove EXIF metadata |
| `cacheTtl` | Integer | 31536000 | Cache TTL in seconds |

#### Example Request
```bash
curl -X POST https://your-domain.replit.app/api/v1/images/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "image=@/path/to/image.jpg" \
  -F "title=Product Hero Image" \
  -F "description=Main product showcase image" \
  -F "altText=Professional product photo on white background" \
  -F "tags=product,hero,marketing" \
  -F "quality=90" \
  -F "format=webp" \
  -F "width=1920" \
  -F "height=1080" \
  -F "fit=cover" \
  -F "progressive=true"
```

#### Response
```json
{
  "success": true,
  "image": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "filename": "a1b2c3d4-product-hero.webp",
    "originalFilename": "product.jpg",
    "title": "Product Hero Image",
    "description": "Main product showcase image",
    "altText": "Professional product photo on white background",
    "mimeType": "image/webp",
    "size": 245760,
    "width": 1920,
    "height": 1080,
    "isPublic": true,
    "tags": ["product", "hero", "marketing"],
    "cdnUrl": "https://f005.backblazeb2.com/file/bucket/a1b2c3d4-product-hero.webp",
    "folder": null,
    "views": 0,
    "cdnOptions": {
      "quality": 90,
      "format": "webp",
      "width": 1920,
      "height": 1080,
      "fit": "cover",
      "progressive": true
    },
    "createdAt": "2025-08-26T12:00:00.000Z",
    "updatedAt": "2025-08-26T12:00:00.000Z"
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
| `folder` | String | Filter by folder |
| `tags` | String | Comma-separated tags to filter |
| `search` | String | Search in title and description |

#### Example Request
```bash
curl -X GET "https://your-domain.replit.app/api/v1/images?page=1&limit=20&tags=product,hero" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Get Image Details
Retrieve detailed information about a specific image.

**Endpoint:** `GET /images/{imageId}`

### Delete Image
Remove an image from your account.

**Endpoint:** `DELETE /images/{imageId}`

## Error Responses
All errors follow a consistent format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common Error Codes
- `401` - Unauthorized (invalid API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (image not found)
- `413` - Payload Too Large (file size limit exceeded)
- `415` - Unsupported Media Type (invalid file format)
- `422` - Validation Error (invalid parameters)
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Rate Limits
- **Free Plan:** 100 requests/hour
- **Pro Plan:** 1,000 requests/hour
- **Enterprise:** Custom limits

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhooks
Configure webhooks to receive real-time notifications about image uploads, processing, and other events.

### Supported Events
- `image.uploaded` - New image uploaded
- `image.processed` - Image processing completed
- `image.deleted` - Image deleted
- `quota.warning` - Approaching usage limits
- `quota.exceeded` - Usage limits exceeded

## Best Practices

### Optimization for Web
```bash
# For web thumbnails
-F "width=400" -F "height=300" -F "quality=80" -F "format=webp"

# For hero images
-F "width=1920" -F "height=1080" -F "quality=85" -F "format=auto"

# For product galleries
-F "width=800" -F "height=600" -F "quality=90" -F "progressive=true"
```

### SEO Optimization
Always include descriptive alt text and meaningful titles:
```bash
-F "title=Professional Business Headshot" \
-F "altText=Smiling professional in business attire against white background" \
-F "tags=headshot,professional,business"
```

### Performance Optimization
- Use `format=auto` for automatic format selection
- Enable `progressive=true` for faster perceived loading
- Set appropriate cache TTL based on content update frequency
- Use `stripMetadata=true` to reduce file size

## SDKs and Libraries
ImageVault provides official SDKs for popular programming languages. See the SDK documentation for language-specific examples.