# ImageVault SDK Documentation

## Official SDKs
ImageVault provides official SDKs for multiple programming languages to make integration seamless.

## JavaScript/TypeScript SDK

### Installation
```bash
npm install imagevault-sdk
# or
yarn add imagevault-sdk
```

### Basic Usage
```javascript
import { ImageVault } from 'imagevault-sdk';

const client = new ImageVault({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-domain.replit.app/api/v1'
});

// Upload with basic options
const result = await client.upload({
  file: fileObject,
  title: 'My Image',
  description: 'Image description',
  quality: 85,
  format: 'webp'
});

console.log('Uploaded:', result.image.cdnUrl);
```

### Advanced Upload with CDN Optimization
```javascript
const result = await client.upload({
  file: fileObject,
  title: 'Product Hero Image',
  description: 'Main product showcase',
  altText: 'Product on white background',
  tags: ['product', 'hero', 'marketing'],
  
  // CDN Optimization
  quality: 90,
  format: 'auto',
  width: 1920,
  height: 1080,
  fit: 'cover',
  position: 'center',
  progressive: true,
  stripMetadata: true,
  cacheTtl: 31536000
});
```

### List Images
```javascript
const images = await client.listImages({
  page: 1,
  limit: 20,
  tags: ['product'],
  folder: 'marketing'
});
```

### Get Image Details
```javascript
const image = await client.getImage('image-id');
```

### Delete Image
```javascript
await client.deleteImage('image-id');
```

## Python SDK

### Installation
```bash
pip install imagevault-python
```

### Basic Usage
```python
from imagevault import ImageVault

client = ImageVault(
    api_key='your-api-key',
    base_url='https://your-domain.replit.app/api/v1'
)

# Upload image
with open('image.jpg', 'rb') as f:
    result = client.upload(
        file=f,
        title='My Image',
        quality=85,
        format='webp'
    )
    
print(f"Uploaded: {result['image']['cdnUrl']}")
```

### Advanced Upload
```python
with open('product.jpg', 'rb') as f:
    result = client.upload(
        file=f,
        title='Product Hero Image',
        description='Main product showcase',
        alt_text='Product on white background',
        tags=['product', 'hero', 'marketing'],
        
        # CDN Options
        quality=90,
        format='auto',
        width=1920,
        height=1080,
        fit='cover',
        progressive=True,
        strip_metadata=True,
        cache_ttl=31536000
    )
```

### List Images
```python
images = client.list_images(
    page=1,
    limit=20,
    tags=['product'],
    folder='marketing'
)
```

## PHP SDK

### Installation
```bash
composer require imagevault/sdk
```

### Basic Usage
```php
<?php
use ImageVault\Client;

$client = new Client([
    'api_key' => 'your-api-key',
    'base_url' => 'https://your-domain.replit.app/api/v1'
]);

// Upload image
$result = $client->upload([
    'file' => new \CURLFile('image.jpg'),
    'title' => 'My Image',
    'quality' => 85,
    'format' => 'webp'
]);

echo "Uploaded: " . $result['image']['cdnUrl'];
```

### Advanced Upload
```php
$result = $client->upload([
    'file' => new \CURLFile('product.jpg'),
    'title' => 'Product Hero Image',
    'description' => 'Main product showcase',
    'altText' => 'Product on white background',
    'tags' => 'product,hero,marketing',
    
    // CDN Options
    'quality' => 90,
    'format' => 'auto',
    'width' => 1920,
    'height' => 1080,
    'fit' => 'cover',
    'progressive' => true,
    'stripMetadata' => true,
    'cacheTtl' => 31536000
]);
```

## Ruby SDK

### Installation
```bash
gem install imagevault-ruby
```

### Basic Usage
```ruby
require 'imagevault'

client = ImageVault::Client.new(
  api_key: 'your-api-key',
  base_url: 'https://your-domain.replit.app/api/v1'
)

# Upload image
result = client.upload(
  file: File.open('image.jpg'),
  title: 'My Image',
  quality: 85,
  format: 'webp'
)

puts "Uploaded: #{result[:image][:cdnUrl]}"
```

## Go SDK

### Installation
```bash
go get github.com/imagevault/go-sdk
```

### Basic Usage
```go
package main

import (
    "github.com/imagevault/go-sdk"
    "log"
    "os"
)

func main() {
    client := imagevault.NewClient("your-api-key", "https://your-domain.replit.app/api/v1")
    
    file, err := os.Open("image.jpg")
    if err != nil {
        log.Fatal(err)
    }
    defer file.Close()
    
    result, err := client.Upload(&imagevault.UploadOptions{
        File:    file,
        Title:   "My Image",
        Quality: 85,
        Format:  "webp",
    })
    
    if err != nil {
        log.Fatal(err)
    }
    
    log.Printf("Uploaded: %s", result.Image.CDNUrl)
}
```

## Java SDK

### Installation (Maven)
```xml
<dependency>
    <groupId>com.imagevault</groupId>
    <artifactId>imagevault-java</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Basic Usage
```java
import com.imagevault.ImageVaultClient;
import com.imagevault.UploadOptions;
import java.io.File;

public class Example {
    public static void main(String[] args) {
        ImageVaultClient client = new ImageVaultClient(
            "your-api-key",
            "https://your-domain.replit.app/api/v1"
        );
        
        UploadOptions options = new UploadOptions()
            .setFile(new File("image.jpg"))
            .setTitle("My Image")
            .setQuality(85)
            .setFormat("webp");
        
        try {
            UploadResult result = client.upload(options);
            System.out.println("Uploaded: " + result.getImage().getCdnUrl());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

## C# SDK

### Installation
```bash
dotnet add package ImageVault.SDK
```

### Basic Usage
```csharp
using ImageVault;

var client = new ImageVaultClient("your-api-key", "https://your-domain.replit.app/api/v1");

var result = await client.UploadAsync(new UploadOptions
{
    File = File.OpenRead("image.jpg"),
    Title = "My Image",
    Quality = 85,
    Format = "webp"
});

Console.WriteLine($"Uploaded: {result.Image.CdnUrl}");
```

## Swift SDK

### Installation (Swift Package Manager)
```swift
.package(url: "https://github.com/imagevault/swift-sdk", from: "1.0.0")
```

### Basic Usage
```swift
import ImageVaultSDK

let client = ImageVaultClient(
    apiKey: "your-api-key",
    baseUrl: "https://your-domain.replit.app/api/v1"
)

let result = try await client.upload(
    file: imageData,
    options: UploadOptions(
        title: "My Image",
        quality: 85,
        format: .webp
    )
)

print("Uploaded: \(result.image.cdnUrl)")
```

## React Hook
For React applications, we provide a convenient hook:

```jsx
import { useImageVault } from 'imagevault-react';

function ImageUploader() {
  const { upload, isUploading, error } = useImageVault({
    apiKey: 'your-api-key'
  });
  
  const handleUpload = async (file) => {
    const result = await upload({
      file,
      title: 'Uploaded Image',
      quality: 85,
      format: 'webp'
    });
    
    console.log('Uploaded:', result.image.cdnUrl);
  };
  
  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => handleUpload(e.target.files[0])} 
        disabled={isUploading}
      />
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

## Error Handling
All SDKs provide consistent error handling:

```javascript
try {
  const result = await client.upload(options);
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    console.log('Rate limit exceeded, retrying in:', error.retryAfter);
  } else if (error.code === 'FILE_TOO_LARGE') {
    console.log('File size exceeds limit');
  } else {
    console.log('Upload failed:', error.message);
  }
}
```

## Configuration Options
All SDKs support the following configuration options:

```javascript
const client = new ImageVault({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-domain.replit.app/api/v1',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000
});
```

## Development and Testing
For development and testing, you can use the sandbox environment:

```javascript
const client = new ImageVault({
  apiKey: 'test-api-key',
  baseUrl: 'https://sandbox.imagevault.com/api/v1',
  sandbox: true
});
```

## Support
- GitHub Issues: https://github.com/imagevault/sdk-issues
- Documentation: https://docs.imagevault.com
- Support Email: support@imagevault.com