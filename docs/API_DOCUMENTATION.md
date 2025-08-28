
# ImageVault API Documentation

## Base URL
```
https://api.imagevault.dev/v1
```
*Production URL varies based on your plan and custom domain setup*

## Authentication
All API requests require authentication using a Bearer token in the Authorization header:
```
Authorization: Bearer iv_your_api_key_here
```

### API Key Management
- Generate API keys from your dashboard at `/api-keys`
- Keys are plan-specific with different rate limits:
  - **Free Plan**: 5,000 requests/month, 2GB storage
  - **Starter Plan**: 25,000 requests/month, 25GB storage ($9/month)
  - **Pro Plan**: 100,000 requests/month, 100GB storage ($29/month)
  - **Enterprise**: Unlimited requests, 500GB+ storage (Custom pricing)

## Custom Domain Setup

### 1. Domain Verification Process
To use your custom domain (e.g. `images.yourbrand.com`):

1. **Add Domain in Dashboard**: Go to `/settings` > Custom Domains
2. **Add CNAME Record**: Point your domain to `cdn.imagevault.dev`
   ```
   CNAME images.yourbrand.com cdn.imagevault.dev
   ```
3. **Verify Domain**: Click "Verify" in dashboard - verification typically takes 5-10 minutes
4. **SSL Certificate**: Auto-provisioned within 24 hours via Let's Encrypt
5. **CDN Distribution**: Global CDN automatically configured

### 2. Domain Configuration
```json
{
  "domain": "images.yourbrand.com",
  "status": "verified",
  "sslStatus": "active",
  "cdnEnabled": true,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

## Billing & Payment Information

### Payment Methods
- **Credit Cards**: Visa, Mastercard, American Express, Discover
- **PayPal**: Available for all plans
- **ACH/Bank Transfer**: Enterprise plans only
- **Crypto**: Bitcoin, Ethereum (Enterprise plans)

### Billing Cycles
- **Monthly**: Billed on signup date each month
- **Annual**: 20% discount, billed yearly
- **Usage-based**: Overages charged at month-end

### Plan Limits & Overages
| Plan | Storage | API Requests | Overage Cost |
|------|---------|--------------|--------------|
| Free | 2GB | 5,000/month | N/A - Blocked |
| Starter | 25GB | 25,000/month | $0.10/GB, $0.01/1k requests |
| Pro | 100GB | 100,000/month | $0.08/GB, $0.008/1k requests |
| Enterprise | 500GB+ | 1M+/month | Custom rates |

### Invoice & Receipt Management
- Monthly invoices sent to billing email
- Download receipts from `/billing` dashboard
- Payment history available for 7 years
- Export for accounting software (QuickBooks, Xero)

## Upload Endpoints

### Upload Image
**Endpoint:** `POST /api/v1/images/upload`

**Headers:**
- `Content-Type: multipart/form-data`
- `Authorization: Bearer {api_key}`

**Body Parameters:**
- `image` (file, required): The image file to upload
- `title` (string, optional): Image title
- `description` (string, optional): Image description
- `folder` (string, optional): Folder path (e.g., "products/2024")
- `altText` (string, optional): Alt text for accessibility
- `tags` (string, optional): Comma-separated tags
- `isPublic` (boolean, optional): Make image publicly accessible
- `customFilename` (string, optional): Custom filename
- `overrideFilename` (boolean, optional): Override original filename

**Transform Parameters:**
- `width` (number, optional): Target width in pixels
- `height` (number, optional): Target height in pixels
- `quality` (number, optional): JPEG quality 1-100
- `format` (string, optional): Output format (auto, jpeg, png, webp, avif)
- `fit` (string, optional): Resize mode (cover, contain, fill, inside, outside)
- `blur` (number, optional): Blur radius 0.3-1000
- `brightness` (number, optional): Brightness 0.1-3.0
- `contrast` (number, optional): Contrast 0.1-3.0
- `saturation` (number, optional): Saturation 0.0-3.0
- `rotate` (number, optional): Rotation in degrees
- `grayscale` (boolean, optional): Convert to grayscale
- `sharpen` (boolean, optional): Apply sharpening
- `watermark` (boolean, optional): Apply watermark (Pro+ only)

**Example Response:**
```json
{
  "success": true,
  "image": {
    "id": "img_123456789",
    "title": "My Image",
    "filename": "my-image.jpg",
    "publicUrl": "https://cdn.imagevault.com/i/my-image.jpg",
    "cdnUrl": "https://cdn.imagevault.com/cdn/my-image.jpg",
    "thumbnailUrl": "https://cdn.imagevault.com/t/my-image.jpg",
    "size": 1024576,
    "width": 1920,
    "height": 1080,
    "mimeType": "image/jpeg",
    "createdAt": "2024-01-15T14:32:15.000Z"
  }
}
```

## Image Management

### Get Images
**Endpoint:** `GET /api/v1/images`

**Query Parameters:**
- `folder` (string, optional): Filter by folder
- `search` (string, optional): Search in title/description
- `limit` (number, optional): Number of results (default: 20)
- `offset` (number, optional): Pagination offset

### Delete Image
**Endpoint:** `DELETE /api/v1/images/{id}`

## Authentication Endpoints

### Login
**Endpoint:** `POST /api/v1/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Register
**Endpoint:** `POST /api/v1/auth/register`

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "password": "password123",
  "acceptTerms": true
}
```

## API Key Management

### Get API Keys
**Endpoint:** `GET /api/v1/api-keys`

### Create API Key
**Endpoint:** `POST /api/v1/api-keys`

**Body:**
```json
{
  "name": "My API Key",
  "permissions": ["images:read", "images:write"]
}
```

### Delete API Key
**Endpoint:** `DELETE /api/v1/api-keys/{keyId}`

## Analytics

### Get Analytics
**Endpoint:** `GET /api/v1/analytics`

**Query Parameters:**
- `period` (string, optional): Time period (7d, 30d, 90d, 1y)

## Error Responses
All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T14:32:15.000Z"
}
```

### Common Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `413` - File Too Large
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Rate Limits
| Plan | Requests/Hour | Storage | Max File Size |
|------|---------------|---------|---------------|
| Free | 100 | 1GB | 5MB |
| Starter | 1,000 | 25GB | 25MB |
| Pro | 10,000 | 100GB | 50MB |
| Enterprise | Unlimited | Unlimited | 100MB |
