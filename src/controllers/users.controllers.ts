import { NextFunction, Request, Response } from 'express'
import {
  FollowReqBody,
  GetProfileReqParams,
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  UnfollowReqParams,
  UpdateMeReqBody,
  VerifyEmailReqBody
} from '~/models/requests/User.requests'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { ErrorWithStatus } from '~/models/Errors'
import User from '~/models/schemas/User.schema'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import databaseService from '~/services/database.services'
import { UserVerifyStatus } from '~/constants/enums'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  // throw new ErrorWithStatus({ message: 'error from loginController', status: 401 })
  // chạy bth về ErrorDefaultHandler
  // => bị lỗi cannot set headers after they are sent to the client
  // throw new Error('error from loginController')
  // chạy về ErrorDefaultHandler, Error không có status => status = 500; body = {}
  // vì enumerable = false => k thấy được trong body
  // lấy user_id từ user của req
  const user = req.user as User
  const user_id = user._id as ObjectId // user._id là object id lấy từ mongodb
  // dùng user_id để tạo access_token và refresh_token
  const result = await usersService.login({ user_id: user_id.toString(), verify: user.verify })
  // res về access_token và refresh_token cho client
  res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  // lấy refresh_token từ req.body
  const { refresh_token } = req.body
  // xóa vào database xóa refresh_token
  const result = await usersService.logout(refresh_token)
  res.json(result)
}

export const emailVerifyTokenController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response
) => {
  // nếu mà code vào được đây thì nghĩa là email_verify_token hợp lệ
  // và mình đã lấy được decoded_email_verify_token
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  // dựa vào user_id tìm user và xem thử nó đã verify chưa?
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    throw new ErrorWithStatus({ message: USERS_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })
  }
  if (user.email_verify_token !== req.body.email_verify_token) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_INCORRECT,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  if (user.verify !== UserVerifyStatus.Unverified && user.email_verify_token === '') {
    return res.json({ message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE })
  }
  // nếu mà xuống được đây nghĩa là user chưa verify
  // mình sẽ update lại user đó
  const result = await usersService.verifyEmail(user_id)
  return res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}

export const resendEmailVerifyController = async (req: Request, res: Response) => {
  // nếu vào được đây thì access_token hợp lệ
  // và mình lấy được được decoded_authorization
  const { user_id } = req.decoded_authorization as TokenPayload
  // tìm user có user_id đó và xem thử nó đã verify chưa?
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

  if (!user) {
    throw new ErrorWithStatus({ message: USERS_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })
  }

  if (user.verify === UserVerifyStatus.Verified && user.email_verify_token === '') {
    return res.json({ message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE })
  }

  if (user.verify === UserVerifyStatus.Banned) {
    throw new ErrorWithStatus({ message: USERS_MESSAGES.USER_BANNED, status: HTTP_STATUS.FORBIDDEN })
  }
  // user này thật sự chưa verify: mình sẽ tạo lại email_verify_token
  // cập nhật lại user
  const result = await usersService.resendEmailVerify(user_id)
  return res.json({
    result
  })
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  // lấy user_id từ req.user
  const { _id, verify } = req.user as User
  // dùng _id tìm và cập nhật lại user thêm vào forgot_password_token
  const result = await usersService.forgotPassword({ user_id: (_id as ObjectId).toString(), verify })
  return res.json(result)
}

export const verifyForgotPasswordTokenController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  // dựa vào user_id tìm user
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    throw new ErrorWithStatus({ message: USERS_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })
  }
  if (user.forgot_password_token !== req.body.forgot_password_token) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INCORRECT,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  return res.json({ message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  // muốn cập nhật mật khẩu mới thì cần có user_id và password mới
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  // cập nhập password mới cho user
  const result = await usersService.resetPassword({ user_id, password })
  return res.json(result)
}

export const getMeController = async (req: Request, res: Response) => {
  // muốn lấy thông tin của user thì cần user_id
  const { user_id } = req.decoded_authorization as TokenPayload
  // vào database tìm user có user_id đó
  const user = await usersService.getMe(user_id)
  return res.json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result: user
  })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response) => {
  //muốn update thông tin của user thì cần user_id và các thông tin cần update
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  // giờ mình sẽ update user thông qua user_id với body được cho
  const result = await usersService.updateMe({ user_id, payload: body })
  return res.json({
    message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
    result
  })
}

export const getProfileController = async (req: Request<GetProfileReqParams>, res: Response) => {
  // muốn lấy thông tin của user thì cần username
  const { username } = req.params
  // vào database tìm user có username đó
  const user = await usersService.getProfile(username)
  return res.json({
    message: USERS_MESSAGES.GET_PROFILE_SUCCESS,
    result: user
  })
}

export const followController = async (
  req: Request<ParamsDictionary, any, FollowReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.body
  const result = await usersService.follow({ user_id, followed_user_id })
  return res.json(result)
}

export const unfollowController = async (req: Request<UnfollowReqParams>, res: Response, next: NextFunction) => {
  // lấy ra user_id người muốn thực hiện hành động unfollow
  const { user_id } = req.decoded_authorization as TokenPayload
  const { unfollowed_user_id } = req.params
  const result = await usersService.unfollow({ user_id, unfollowed_user_id })
  return res.json(result)
}
