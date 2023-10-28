import { wrapAsync } from './../utils/handlers'
import { NextFunction, Router } from 'express'
import { loginController, logoutController, registerController } from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
const usersRouter = Router()
// usersRouter.use(loginValidator)
// nếu để như này thì bất cứ khi nào mình truy cập vào usersRouter đều phải chạy loginValidator

/*
des: đăng nhập
path: /users/login
method: GET
body: {email, password}
*/
usersRouter.get('/login', loginValidator, wrapAsync(loginController))

/*
des: đăng ký
path: /users/register
method: POST
body: {email, password}
*/
usersRouter.post('/register', registerValidator, wrapAsync(registerController))
// (req, res, next) => {
//   console.log('request handler 1')
//   next(new Error('error from request handler 1'))
// try {
//   throw new Error('error from request handler 1')
// } catch (error) {
//   next(error)
// }
// // Promise.reject(new Error('error from request handler 1')).catch(next)
// },
// (err, req, res, next) => {
//   console.log('error handler nè:')
//   res.status(400).json({ message: err.message })
// }

usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

export default usersRouter
