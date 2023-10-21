import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
const usersRouter = Router()
// usersRouter.use(loginValidator)
// nếu để như này thì bất cứ khi nào mình truy cập vào usersRouter đều phải chạy loginValidator
usersRouter.get('/login', loginValidator, loginController)
usersRouter.post('/register', registerValidator, registerController)

export default usersRouter
