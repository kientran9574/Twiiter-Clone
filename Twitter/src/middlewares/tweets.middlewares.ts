import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enum'
import { ErrorWithStatus } from '~/models/Errors'
import Tweet from '~/models/databases/Tweets.schema'
import { TokenPayload } from '~/models/request/User.request'
import databaseService from '~/services/database.services'
import { numberToArray } from '~/utils/common'
import { validate } from '~/utils/validation'

const tweetType = numberToArray(TweetType)
const tweetAudiences = numberToArray(TweetAudience)
const mediaTypes = numberToArray(MediaType)
export const createTweetValidator = validate(
  checkSchema({
    type: {
      isIn: {
        options: [tweetType],
        errorMessage: 'Invalid type'
      }
    },
    audience: {
      isIn: {
        options: [tweetAudiences],
        errorMessage: 'Invalid audience'
      }
    },
    parent_id: {
      custom: {
        options: (value, { req }) => {
          // Nếu `type` là retweet, comment, quotetweet thì `parent_id` phải là `tweet_id` của tweet cha (cái id của collection tweet)
          const type = req.body.type as TweetType
          if ([TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) && !ObjectId.isValid(value)) {
            throw new Error('PARENT_ID_MUST_BE_A_VALID_TWEET_ID')
          }
          // nếu `type` là tweet thì `parent_id` phải là `null`
          if (type === TweetType.Tweet && value !== null) {
            throw new Error('Parent id must be nul')
          }
          return true
        }
      }
    },
    content: {
      isString: true,
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          const hashtags = req.body.hashtags as string[]
          const mentions = req.body.mentions as string[]
          if (
            [TweetType.Comment, TweetType.QuoteTweet, TweetType.Tweet].includes(type) &&
            isEmpty(hashtags) &&
            isEmpty(mentions) &&
            value === ''
          ) {
            throw new Error('Content must be a non-empty string')
          }
          // Nếu `type` là retweet thì `content` phải là `''`.
          if (type === TweetType.Retweet && value !== '') {
            throw new Error('Content must be empty string')
          }
          return true
        }
      }
    },
    hashtags: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          if (value.some((item: any) => typeof item !== 'string')) {
            throw new Error('Hashtags must be an array of string')
          }
          return true
        }
      }
    },
    mentions: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // Yêu cầu mỗi phần từ trong array là user_id
          if (value.some((item: any) => !ObjectId.isValid(value))) {
            throw new Error('Mentions must be an array of string')
          }
          return true
        }
      }
    },
    medias: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          if (
            value.some((item: any) => {
              return typeof item.url !== 'string' || !mediaTypes.includes(item.type)
            })
          ) {
            throw new Error('Medias must be an array of media object')
          }
          return true
        }
      }
    }
  })
)
export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new Error('tweet_id required')
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                status: 400,
                message: 'tweet_id invalid'
              })
            }
            const [tweet] = await databaseService.tweets
              .aggregate<Tweet>([
                {
                  $match: {
                    _id: new ObjectId(value)
                  }
                },
                {
                  $lookup: {
                    from: 'hashtags',
                    localField: 'hashtags',
                    foreignField: '_id',
                    as: 'hashtags'
                  }
                },
                {
                  $lookup: {
                    from: 'users',
                    localField: 'mentions',
                    foreignField: '_id',
                    as: 'mentions'
                  }
                },
                {
                  $addFields: {
                    mentions: {
                      $map: {
                        input: '$mentions',
                        as: 'mention',
                        in: {
                          _id: '$$mention._id',
                          name: '$$mention.name',
                          username: '$$mention.username',
                          email: '$$mention.email'
                        }
                      }
                    }
                  }
                },
                {
                  $lookup: {
                    from: 'bookmarks',
                    localField: '_id',
                    foreignField: 'tweet_id',
                    as: 'bookmarks'
                  }
                },
                {
                  $lookup: {
                    from: 'likes',
                    localField: '_id',
                    foreignField: 'tweet_id',
                    as: 'likes'
                  }
                },
                {
                  $lookup: {
                    from: 'tweets',
                    localField: '_id',
                    foreignField: 'parent_id',
                    as: 'tweet_children'
                  }
                },
                {
                  $addFields: {
                    bookmarks: {
                      $size: '$bookmarks'
                    },
                    likes: {
                      $size: '$likes'
                    },
                    retweet_count: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', TweetType.Retweet]
                          }
                        }
                      }
                    },
                    comment_count: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', TweetType.Comment]
                          }
                        }
                      }
                    },
                    quote_count: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', TweetType.QuoteTweet]
                          }
                        }
                      }
                    },
                    views: {
                      $add: ['$user_views', '$guest_views']
                    }
                  }
                },
                {
                  $project: {
                    tweet_children: 0
                  }
                }
              ])
              .toArray()
            if (!tweet) {
              throw new ErrorWithStatus({
                status: 404,
                message: 'tweet_id not found'
              })
            }
            req.tweet = tweet
            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)
export const audienceValidator = async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet
  try {
    if (tweet.audience === TweetAudience.TwitterCircle) {
      // Kiểm tra xem tweet này đã đăng nhâp hay chưa
      if (!req.decoded_authorization) {
        throw new ErrorWithStatus({
          message: 'access token is required 123',
          status: 401
        })
      }
      // Tác giả
      const author = await databaseService.users.findOne({
        _id: new ObjectId(tweet.user_id)
      })
      if (!author || author.verify === UserVerifyStatus.Banned) {
        throw new ErrorWithStatus({
          message: 'user not found',
          status: 404
        })
      }
      // kiểm tra người xem tweet này có trong twitter circle của tác giả hay không ?
      const { user_id } = req.decoded_authorization as TokenPayload
      const isInTwitterCircle = author.twitter_circle.some((_author) => _author.equals(user_id))
      // Nếu bạn không phải là tác giả và không nằm trong twitter_circle  thì quăng lỗi
      if (!author._id.equals(user_id) && !isInTwitterCircle) {
        throw new ErrorWithStatus({
          message: 'tweet is not public',
          status: 403
        })
      }
    }
    next()
  } catch (error) {
    console.log(error)
  }
}
export const getTweetChildrenValidator = validate(
  checkSchema(
    {
      tweet_type: {
        isIn: {
          options: [tweetType],
          errorMessage: 'Invalid type'
        }
      },
      limit: {
        isNumeric: true,
        custom: {
          options: (value, { req }) => {
            const number = Number(value)
            if (number > 100 || number < 1) {
              throw new Error('1 <= limit <= 100')
            }
            return true
          }
        }
      },
      page: {
        isNumeric: true,
        custom: {
          options: (value, { req }) => {
            const number = Number(value)
            if (number < 1) {
              throw new Error('Page is minimum 1')
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)
export const paginationValidator = validate(
  checkSchema({
    limit: {
      isNumeric: true,
      custom: {
        options: (value, { req }) => {
          const number = Number(value)
          if (number > 100 || number < 1) {
            throw new Error('1 <= limit <= 100')
          }
          return true
        }
      }
    },
    page: {
      isNumeric: true,
      custom: {
        options: (value, { req }) => {
          const number = Number(value)
          if (number < 1) {
            throw new Error('Page is minimum 1')
          }
          return true
        }
      }
    }
  },["query"])
)
