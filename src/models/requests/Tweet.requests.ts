import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '../Other'

// định nghĩa người dùng truyền lên cái gì để tạo tweet
export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags: string[] // không dùng objectId vì người dùng chỉ truyền lên được string
  mentions: string[]
  medias: Media[]
}
