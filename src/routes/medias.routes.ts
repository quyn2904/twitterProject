import { wrapAsync } from './../utils/handlers'
import { Router } from 'express'
import { uploadImageController, uploadVideoController } from '~/controllers/medias.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'

const mediaRouter = Router()

mediaRouter.post('/upload-image', accessTokenValidator, verifiedUserValidator, wrapAsync(uploadImageController))

mediaRouter.post('/upload-video', accessTokenValidator, verifiedUserValidator, wrapAsync(uploadVideoController))

export default mediaRouter
