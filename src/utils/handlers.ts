import { NextFunction, RequestHandler, Request, Response } from 'express'

export const wrapAsync = (func: RequestHandler) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await func(req, res, next)
  } catch (error) {
    next(error)
  }
}
