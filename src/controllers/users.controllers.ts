import { Request, Response } from 'express'
import { LoginReqBody, LogoutReqBody, RegisterReqBody, TokenPayload } from '~/models/requests/User.requests'
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
  const result = await usersService.login(user_id.toString())
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

export const emailVerifyTokenController = async (req: Request, res: Response) => {
  // nếu mà code vào được đây thì nghĩa là email_verify_token hợp lệ
  // và mình đã lấy được decoded_email_verify_token
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  // dựa vào user_id tìm user và xem thử nó đã verify chưa?
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    throw new ErrorWithStatus({ message: USERS_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })
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
