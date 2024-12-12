import { Collection, Db, MongoClient } from 'mongodb'
import Bookmark from '~/models/databases/Bookmarks.schema'
import Follower from '~/models/databases/Follower.schema'
import Hashtag from '~/models/databases/Hashtags.schema'
import Like from '~/models/databases/Like.schema'
import RefreshToken from '~/models/databases/RefreshToken.schema'
import Tweet from '~/models/databases/Tweets.schema'
import User from '~/models/databases/Users.schema'
import VideoStatus from '~/models/databases/VideoStatus.schema'
const uri = `mongodb+srv://kientran9574:vankien237@cluster0.ptvqk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db('Hoc')
  }
  //  hàm connect
  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB! 1233')
      //   Không nên dùng finally nhé vì là thành công hay thất bại nó đều dừng kết nối khiến mình bị lỗi đấy
    } catch (error) {
      await this.client.close()
      throw error
    }
  }
  indexUser() {
    this.users.createIndex({ email: 1, password: 1 })
    // this.users.createIndex({ email: 1 }, { unique: true })
    // this.users.createIndex({ password: 1 }, { unique: true })
  }
  //   Dùng hàm get để lấy ra collection user
  get users(): Collection<User> {
    return this.db.collection('users')
  }
  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection('refresh_tokens')
  }
  get followers(): Collection<Follower> {
    return this.db.collection('followers')
  }
  get videoStatus(): Collection<VideoStatus> {
    return this.db.collection('video_status')
  }
  get tweets(): Collection<Tweet> {
    return this.db.collection('tweets')
  }
  get hashtags(): Collection<Hashtag> {
    return this.db.collection('hashtags')
  }
  get bookmarks(): Collection<Bookmark> {
    return this.db.collection('bookmarks')
  }
  get likes(): Collection<Like> {
    return this.db.collection("likes")
  }
}
const databaseService = new DatabaseService()
export default databaseService
