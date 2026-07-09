export type UploadInput = {
  key: string;
  body: Uint8Array;
  contentType: string;
  fileName: string;
};

export type UploadResult = {
  key: string;
  url: string;
  fileSize: number;
};

export interface StorageProvider {
  upload(input: UploadInput): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
}
