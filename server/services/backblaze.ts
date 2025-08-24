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
}

export class BackblazeB2Service {
  private config: BackblazeConfig;
  private authToken: string | null = null;
  private apiUrl: string | null = null;
  private downloadUrl: string | null = null;
  private uploadUrl: string | null = null;
  private uploadAuthToken: string | null = null;

  constructor() {
    this.config = {
      applicationKeyId: process.env.BACKBLAZE_APPLICATION_KEY_ID || '',
      applicationKey: process.env.BACKBLAZE_APPLICATION_KEY || '',
      bucketId: process.env.BACKBLAZE_BUCKET_ID || '',
      bucketName: process.env.BACKBLAZE_BUCKET_NAME || '',
      endpoint: process.env.BACKBLAZE_ENDPOINT || 'https://api.backblazeb2.com',
    };

    if (!this.config.applicationKeyId || !this.config.applicationKey || !this.config.bucketId) {
      throw new Error('Backblaze configuration is incomplete. Please check environment variables.');
    }
  }

  private async authorize(): Promise<void> {
    const credentials = Buffer.from(`${this.config.applicationKeyId}:${this.config.applicationKey}`).toString('base64');
    
    const response = await fetch(`${this.config.endpoint}/b2api/v2/b2_authorize_account`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Backblaze authorization failed: ${response.statusText}`);
    }

    const data: BackblazeAuthResponse = await response.json();
    this.authToken = data.authorizationToken;
    this.apiUrl = data.apiUrl;
    this.downloadUrl = data.downloadUrl;
  }

  private async getUploadUrl(): Promise<void> {
    if (!this.authToken || !this.apiUrl) {
      await this.authorize();
    }

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
      throw new Error(`Failed to get upload URL: ${response.statusText}`);
    }

    const data = await response.json();
    this.uploadUrl = data.uploadUrl;
    this.uploadAuthToken = data.authorizationToken;
  }

  async uploadFile(
    buffer: Buffer,
    originalFileName: string,
    contentType: string,
    metadata: Record<string, string> = {}
  ): Promise<BackblazeUploadResponse> {
    if (!this.uploadUrl || !this.uploadAuthToken) {
      await this.getUploadUrl();
    }

    const fileName = `${randomUUID()}-${originalFileName}`;
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
      throw new Error(`File upload failed: ${response.statusText}`);
    }

    const uploadData: BackblazeUploadResponse = await response.json();
    
    return {
      fileId: uploadData.fileId,
      fileName: uploadData.fileName,
      contentType: uploadData.contentType,
      fileInfo: uploadData.fileInfo,
      contentLength: uploadData.contentLength,
    };
  }

  async deleteFile(fileId: string, fileName: string): Promise<boolean> {
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

    return response.ok;
  }

  getFileUrl(fileName: string, customDomain?: string): string {
    if (customDomain) {
      return `https://${customDomain}/${fileName}`;
    }
    return `${this.downloadUrl}/file/${this.config.bucketName}/${fileName}`;
  }

  async getFileInfo(fileId: string): Promise<any> {
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
      throw new Error(`Failed to get file info: ${response.statusText}`);
    }

    return await response.json();
  }
}

export const backblazeService = new BackblazeB2Service();
