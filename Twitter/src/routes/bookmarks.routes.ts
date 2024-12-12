import { Router } from 'express'
import { bookmarkTweetController, unBookmarkTweetController } from '~/controllers/bookmarks.controller'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
const bookmarksRouter = Router()
/**
 * Description: Bookmark Tweet
 * Path: /
 * Method: POST
 * Body: { tweet_id: string }
 * Header: { Authorization: Bearer <access_token> }
 */
bookmarksRouter.post('', accessTokenValidator, verifiedUserValidator, tweetIdValidator, bookmarkTweetController)
bookmarksRouter.delete(
  '/tweet_id/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  unBookmarkTweetController
)
export default bookmarksRouter
