import Tweet from './models/databases/Tweets.schema'
import User from './models/databases/Users.schema'
import { TokenPayload } from './models/request/User.request'
declare module 'express' {
  interface Request {
    user?: User
    decoded_refresh_token?: TokenPayload
    decoded_authorization?: TokenPayload
    decoded_email_verify_token?: TokenPayload
    decode_forgot_password_token?: TokenPayload
    tweet?: Tweet
  }
}
