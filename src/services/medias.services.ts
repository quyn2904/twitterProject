import { Request } from 'express'
import sharp from 'sharp'
import fs from 'fs'
import { UPLOAD_DIR } from '~/constants/dirs'
import { getNameFromFullName, handleUploadSingleImage } from '~/utils/file'
import { isProduction } from '~/constants/config'

class MediasService {
  async handleUploadSingleImage(req: Request) {
    // lưu ảnh vào trong uploads/temp
    const file = await handleUploadSingleImage(req)
    // xử lý file bằng sharp giúp tối ưu hình ảnh
    const newFilename = getNameFromFullName(file.newFilename) + '.jpg'
    const newPath = UPLOAD_DIR + '/' + newFilename
    const info = await sharp(file.filepath).jpeg().toFile(newPath)
    // xóa file trong temp
    fs.unlinkSync(file.filepath)
    return isProduction
      ? `${process.env.HOST}/medias/${newFilename}`
      : `http://localhost:${process.env.PORT}/uploads/${newFilename}`
  }
}

const mediasService = new MediasService()
export default mediasService
