import { S3Client } from '@aws-sdk/client-s3'

export function isS3Configured() {
  return Boolean(
    process.env.AWS_S3_BUCKET &&
    process.env.AWS_REGION &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
  )
}

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
})

export function getS3PublicUrl(key) {
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
}
