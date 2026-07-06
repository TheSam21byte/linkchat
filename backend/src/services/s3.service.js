import path from 'path'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3Client, getS3PublicUrl } from '../config/s3.js'

function getFileExtension(filename = '') {
  const extension = path.extname(filename).toLowerCase()

  if (extension) {
    return extension
  }

  return '.jpg'
}

export async function uploadAvatarToS3(file, userId) {
  if (!file) {
    return null
  }

  const extension = getFileExtension(file.originalname)
  const key = `avatars/${userId}-${Date.now()}${extension}`

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  })

  await s3Client.send(command)

  return getS3PublicUrl(key)
}