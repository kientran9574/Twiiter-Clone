import { NextFunction, Request, Response } from 'express'
import { mediasService } from '~/services/medias.service'
export const uploadSingleImageController = async (req: Request, res: Response) => {
  const data = await mediasService.handleUploadSingleImage(req)
  return res.json({
    data
  })
}
export const uploadMultipleImageController = async (req: Request, res: Response) => {
  const data = await mediasService.handleUploadImages(req)
  return res.json({
    data
  })
}
export const uploadVideoController = async (req: Request, res: Response) => {
  const data = await mediasService.handleUploadVideoDir(req)
  return res.json({
    message: 'Upload video success',
    data
  })
}
export const uploadVideoHlsController = async (req: Request, res: Response) => {
  const url = await mediasService.uploadVideoHls(req)
  return res.json({
    message: 'Upload video hls success',
    data: url
  })
}
export const videoStatusController = async (req: Request, res: Response) => {
  const { id } = req.params
  const data = await mediasService.videoStatusService(id)
  return res.json({
    message: 'check video status success',
    data
  })
}
