import { Collection, Db, MongoClient } from 'mongodb'
import Follower from '~/models/databases/Follower.schema'
import RefreshToken from '~/models/databases/RefreshToken.schema'
import User from '~/models/databases/Users.schema'
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
}
const databaseService = new DatabaseService()
export default databaseService
