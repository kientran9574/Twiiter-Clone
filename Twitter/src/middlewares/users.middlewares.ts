import { NextFunction, Request, Response } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { REGEX_USERNAME } from '~/constants/Regex'
import { UserVerifyStatus } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/request/User.request'
import databaseService from '~/services/database.services'
import userService from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

const customPassword: ParamSchema = {
  isLength: {
    options: {
      min: 6,
      max: 40
    }
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage:
      'Confirm password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol'
  }
}
const customConfirmPassword: ParamSchema = {
  isLength: {
    options: {
      min: 6,
      max: 40
    }
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage:
      'Confirm password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol'
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password')
      }
      return true
    }
  }
}
const cusTomVerifyForgotPasswordValidator: ParamSchema = {
  trim: true,
  custom: {
    options: async (value, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.NOT_FOUND,
          message: 'forgot_password_token not found'
        })
      }
      try {
        const decode_forgot_password_token = await verifyToken({
          token: value,
          secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_VERIFY_TOKEN as string
        })
        const { user_id } = decode_forgot_password_token
        const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
        if (user === null) {
          throw new ErrorWithStatus({
            message: 'User not found',
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            message: 'forgot_password_token not match',
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        req.decode_forgot_password_token = decode_forgot_password_token
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: error.message,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        throw error
      }
      return true
    }
  }
}
// Những cái field updateMe (trong body của người dùng), mình đang validator cho những cái field này khi người dùng updateMe
const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: 'Name is Required'
  },
  isString: {
    errorMessage: 'name must be a string'
  },
  trim: true,

  isLength: {
    options: {
      min: 1,
      max: 100
    },
    errorMessage: 'name is 1 to 100 length'
  }
}
// ---------------------------------------------------------------------------------------------------------
const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    },
    errorMessage: 'data_of_birth must be a ISOString'
  }
}
const imageSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: 'image url must be a string'
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 400
    },
    errorMessage: 'image url is to 1 to 400'
  }
}
export const loginValidator = validate(
  checkSchema({
    email: {
      notEmpty: true,
      isEmail: true,
      trim: true,
      custom: {
        options: async (value, { req }) => {
          // dùng để login
          const user = await databaseService.users.findOne({ email: value, password: hashPassword(req.body.password) })
          console.log('🚀 ~ options: ~ user:', user)
          if (user === null) {
            throw new Error('user không được là null')
          }
          req.user = user
          return true
        }
      }
    },
    password: {
      isLength: {
        options: {
          min: 6,
          max: 40
        }
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage:
          'Confirm password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol'
      }
    }
  })
)

export const registerValidator = validate(
  checkSchema({
    name: {
      isString: true,
      notEmpty: true,
      isLength: {
        options: {
          min: 5,
          max: 100
        }
      },
      trim: true
    },
    email: {
      notEmpty: true,
      isEmail: true,
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const isEmailExist = await userService.checkEmailExist(value)
          if (isEmailExist) {
            throw new Error('Email is already')
          }
          const user = databaseService.users.findOne({ email: value })
          if (user === null) {
            throw new Error('user không được là null')
          }
          req.user = user
          return true
        }
      }
    },
    password: {
      isLength: {
        options: {
          min: 6,
          max: 40
        }
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage:
          'Confirm password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol'
      }
    },
    confirm_password: {
      isLength: {
        options: {
          min: 6,
          max: 40
        }
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage:
          'Confirm password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol'
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password')
          }
          return true
        }
      }
    },
    date_of_birth: {
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        }
      }
    }
  })
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            // mục đính làm như này là để trả ra lỗi 401 , chứ nếu dùng bình thường của thằng checkSchema express-validator này thì mặc định sẽ là 422
            if (!value) {
              throw new ErrorWithStatus({
                message: 'access_token is required',
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            const access_token = value.split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: 'access_token is invalid',
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
              ;(req as Request).decoded_authorization = decoded_authorization
              console.log('123, access_token', decoded_authorization)
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: error.message,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)
export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: 'refresh_token is required',
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({
                  token: value,
                  secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
                }),
                databaseService.refreshTokens.findOne({ token: value })
              ])
              if (refresh_token === null) {
                throw new ErrorWithStatus({
                  message: 'used refresh_token or not exits',
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              req.decoded_refresh_token = decoded_refresh_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  // Không đúng định dạng tức là token đó nó không có đúng , nghĩa là m truyền sai hoặc nhập sai đấy hoặc sai chính tả đấy
                  message: 'refresh_token is invalid',
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }
          }
        }
      }
    },
    ['body']
  )
)
export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: 'email verify is required',
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_email_verify_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
              })
              ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  // Không đúng định dạng tức là token đó nó không có đúng , nghĩa là m truyền sai hoặc nhập sai đấy hoặc sai chính tả đấy
                  message: 'refresh_token is invalid',
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
            }
          }
        }
      }
    },
    ['headers', 'body']
  )
)
export const forgotPasswordValidator = validate(
  checkSchema({
    email: {
      isEmail: {
        errorMessage: 'Email is invalid'
      },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const user = await databaseService.users.findOne({ email: value })
          if (user === null) {
            throw new ErrorWithStatus({
              message: 'User not found',
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          req.user = user
          return true
        }
      }
    }
  })
)
export const verifyForgotPasswordValidator = validate(
  checkSchema({
    forgot_password_token: cusTomVerifyForgotPasswordValidator
  })
)
// Gửi bằng body hết
export const resetPasswordValidator = validate(
  checkSchema({
    password: customPassword,
    confirm_password: customConfirmPassword,
    forgot_password_token: cusTomVerifyForgotPasswordValidator
  })
)

export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization as TokenPayload
  if (verify !== UserVerifyStatus.Verified) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.FORBIDDEN,
      message: 'User not verified'
    })
  }
  next()
}

export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSchema,
        optional: true,
        notEmpty: undefined
      },
      date_of_birth: {
        ...dateOfBirthSchema,
        optional: true
      },
      bio: {
        optional: true,
        isString: {
          errorMessage: 'Bio must be a string'
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: 'Bio is 1 to 200 length'
        }
      },
      location: {
        optional: true,
        isString: {
          errorMessage: 'Location must be a string'
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: 'Location is 1 to 200 length'
        }
      },
      website: {
        optional: true,
        isString: {
          errorMessage: 'website must be a string'
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: 'website is 1 to 200 length'
        }
      },
      username: {
        optional: true,
        isString: {
          errorMessage: 'username must be a string'
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!REGEX_USERNAME.test(value)) {
              throw Error('username invalid')
            }
            const username = await databaseService.users.findOne({ username: value })
            if (username) {
              throw Error('username is existed')
            }
          }
        }
      },
      avatar: imageSchema,
      cover_photo: imageSchema
    },
    ['body']
  )
)
export const followValidator = validate(
  checkSchema(
    {
      followed_user_id: {
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: 'User not found'
              })
            }
            // check xem là có người đó tồn tại trong database hay không
            const objectId = new ObjectId(value as string)
            const followed_user = await databaseService.users.findOne({ _id: objectId })
            if (followed_user === null) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: 'User invalid'
              })
            }
          }
        }
      }
    },
    ['body']
  )
)
export const unFollowValidator = validate(
  checkSchema(
    {
      followed_user_id: {
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: 'User not found'
              })
            }
            // check xem là có người đó tồn tại trong database hay không
            const objectId = new ObjectId(value)
            const followed_user = await databaseService.users.findOne({ _id: objectId })
            if (followed_user === null) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: 'User invalid'
              })
            }
          }
        }
      }
    },
    ['params']
  )
)
export const changePasswordValidator = validate(
  checkSchema(
    {
      old_password: {
        ...customPassword,
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decoded_authorization as TokenPayload
            const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
            if (!user) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: 'User not fount'
              })
            }
            const { password } = user
            const isMatch = hashPassword(value) === password
            if (!isMatch) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: 'old password not match'
              })
            }
          }
        }
      },
      password: customPassword,
      confirm_password: customConfirmPassword
    },
    ['body']
  )
)
