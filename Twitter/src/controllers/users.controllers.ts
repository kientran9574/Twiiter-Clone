import { NextFunction, Request, Response } from 'express'
import userService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody, TokenPayload, UpdateMeReqBody } from '~/models/request/User.request'
import HTTP_STATUS from '~/constants/httpStatus'
import { ObjectId } from 'mongodb'
import User from '~/models/databases/Users.schema'
import databaseService from '~/services/database.services'
import { ErrorWithStatus } from '~/models/Errors'
import { UserVerifyStatus } from '~/constants/enum'
import { pick } from 'lodash'
export const loginController = async (req: Request, res: Response) => {
  // lấy user ở đây để lấy lấy ra _id truyền qua service để khi login thành công thì sẽ tạo đc access_token và refresh_token vì 2 thằng này cần có _id
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await userService.login({ user_id: user_id.toString(), verify: user.verify })
  return res.status(HTTP_STATUS.CREATED).json({
    success: 'Login success',
    result
  })
}
export const refreshTokenController = async (req: Request, res: Response) => {
  const { refresh_token } = req.body
  const { user_id, verify , exp} = req.decoded_refresh_token as TokenPayload
  const result = await userService.refreshToken({ user_id, verify, refresh_token ,exp })
  return res.json({
    message: 'Refresh token success',
    result
  })
}
export const oauthController = async (req: Request, res: Response) => {
  const { code } = req.query
  const result = await userService.oauth(code as string)

  res.cookie('refresh_token', result.refresh_token, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  })
  // const urlRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&new_user=${result.newUser}&verify=${result.verify}`
  const urlRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${result.access_token}&new_user=${result.newUser}&verify=${result.verify}`
  return res.redirect(urlRedirect)
}

// register
export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await userService.register(req.body)
    //   bình thường chúng ta không nên sử dụng hàm trực tiếp để kết nối db , mình sẽ tách riêng ra service riêng
    //   const result = await databaseService.users.insertOne(
    //     new User({
    //       email,
    //       password
    //     })
    //   )
    return res.status(HTTP_STATUS.CREATED).json({
      success: 'Register success',
      result
    })
  } catch (error) {
    // di chuyển tới error handler
    next(error)
  }
}

export const logoutController = async (req: Request<ParamsDictionary, any, TokenPayload>, res: Response) => {
  const { refresh_token } = req.body
  if (refresh_token) {
    const result = await userService.logout(refresh_token)
    return res.status(HTTP_STATUS.CREATED).json({
      message: 'Logout success',
      result
    })
  }
}

export const emailVerifyController = async (req: Request<ParamsDictionary, any, TokenPayload>, res: Response) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })
  if (!user) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.NOT_FOUND,
      message: ' User not Found'
    })
  }
  if (user.email_verify_token === '') {
    return res.json({
      message: 'user success before'
    })
  }
  const result = await userService.verifyEmail(user_id.toString())
  return res.json({
    message: 'user success email verify before',
    result
  })
}
export const resendVerifyEmailController = async (req: Request<ParamsDictionary, any, TokenPayload>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.NOT_FOUND,
      message: ' User not Found'
    })
  }
  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: 'user success email verify before'
    })
  }
  const result = await userService.resendVerifyEmail(user_id)
  return res.json(result)
}
export const forgotPasswordController = async (req: Request<ParamsDictionary, any, TokenPayload>, res: Response) => {
  const { _id, verify } = req.user as User
  const result = await userService.forgotPassword({ user_id: (_id as ObjectId).toString(), verify })
  return res.json(result)
}
export const verifyForgotPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  return res.json({
    message: 'verify forgot password success'
  })
}
export const resetPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decode_forgot_password_token as TokenPayload
  const { password } = req.body
  const result = await userService.resetPassword(user_id, password)
  return res.json({
    result
  })
}
export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await userService.getMe(user_id)
  return res.json({
    message: 'get me success',
    result
  })
}
export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const payload = pick(req.body, [
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ])
  const body = payload
  console.log('🚀 ~ body:', body)
  const result = await userService.updateMe(user_id, body)

  return res.json({
    message: 'Update profile success',
    data: result
  })
}
export const getUserProfileController = async (
  req: Request<ParamsDictionary, any, UpdateMeReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { username } = req.params
  const result = await userService.getUserProfile(username)
  console.log('🚀 ~ result:', result)
  return res.json({
    message: 'get user profile success',
    data: result
  })
}
export const followController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.body
  const result = await userService.follow(user_id, followed_user_id)
  return res.json(result)
}
export const unFollowController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.params
  const result = await userService.unFollow(user_id, followed_user_id)
  return res.json(result)
}
export const changePasswordController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { password } = req.body
  const result = await userService.changePassword(user_id, password)
  return res.json(result)
}
