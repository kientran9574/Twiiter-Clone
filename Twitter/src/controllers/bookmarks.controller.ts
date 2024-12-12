import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BookmarkTweetReqBody } from '~/models/request/Bookmark.requests'
import { TokenPayload } from '~/models/request/User.request'
import bookmarkService from '~/services/bookmarks.service'

export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await bookmarkService.bookmarkTweet(user_id, req.body.tweet_id)
  return res.json({
    message: 'Bookmarks successfully',
    result
  })
}
export const unBookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  await bookmarkService.unBookmarkTweet(user_id, req.params.tweet_id)
  return res.json({
    message: 'Bookmarks delete successfully'
  })
}
