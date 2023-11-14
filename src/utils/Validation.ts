import { log } from 'console'
import { EntityError } from '../models/Errors'
import { Request, Response, NextFunction } from 'express'
import { validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import { ErrorWithStatus } from '~/models/Errors'

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req)

    const errors = validationResult(req)

    if (errors.isEmpty()) {
      return next()
    }
    const errorObject = errors.mapped()
    const entityError = new EntityError({ errors: {} })
    // xử lý errorObject
    for (const key in errorObject) {
      // lấy msg của từng cái lỗi
      const { msg } = errorObject[key]
      // nếu msg có dạng ErrorWithStatus và status !== 422 thì ném cho default error handler xử lý
      if (msg instanceof ErrorWithStatus && msg.status !== 422) {
        return next(msg)
      }

      // lưu các lỗi 422 từ errorObject vào entityError
      entityError.errors[key] = msg
    }
    // ở đây nó xử lý lỗi luôn chứ k ném về error default handler

    next(entityError)
  }
}
