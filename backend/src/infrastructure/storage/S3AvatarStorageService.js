import fs from "fs";
import path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { IAvatarStorage } from "../../domain/ports/IAvatarStorage.js";
import {
  s3Client,
  getS3PublicUrl,
  isS3Configured,
} from "../config/s3.js";

function getFileExtension(filename = "") {
  const extension = path.extname(filename).toLowerCase();
  return extension || ".jpg";
}

function saveAvatarLocally(file, userId) {
  const uploadsDir = path.resolve("uploads", "avatars");
  fs.mkdirSync(uploadsDir, { recursive: true });

  const extension = getFileExtension(file.originalname);
  const filename = `${userId}-${Date.now()}${extension}`;
  const filepath = path.join(uploadsDir, filename);

  fs.writeFileSync(filepath, file.buffer);

  return `/uploads/avatars/${filename}`;
}

export class S3AvatarStorageService extends IAvatarStorage {
  async uploadAvatar(file, userId) {
    if (!file) {
      return null;
    }

    if (!isS3Configured()) {
      return saveAvatarLocally(file, userId);
    }

    const extension = getFileExtension(file.originalname);
    const key = `avatars/${userId}-${Date.now()}${extension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);

    return getS3PublicUrl(key);
  }
}
