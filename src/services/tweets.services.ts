import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId } from 'mongodb'

class TweetsService {
  async createTweet({ user_id, body }: { user_id: string; body: TweetRequestBody }) {
    // lưu vào database
    const { audience, content, hashtags, mentions, type, parent_id, medias } = body
    const reuslt = await databaseService.tweets.insertOne(
      new Tweet({
        user_id: new ObjectId(user_id),
        audience,
        content,
        hashtags: [],
        mentions,
        type,
        parent_id,
        medias
      })
    )
    // result: có 2 thuốc tính: {acknowledged: true, insertedId: 'id của tweet vừa tạo'}
    // lấy id của tweet vừa tạo
    const tweet = await databaseService.tweets.findOne({ _id: new ObjectId(reuslt.insertedId) })
    return tweet
  }
}

const tweetsService = new TweetsService()
export default tweetsService
