import path from 'path'
import fs from 'fs'
import { Request } from 'express'
import formidable, { File } from 'formidable'
import { Files } from 'formidable'
import { UPLOAD_TEMP_DIR } from '~/constants/dirs'

export const initFolder = () => {
  // fs
  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(UPLOAD_TEMP_DIR, {
      recursive: true
    })
  }
}

export const getNameFromFullName = (filename: string) => {
  const nameArr = filename.split('.')
  nameArr.pop()
  return nameArr.join('')
}

// hàm xử lý file mà client đã gửi l
export const handleUploadSingleImage = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve(UPLOAD_TEMP_DIR),
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
  return new Promise<File>((resolve, reject) => {
    form.parse(req, (err, field, files) => {
      if (err) {
        return reject(err)
      }
      if (!files.image) {
        return reject(new Error('Image is empty'))
      }
      return resolve((files.image as File[])[0])
    })
  })
}
