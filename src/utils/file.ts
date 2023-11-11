import path from 'path'
import fs from 'fs'
import { Request } from 'express'
import formidable, { File } from 'formidable'
import { UPLOAD_IMGAGE_TEMP_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dirs'

export const initFolder = () => {
  ;[UPLOAD_IMGAGE_TEMP_DIR, UPLOAD_VIDEO_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true //   cho phéo tạo fulder neested ừ menu/
      })
    }
  })
}

export const getNameFromFullName = (filename: string) => {
  const nameArr = filename.split('.')
  nameArr.pop()
  return nameArr.join('')
}

export const getExtentionFromFullName = (filename: string) => {
  const nameArr = filename.split('.')
  return nameArr.pop()
}

// hàm xử lý file mà client đã gửi l
export const handleUploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve(UPLOAD_IMGAGE_TEMP_DIR),
    maxFields: 4,
    keepExtensions: true,
    maxFileSize: 300 * 1024 * 4, // 300KB
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, field, files) => {
      if (err) {
        return reject(err)
      }
      if (!files.image) {
        return reject(new Error('Image is empty'))
      }
      return resolve(files.image as File[])
    })
  })
}

export const handleUploadVideo = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve(UPLOAD_VIDEO_DIR),
    maxFields: 1,
    // keepExtensions: true, bug: asgddf.dsflkdfjkd.dfjgkljdg.mp4 => chỉ lấy được dfjgkljdg.mp4
    maxFileSize: 50 * 1024 * 1024, // 50mb
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'video' && Boolean(mimetype?.includes('video/'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, field, files) => {
      if (err) {
        return reject(err)
      }
      if (!files.video) {
        return reject(new Error('Video is empty'))
      }
      // file{originalFilename, filepath, newFilename}
      // vì mình đã tắt keepExtensions nên cái file sẽ không có extentions
      const videos = files.video as File[] // lấy ra danh sách các vids đã up lên
      // duyệt qua từng vid
      videos.forEach((video) => {
        // lấy đuôi của originFileName
        const ext = getExtentionFromFullName(video.originalFilename as string)
        // lắp đuôi vào newFilename
        video.newFilename += `.${ext}`
        // lắp đuôi vào filepath
        fs.renameSync(video.filepath, `${video.filepath}.${ext}`)
      })
      return resolve(files.video as File[])
    })
  })
}
