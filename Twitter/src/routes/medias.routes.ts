import { Router } from 'express'
import {
  uploadMultipleImageController,
  uploadSingleImageController,
  uploadVideoController,
  uploadVideoHlsController
} from '~/controllers/medias.controllers'

const mediasRoutes = Router()
mediasRoutes.post('/upload-image', uploadSingleImageController)
mediasRoutes.post('/upload-image-multiple', uploadMultipleImageController)
mediasRoutes.post('/upload-video', uploadVideoController)
mediasRoutes.post('/upload-video-hls', uploadVideoHlsController)
export default mediasRoutes
