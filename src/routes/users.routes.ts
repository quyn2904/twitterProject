import { wrapAsync } from './../utils/handlers'
import { NextFunction, Router } from 'express'
import {
  changePasswordController,
  emailVerifyTokenController,
  followController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  unfollowController,
  updateMeController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/requests/User.requests'
const usersRouter = Router()
// usersRouter.use(loginValidator)
// nếu để như này thì bất cứ khi nào mình truy cập vào usersRouter đều phải chạy loginValidator

/*
des: đăng nhập
path: /users/login
method: GET
body: {email, password}
*/
usersRouter.post('/login', loginValidator, wrapAsync(loginController))

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

/*
des: verify email 
khi người dùng đăng ký, học sẽ nhận được mail có link dạng
http://localhost:3000/users/verify-email?token=<email_verify_token>
nếu mà em nhấp vào link thì sẽ tạo ra req gửi lên email_verify_token lên server
server kiểm tra email_verify_token có hợp lệ hay không?
thì từ decoded_email_verify_token lấy được user_id
và vào db tìm user có user_id đó để update email_verify_token thành "", verify = 1, update_at
path: /users/verify-email
method: POST
body: {email_verify_token: string} 
*/
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapAsync(emailVerifyTokenController))

/*
des: resend email verify token
khi mail thất lạc, hoặc email_verify_token hết hạn
thì người dùng có thể gửi lại email_verify_token

method: POST
path: /users/resend-verify-email
header: {Authorization: Bearer <access_token>} //đăng nhập mới đưuọc resend
body: {}
*/
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendEmailVerifyController))

/*
des: khi người dùng quên mật khẩu, thì họ có thể gửi email lên server để tạo cho họ forgot_password_token
path: /users/forgot-password
method: POST
body: {email: string}
*/
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapAsync(forgotPasswordController))

/*
des: khi người dùng nhấp vào link trong mail để reset password
họ sẽ gửi 1 req kèm theo forgot_password_token lên server
server sẽ kiểm tra forgot_password_token có hợp lệ hay không?
sau đó chuyển hướng người dùng đến trang reset password
path: /users/verify-forgot-password
method: POST
body: {forgot_password_token: string}
*/
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapAsync(verifyForgotPasswordTokenController)
)

usersRouter.post(
  `/reset-password`,
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator,
  wrapAsync(resetPasswordController)
)

/*
des: get profile của user
path: '/me'
method: get
Header: {Authorization: Bearer <access_token>}
body: {}
*/
usersRouter.get('/me', accessTokenValidator, wrapAsync(getMeController))

usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  filterMiddleware<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'avatar',
    'bio',
    'cover_photo',
    'location',
    'username',
    'website'
  ]),
  updateMeValidator,
  wrapAsync(updateMeController)
)

/*
des: get profile của user khác bằng unsername
path: '/:username'
method: get
không cần header vì, chưa đăng nhập cũng có thể xem
*/
usersRouter.get('/:username', wrapAsync(getProfileController))

/*
des: Follow someone
path: '/follow'
method: post
headers: {Authorization: Bearer <access_token>}
body: {followed_user_id: string}
*/
usersRouter.post('/follow', accessTokenValidator, verifiedUserValidator, followValidator, wrapAsync(followController))

/*
des: Unfollow someone
path: '/unfollow/:user_id'
method: delete
headers: {Authorization: Bearer <access_token>}
vì method delete k truyền qua body, phải truyền qua param
*/
usersRouter.delete(
  '/unfollow/:unfollowed_user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowValidator,
  wrapAsync(unfollowController)
)

/*
des: change password
path: '/change-password'
method: put
headers: {Authorization: Bearer <access_token>}
body: {old_password: string, new_password: string, confirm_new_password: string}
*/
usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapAsync(changePasswordController)
)

/*
des: refresh token
path: '/refresh-token'
method: post
body: {refresh_token: string}
*/
usersRouter.post('/refresh-token', refreshTokenValidator, wrapAsync(refreshTokenController))

export default usersRouter
