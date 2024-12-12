import { audienceValidator, getTweetChildrenValidator, paginationValidator, tweetIdValidator } from '~/middlewares/tweets.middlewares'
import {
  createTweetController,
  getNewFeedsController,
  getTweetChildrenController,
  getTweetController
} from './../controllers/tweets.controller'
import {
  accessTokenValidator,
  isUserLoggedInValidator,
  verifiedUserValidator
} from './../middlewares/users.middlewares'
import { Router } from 'express'

const tweetsRouter = Router()

tweetsRouter.post('', accessTokenValidator, verifiedUserValidator, tweetIdValidator, createTweetController)


/**
 * Description: Get new feeds
 * Path: /
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Query: { limit: number, page: number }
 */
tweetsRouter.get(
  '/new-feeds',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  getTweetChildrenValidator,
  getTweetChildrenController
)
/**
 * Description: Get new feeds
 * Path: /
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Query: { limit: number, page: number }
 */
tweetsRouter.get(
  '/new-feeds',
  paginationValidator,
  accessTokenValidator,
  verifiedUserValidator,
  getNewFeedsController
)
/**
 * Description: Get Tweet detail
 * Path: /:tweet_id
 * Method: GET
 * Header: { Authorization?: Bearer <access_token> }
 */
tweetsRouter.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  getTweetController
)

/**
 * Description: Get Tweet Children
 * Path: /:tweet_id/children
 * Method: GET
 * Header: { Authorization?: Bearer <access_token> }
 * Query: {limit: number, page: number, tweet_type: TweetType}
 */
tweetsRouter.get(
  '/:tweet_id/children',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  getTweetChildrenValidator,
  getTweetChildrenController
)




export default tweetsRouter
