import multer from 'multer'

function fileFilter(req, file, callback) {
  if (!file.mimetype.startsWith('image/')) {
    return callback(new Error('Solo se permiten imágenes.'))
  }

  callback(null, true)
}

export const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
})