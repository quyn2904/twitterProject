import { wrapAsync } from './../utils/handlers'
import { Router } from 'express'
import { uploadImageController } from '~/controllers/medias.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'

const mediaRouter = Router()

mediaRouter.post('/upload-image', accessTokenValidator, verifiedUserValidator, wrapAsync(uploadImageController))

export default mediaRouter
