import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { LikeTweetReqBody } from '~/models/request/Like.request'
import { TokenPayload } from '~/models/request/User.request'
import likeService from '~/services/like.service'
export const likeTweetController = async (req: Request<ParamsDictionary, any, LikeTweetReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await likeService.likeDocument(user_id, req.body.tweet_id)
  return res.json({
    message: 'Like success',
    result
  })
}
export const unLikeTweetController = async (req: Request<ParamsDictionary, any, LikeTweetReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  await likeService.unLikeDocument(user_id, req.params.tweet_id)
  return res.json({
    message: 'Like delete success'
  })
}
