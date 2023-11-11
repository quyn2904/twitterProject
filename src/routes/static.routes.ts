import { Router } from 'express'
import { serveImageController } from '~/controllers/medias.controllers'
import { wrapAsync } from '~/utils/handlers'

const staticRouter = Router()

staticRouter.get('/image/:namefile', wrapAsync(serveImageController))

export default staticRouter
