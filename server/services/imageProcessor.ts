import sharp from 'sharp';

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  quality?: number;
  blur?: number;
  sharpen?: boolean;
  grayscale?: boolean;
  rotate?: number;
  flip?: boolean;
  flop?: boolean;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hue?: number;
  gamma?: number;
}

export class ImageProcessor {
  static async processImage(buffer: Buffer, options: ImageTransformOptions = {}): Promise<Buffer> {
    let image = sharp(buffer);

    // Resize
    if (options.width || options.height) {
      image = image.resize(options.width, options.height, {
        fit: options.fit || 'cover',
        withoutEnlargement: true,
      });
    }

    // Transformations
    if (options.rotate) {
      image = image.rotate(options.rotate);
    }

    if (options.flip) {
      image = image.flip();
    }

    if (options.flop) {
      image = image.flop();
    }

    if (options.blur) {
      image = image.blur(options.blur);
    }

    if (options.sharpen) {
      image = image.sharpen();
    }

    if (options.grayscale) {
      image = image.grayscale();
    }

    // Color adjustments
    if (options.brightness !== undefined || 
        options.contrast !== undefined || 
        options.saturation !== undefined || 
        options.hue !== undefined) {
      image = image.modulate({
        brightness: options.brightness,
        saturation: options.saturation,
        hue: options.hue,
      });
    }

    if (options.gamma) {
      image = image.gamma(options.gamma);
    }

    // Format conversion
    if (options.format) {
      switch (options.format) {
        case 'jpeg':
          image = image.jpeg({ quality: options.quality || 80 });
          break;
        case 'png':
          image = image.png({ quality: options.quality || 80 });
          break;
        case 'webp':
          image = image.webp({ quality: options.quality || 80 });
          break;
        case 'avif':
          image = image.avif({ quality: options.quality || 80 });
          break;
      }
    }

    return await image.toBuffer();
  }

  static async getImageMetadata(buffer: Buffer): Promise<sharp.Metadata> {
    return await sharp(buffer).metadata();
  }

  static async generateThumbnail(buffer: Buffer, size: number = 150): Promise<Buffer> {
    return await sharp(buffer)
      .resize(size, size, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();
  }

  static getSupportedFormats(): string[] {
    return ['jpeg', 'png', 'webp', 'gif', 'svg', 'tiff', 'avif'];
  }

  static isImageFile(mimeType: string): boolean {
    const supportedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'image/tiff',
      'image/avif',
      'image/bmp',
    ];
    return supportedTypes.includes(mimeType);
  }

  static getFileExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
      'image/tiff': 'tiff',
      'image/avif': 'avif',
      'image/bmp': 'bmp',
    };
    return extensions[mimeType] || 'jpg';
  }
}

// Export convenience functions for backward compatibility
export const processImage = ImageProcessor.processImage;
export const getImageInfo = ImageProcessor.getImageMetadata;
