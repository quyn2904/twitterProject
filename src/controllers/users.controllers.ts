import { Request, Response } from 'express'
import { RegisterReqBody } from '~/models/requests/User.requests'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'admin@gmail.com' && password === '123456') {
    return res.json({
      message: 'Login successfully',
      result: [
        { name: 'Điệp', yob: 1999 },
        { name: 'Hùng', yob: 2004 },
        { name: 'Được', yob: 1994 }
      ]
    })
  }
  return res.status(401).json({
    error: 'Wrong email or password'
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  try {
    const result = await usersService.register(req.body)
    res.json({
      message: 'Register successfully',
      result
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Register failed',
      error
    })
  }
}
