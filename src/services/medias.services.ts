import { Request } from 'express'
import sharp from 'sharp'
import fs from 'fs'
import { UPLOAD_DIR } from '~/constants/dirs'
import { getNameFromFullName, uploadImage } from '~/utils/file'
import { isProduction } from '~/constants/config'
import { Media } from '~/models/Other'
import { MediaType } from '~/constants/enums'

class MediasService {
  async handleUploadImage(req: Request) {
    // lưu ảnh vào trong uploads/temp
    const files = await uploadImage(req)
    // xử lý file bằng sharp giúp tối ưu hình ảnh
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newFilename = getNameFromFullName(file.newFilename) + '.jpg'
        const newPath = UPLOAD_DIR + '/' + newFilename
        const info = await sharp(file.filepath).jpeg().toFile(newPath)
        // xóa file trong temp
        fs.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/medias/${newFilename}`
            : `http://localhost:${process.env.PORT}/static/image/${newFilename}`,
          type: MediaType.Image
        }
      })
    )
    return result
  }
}

const mediasService = new MediasService()
export default mediasService
