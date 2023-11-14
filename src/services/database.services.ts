import { MongoClient, Db, Collection } from 'mongodb'
import { config } from 'dotenv'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { Follower } from '~/models/schemas/Followers.schema'
import Tweet from '~/models/schemas/Tweet.schema'
config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@tweetproject.ovzeukz.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }
  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }

  async indexUsers() {
    const isExisted = await this.users.indexExists(['email_1', 'username_1', 'email_1_password_1'])
    !isExisted &&
      (await this.users.createIndex({ email: 1 }, { unique: true }), //register
      await this.users.createIndex({ username: 1 }, { unique: true }), // getProfile
      await this.users.createIndex({ email: 1, password: 1 })) // login()
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }

  async indexRefreshTokens() {
    const isExisted = await this.refreshTokens.indexExists(['token_1', 'exp_1'])
    !isExisted &&
      (await this.refreshTokens.createIndex({
        token: 1
      }),
      await this.refreshTokens.createIndex(
        { exp: 1 },
        {
          expireAfterSeconds: 0
        }
      ))
  }

  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string)
  }

  async indexFollowers() {
    const isExisted = await this.followers.indexExists(['user_id_1_followed_user_id_1'])
    !isExisted && (await this.followers.createIndex({ user_id: 1, followed_user_id: 1 }))
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_TWEETS_COLLECTION as string)
  }
}

const databaseService = new DatabaseService()
export default databaseService
