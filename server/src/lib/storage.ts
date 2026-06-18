import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

function isCloudEnabled(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

function isCloudUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

function detectResourceType(ext: string): 'image' | 'video' | 'raw' | 'auto' {
  const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const audioExts = ['.mp3', '.wav', '.m4a', '.ogg', '.aac'];
  const videoExts = ['.mp4', '.webm', '.mov', '.mkv', '.ogv'];
  if (imageExts.includes(ext)) return 'image';
  if (audioExts.includes(ext)) return 'video'; // Cloudinary treats audio under video resource type
  if (videoExts.includes(ext)) return 'video';
  return 'raw';
}

function detectSubdir(ext: string): string {
  const audioExts = ['.mp3', '.wav', '.m4a', '.ogg', '.aac'];
  const videoExts = ['.mp4', '.webm', '.mov', '.mkv', '.ogv'];
  const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const pdfExts = ['.pdf'];
  if (pdfExts.includes(ext)) return 'pdfs';
  if (audioExts.includes(ext)) return 'audio';
  if (videoExts.includes(ext)) return 'videos';
  if (imageExts.includes(ext)) return 'images';
  return 'images';
}

export interface UploadResult {
  url: string;
  publicId?: string;
  localPath?: string;
}

export async function uploadFile(
  filePath: string,
  originalName: string,
): Promise<UploadResult> {
  const ext = path.extname(originalName).toLowerCase();
  const subdir = detectSubdir(ext);

  if (isCloudEnabled()) {
    const resourceType = detectResourceType(ext);
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '-');
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: `${baseName}-${randomSuffix}`,
      resource_type: resourceType,
      folder: `islamic-online/${subdir}`,
    });
    try { fs.unlinkSync(filePath); } catch {}
    return { url: result.secure_url, publicId: result.public_id };
  }

  const destDir = path.join(__dirname, '../../uploads', subdir);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const destPath = path.join(destDir, path.basename(filePath));
  try {
    if (fs.existsSync(filePath) && filePath !== destPath) {
      fs.copyFileSync(filePath, destPath);
      fs.unlinkSync(filePath);
    }
  } catch {}
  return { url: `/uploads/${subdir}/${path.basename(destPath)}`, localPath: destPath };
}

export function getFileUrl(fileUrl: string): string {
  if (isCloudUrl(fileUrl)) return fileUrl;
  return fileUrl;
}

export async function deleteFile(fileUrl: string): Promise<void> {
  if (isCloudUrl(fileUrl) && isCloudEnabled()) {
    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/<cloud>/<resource_type>/upload/v<version>/<folder>/<public_id>.<ext>
    try {
      const parsed = new URL(fileUrl);
      const pathParts = parsed.pathname.split('/');
      // After /upload/v<version>/, everything up to last dot is the public_id
      const uploadIdx = pathParts.indexOf('upload');
      if (uploadIdx >= 0 && uploadIdx + 2 < pathParts.length) {
        const afterVersion = pathParts.slice(uploadIdx + 2).join('/');
        const publicId = afterVersion.replace(/\.[^.]+$/, '');
        try {
          await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
        } catch {
          try {
            await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
          } catch {
            await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
          }
        }
      }
    } catch {}
    return;
  }

  const rel = fileUrl.replace(/^\//, '').replace(/^uploads\//, '');
  const parts = rel.split('/');
  if (parts.length >= 2) {
    const uploadDir = path.join(__dirname, '../../uploads');
    const filePath = path.join(uploadDir, ...parts.map(decodeURIComponent));
    if (filePath.startsWith(uploadDir) && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }
}

export async function deleteFiles(fileUrls: string[]): Promise<void> {
  await Promise.all(fileUrls.map(deleteFile));
}

export { isCloudEnabled, isCloudUrl };
