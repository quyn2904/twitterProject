import { Router } from 'express'
import { createTweetController } from '~/controllers/tweets.controlers'
import { createTweetValidation } from '~/middlewares/tweets.middlewates'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const tweetsRouter = Router()

// làm route tạo tweet
/*
des: làm route tạo tweet
method: POST
headers: {Authorization: Bearer <access_token>}
body: TweetRequestBody
phải verify account thì mới được tạo tweet
*/
tweetsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidation,
  wrapAsync(createTweetController)
)

export default tweetsRouter
