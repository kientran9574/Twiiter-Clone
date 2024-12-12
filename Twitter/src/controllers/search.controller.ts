import { NextFunction, Request, Response } from 'express'
import searchService from '~/services/search.service'

export const searchController = async (req: Request, res: Response, next: NextFunction) => {
  const page = Number(req.query.page as string)
  const limit = Number(req.query.limit as string)
  console.log(req.query.page, req.query.limit)
  console.log('page và limit', page, limit)
  const result = await searchService.search({
    limit,
    page,
    content: req.query.content as string,
    user_id: req.decoded_authorization?.user_id as string
  })
  return res.json({
    message: 'search successfully',
    result: {
      tweets: result.tweets,
      limit,
      page,
      total_page: Math.ceil(result.total / limit)
    }
  })
}
