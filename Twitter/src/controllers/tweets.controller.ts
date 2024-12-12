import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { TweetRequestBody } from '~/models/request/Tweet.request'
import { TokenPayload } from '~/models/request/User.request'
import tweetsService from '~/services/tweets.service'
import { TweetType } from '~/constants/enum'
import databaseService from '~/services/database.services'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetsService.createTweet(user_id, req.body)
  return res.json({
    message: 'Create Tweet Successfully',
    result
  })
}

export const getTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const result = await tweetsService.increaseView(req.params.tweet_id, req.decoded_authorization?.user_id)
  const tweet = {
    ...req.tweet,
    user_views: result.user_views,
    guest_views: result.guest_views
  }
  return res.json({
    message: 'Get Tweet Details Successfully',
    result: tweet
  })
}
export const getTweetChildrenController = async (
  req: Request<ParamsDictionary, any, TweetRequestBody>,
  res: Response
) => {
  const page = Number(req.query.page as string)
  const limit = Number(req.query.limit as string)
  const tweet_type = Number(req.query.tweet_type as string) as TweetType
  const { tweets, total } = await tweetsService.getTweetChildren({
    tweet_id: req.params.tweet_id,
    page,
    limit,
    tweet_type,
    user: req.decoded_authorization?.user_id
  })
  return res.json({
    message: 'Get Tweet Children Successfully',
    results: {
      tweets,
      page,
      limit,
      tweet_type,
      total_page: Math.ceil(total / limit) // làm tròn nếu như là 0.4 => 1 , 1.4 => 2
    }
  })
}
export const getNewFeedsController = async (req: Request, res: Response) => {
  const user_id = req.decoded_authorization?.user_id as string
  const limit = Number(req.query.limit as string)
  const page = Number(req.query.page as string)
  const { tweets, total } = await tweetsService.newFeedsService({ user_id, limit, page })
  return res.json({
    message: 'Get New Feeds Successfully',
    tweets,
    limit,
    page,
    total_page: Math.ceil(total / limit)
  })
}
