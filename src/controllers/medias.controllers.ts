import { Request, Response } from 'express'
import formidable from 'formidable'
import path from 'path'
import mediasService from '~/services/medias.services'
import { handleUploadSingleImage } from '~/utils/file'

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const file = await mediasService.handleUploadSingleImage(req)
  return res.json({
    file
  })
}
