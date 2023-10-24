import { NextFunction, Request, Response } from 'express'
import { RegisterReqBody } from '~/models/requests/User.requests'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'

export const loginController = async (req: Request, res: Response) => {
  // lấy user_id từ user của req
  const { user }: any = req
  const user_id = user._id // user._id là object id lấy từ mongodb
  // dùng user_id để tạo access_token và refresh_token
  const result = await usersService.login(user_id.toString())
  // res về access_token và refresh_token cho client
  res.json({
    message: 'Login successfully',
    result
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  res.json({
    message: 'Register successfully',
    result
  })
}
