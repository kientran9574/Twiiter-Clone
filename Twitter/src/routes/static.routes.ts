import { Router } from 'express'
import {
  serveSegmentController,
  staticImageController,
  staticM3u8Controller,
  staticVideoController
} from '~/controllers/static.controllers'
const staticRouter = Router()
staticRouter.get('/image/:name', staticImageController)
staticRouter.get('/video/:name', staticVideoController)
staticRouter.get('/video-hls/:id/master.m3u8', staticM3u8Controller)
staticRouter.get('/video-hls/:id/:v/:segment', serveSegmentController)
export default staticRouter
