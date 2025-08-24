import { randomUUID } from 'crypto';

interface BackblazeConfig {
  applicationKeyId: string;
  applicationKey: string;
  bucketId: string;
  bucketName: string;
  endpoint: string;
}

interface BackblazeAuthResponse {
  authorizationToken: string;
  apiUrl: string;
  downloadUrl: string;
}

interface BackblazeUploadResponse {
  fileId: string;
  fileName: string;
  contentType: string;
  fileInfo: Record<string, string>;
  contentLength: number;
  downloadUrl?: string;
}

export class BackblazeB2Service {
  private config: BackblazeConfig;
  private authToken: string | null = null;
  private apiUrl: string | null = null;
  private downloadUrl: string | null = null;
  private uploadUrl: string | null = null;
  private uploadAuthToken: string | null = null;
  private authExpiry: number = 0;

  constructor() {
    this.config = {
      applicationKeyId: process.env.BACKBLAZE_KEY_ID || '',
      applicationKey: process.env.BACKBLAZE_APPLICATION_KEY || '',
      bucketId: process.env.BACKBLAZE_BUCKET_ID || '',
      bucketName: process.env.BACKBLAZE_BUCKET_NAME || '',
      endpoint: process.env.BACKBLAZE_ENDPOINT || 'https://api.backblazeb2.com',
    };

    if (!this.config.applicationKeyId || !this.config.applicationKey || !this.config.bucketId) {
      console.warn('Backblaze configuration is incomplete. Please check environment variables.');
    }
  }

  private async authorize(): Promise<void> {
    console.log('Backblaze config check:', {
      keyId: !!this.config.applicationKeyId,
      appKey: !!this.config.applicationKey,
      bucketId: !!this.config.bucketId
    });

    if (!this.config.applicationKeyId || !this.config.applicationKey || !this.config.bucketId) {
      console.error('Missing Backblaze configuration:', {
        BACKBLAZE_KEY_ID: !!process.env.BACKBLAZE_KEY_ID,
        BACKBLAZE_APPLICATION_KEY: !!process.env.BACKBLAZE_APPLICATION_KEY,
        BACKBLAZE_BUCKET_ID: !!process.env.BACKBLAZE_BUCKET_ID
      });
      throw new Error('Backblaze configuration is incomplete. Please check environment variables.');
    }

    try {
      // Check if auth is still valid (expires after 24 hours)
      if (this.authToken && Date.now() < this.authExpiry) {
        return;
      }

      const credentials = Buffer.from(`${this.config.applicationKeyId}:${this.config.applicationKey}`).toString('base64');

      const response = await fetch(`${this.config.endpoint}/b2api/v2/b2_authorize_account`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backblaze authorization failed: ${response.status} ${errorText}`);
      }

      const data: BackblazeAuthResponse = await response.json();
      this.authToken = data.authorizationToken;
      this.apiUrl = data.apiUrl;
      this.downloadUrl = data.downloadUrl;
      this.authExpiry = Date.now() + (23 * 60 * 60 * 1000); // 23 hours

      console.log('Backblaze authorization successful');
    } catch (error) {
      console.error('Backblaze authorization error:', error);
      throw error;
    }
  }

  private async getUploadUrl(): Promise<void> {
    if (!this.authToken || !this.apiUrl) {
      await this.authorize();
    }

    try {
      const response = await fetch(`${this.apiUrl}/b2api/v2/b2_get_upload_url`, {
        method: 'POST',
        headers: {
          'Authorization': this.authToken!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bucketId: this.config.bucketId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get upload URL: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      this.uploadUrl = data.uploadUrl;
      this.uploadAuthToken = data.authorizationToken;
    } catch (error) {
      console.error('Get upload URL error:', error);
      throw error;
    }
  }

  async uploadFile(
    buffer: Buffer,
    fileName: string,
    contentType: string,
    metadata: Record<string, string> = {}
  ): Promise<BackblazeUploadResponse> {
    try {
      if (!this.uploadUrl || !this.uploadAuthToken) {
        await this.getUploadUrl();
      }

      const sha1Hash = require('crypto').createHash('sha1').update(buffer).digest('hex');

      const response = await fetch(this.uploadUrl!, {
        method: 'POST',
        headers: {
          'Authorization': this.uploadAuthToken!,
          'X-Bz-File-Name': encodeURIComponent(fileName),
          'Content-Type': contentType,
          'Content-Length': buffer.length.toString(),
          'X-Bz-Content-Sha1': sha1Hash,
          ...Object.entries(metadata).reduce((acc, [key, value]) => {
            acc[`X-Bz-Info-${key}`] = encodeURIComponent(value);
            return acc;
          }, {} as Record<string, string>),
        },
        body: buffer,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload response error:', errorText);

        // Reset upload URL on auth errors
        if (response.status === 401) {
          this.uploadUrl = null;
          this.uploadAuthToken = null;
          this.authToken = null;
        }

        throw new Error(`File upload failed: ${response.status} ${errorText}`);
      }

      const uploadData: BackblazeUploadResponse = await response.json();

      // Add download URL
      uploadData.downloadUrl = this.getFileUrl(uploadData.fileName);

      console.log(`File uploaded successfully: ${fileName}`);
      return uploadData;
    } catch (error) {
      console.error('Upload file error:', error);
      throw error;
    }
  }

  async deleteFile(fileId: string, fileName: string): Promise<boolean> {
    try {
      if (!this.authToken || !this.apiUrl) {
        await this.authorize();
      }

      const response = await fetch(`${this.apiUrl}/b2api/v2/b2_delete_file_version`, {
        method: 'POST',
        headers: {
          'Authorization': this.authToken!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId,
          fileName,
        }),
      });

      if (response.ok) {
        console.log(`File deleted successfully: ${fileName}`);
        return true;
      } else {
        const errorText = await response.text();
        console.error(`Delete file error: ${response.status} ${errorText}`);
        return false;
      }
    } catch (error) {
      console.error('Delete file error:', error);
      return false;
    }
  }

  getFileUrl(fileName: string, customDomain?: string): string {
    if (customDomain) {
      return `https://${customDomain}/${fileName}`;
    }

    // Use the download URL from auth response
    if (this.downloadUrl) {
      return `${this.downloadUrl}/file/${this.config.bucketName}/${fileName}`;
    }

    // Fallback to standard URL format
    return `https://f005.backblazeb2.com/file/${this.config.bucketName}/${fileName}`;
  }

  async getFileInfo(fileId: string): Promise<any> {
    try {
      if (!this.authToken || !this.apiUrl) {
        await this.authorize();
      }

      const response = await fetch(`${this.apiUrl}/b2api/v2/b2_get_file_info`, {
        method: 'POST',
        headers: {
          'Authorization': this.authToken!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get file info: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get file info error:', error);
      throw error;
    }
  }

  async listFiles(startFileName?: string, maxFileCount: number = 100): Promise<any> {
    try {
      if (!this.authToken || !this.apiUrl) {
        await this.authorize();
      }

      const response = await fetch(`${this.apiUrl}/b2api/v2/b2_list_file_names`, {
        method: 'POST',
        headers: {
          'Authorization': this.authToken!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bucketId: this.config.bucketId,
          startFileName,
          maxFileCount,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to list files: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('List files error:', error);
      throw error;
    }
  }

  // Test connection to Backblaze
  async testConnection(): Promise<boolean> {
    try {
      await this.authorize();
      console.log('Backblaze connection test successful');
      return true;
    } catch (error) {
      console.error('Backblaze connection test failed:', error);
      return false;
    }
  }
}

export const backblazeService = new BackblazeB2Service();