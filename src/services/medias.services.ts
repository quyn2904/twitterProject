import { Request } from 'express'
import sharp from 'sharp'
import fs from 'fs'
import { UPLOAD_IMAGE_DIR } from '~/constants/dirs'
import { getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { isProduction } from '~/constants/config'
import { Media } from '~/models/Other'
import { MediaType } from '~/constants/enums'

class MediasService {
  async uploadImage(req: Request) {
    // lưu ảnh vào trong uploads/temp
    const files = await handleUploadImage(req)
    // xử lý file bằng sharp giúp tối ưu hình ảnh
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newFilename = getNameFromFullName(file.newFilename) + '.jpg'
        const newPath = UPLOAD_IMAGE_DIR + '/' + newFilename
        const info = await sharp(file.filepath).jpeg().toFile(newPath)
        // xóa file trong temp
        fs.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newFilename}`
            : `http://localhost:${process.env.PORT}/static/image/${newFilename}`,
          type: MediaType.Image
        }
      })
    )
    return result
  }

  async uploadVideo(req: Request) {
    // lưu video vào trong uploads/videos
    const files = await handleUploadVideo(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const { newFilename } = file
        return {
          url: isProduction
            ? `${process.env.HOST}/static/video/${newFilename}`
            : `http://localhost:${process.env.PORT}/static/video-stream/${newFilename}`,
          type: MediaType.Video
        }
      })
    )
    return result
  }
}

const mediasService = new MediasService()
export default mediasService
