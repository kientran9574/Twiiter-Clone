import { Router } from 'express'
import {
  changePasswordController,
  emailVerifyController,
  followController,
  forgotPasswordController,
  getMeController,
  getUserProfileController,
  loginController,
  logoutController,
  oauthController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  unFollowController,
  updateMeController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unFollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordValidator
} from '~/middlewares/users.middlewares'

const usersRouter = Router()
usersRouter.post('/login', loginValidator, loginController)
usersRouter.post('/refresh-token', refreshTokenValidator,  refreshTokenController)
usersRouter.get('/oauth/google', oauthController)
usersRouter.post('/register', registerValidator, registerController)
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, logoutController)
usersRouter.post('/verify-email', emailVerifyTokenValidator, emailVerifyController)
usersRouter.post('/resend-verify-email', accessTokenValidator, resendVerifyEmailController)
usersRouter.post('/forgot-password', forgotPasswordValidator, forgotPasswordController)
usersRouter.post('/verify-forgot-password', verifyForgotPasswordValidator, verifyForgotPasswordController)
usersRouter.post('/reset-password', resetPasswordValidator, resetPasswordController)
usersRouter.get('/me', accessTokenValidator, getMeController)
usersRouter.patch('/me', accessTokenValidator, verifiedUserValidator, updateMeValidator, updateMeController)
usersRouter.get('/:username', getUserProfileController)
usersRouter.post('/follow', accessTokenValidator, verifiedUserValidator, followValidator, followController)
usersRouter.delete(
  '/follow/:followed_user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unFollowValidator,
  unFollowController
)
usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  changePasswordController
)
export default usersRouter

// flow: "tài nguyên(URI)" -> (middlewares) -> (controller) -> (error handler) ---> nếu mà sử dụng như vậy thì sẽ chỉ có áp dụng lên được cái URI đó thôi
