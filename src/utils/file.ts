import path from 'path'
import fs from 'fs'
import { Request } from 'express'
import formidable from 'formidable'
import { Files } from 'formidable'

export const initFolder = () => {
  const uploadFolderPath = path.resolve('uploads')
  // fs
  if (!fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(uploadFolderPath, {
      recursive: true
    })
  }
}

export const handleUploadSingleImage = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFields: 1,
    keepExtensions: true,
    maxFieldsSize: 300 * 1024, // 300KB
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })
  return new Promise<Files>((resolve, reject) => {
    form.parse(req, (err, field, files) => {
      if (err) {
        return reject(err)
      }
      if (!files.image) {
        return reject(new Error('Image is empty'))
      }
      return resolve(files)
    })
  })
}
