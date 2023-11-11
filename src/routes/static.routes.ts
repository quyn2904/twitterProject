import { Router } from 'express'
import { serveImageController, serveVideoStreamController } from '~/controllers/medias.controllers'
import { wrapAsync } from '~/utils/handlers'

const staticRouter = Router()

staticRouter.get('/image/:namefile', serveImageController)
staticRouter.get('/video-stream/:namefile', serveVideoStreamController)

export default staticRouter
