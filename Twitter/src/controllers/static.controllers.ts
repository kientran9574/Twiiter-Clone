import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
export const staticImageController = async (req: Request, res: Response) => {
  const { name } = req.params
  const uploadsPath = path.resolve(UPLOAD_IMAGE_DIR, name)
  return res.sendFile(uploadsPath, (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}
// video
export const staticVideoController = async (req: Request, res: Response) => {
  const mime = (await import('mime')).default
  const range = req.headers.range
  console.log('🚀 ~ staticVideoController ~ range:', range)
  if (!range) {
    return res.status(404).send('Requires Range header')
  }

  const { name } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)
  const videoSize = fs.statSync(videoPath).size
  const chunkSize = 10 ** 6 // 1mb
  const start = Number(range.replace(/\D/g, ''))
  const end = Math.min(start + chunkSize, videoSize - 1)
  const contentLength = end - start + 1
  const contentType = mime.getType(videoPath) || 'video/*'
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(206, headers)
  const videoSteams = fs.createReadStream(videoPath, { start, end })
  videoSteams.pipe(res)
}
export const staticM3u8Controller = async (req: Request, res: Response) => {
  const { id } = req.params
  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, 'master.m3u8'), (err) => {
    if (err) {
      res.status(500).send('Not Found')
    }
  })
}
export const serveSegmentController = (req: Request, res: Response, next: NextFunction) => {
  const { id, v, segment } = req.params
  console.log('🚀 ~ serveSegmentController ~ segment:', segment)
  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, v, segment), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}
