import { Router } from 'express'
import { likeTweetController, unLikeTweetController } from '~/controllers/like.controller'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'

const likesRouter = Router()
likesRouter.post('', accessTokenValidator, verifiedUserValidator, tweetIdValidator, likeTweetController)
likesRouter.delete(
  '/tweet_id/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  unLikeTweetController
)
export default likesRouter
