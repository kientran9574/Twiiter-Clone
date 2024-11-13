import { Request } from 'express'
import { File } from 'formidable'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { MediaType } from '~/constants/enum'
import { Media } from '~/models/Other'
import {
  getNameFromFullname,
  handleUploadImagesToTemp,
  handleUploadSingleImageToTemp,
  handleUploadVideo,
  handleUploadVideoHls
} from '~/utils/file'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'

class MediasService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSingleImageToTemp(req)
    const newName = getNameFromFullname(file.newFilename)
    const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
    // sharp.cache(false)
    await sharp(file.filepath).jpeg().toFile(newPath)
    fs.unlinkSync(file.filepath)
    return {
      url: `http://localhost:4000/static/image/${newName}.jpg`,
      type: MediaType.Image
    }
  }
  async handleUploadImages(req: Request) {
    const files = await handleUploadImagesToTemp(req)
    const result: Media[] = await Promise.all(
      files.map(async (file: File) => {
        const newName = getNameFromFullname(file.newFilename)
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
        await sharp(file.filepath).jpeg().toFile(newPath)
        fs.unlinkSync(file.filepath)
        return {
          url: `http://localhost:4000/static/image/${newName}.jpg`,
          type: MediaType.Image
        }
      })
    )
    return result
  }
  async handleUploadVideoDir(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = await Promise.all(
      files.map((file) => {
        console.log('file upload vide', file)
        return {
          url: `http://localhost:4000/static/video/${file.newFilename}`,
          type: MediaType.Video
        }
      })
    )
    return result
  }
  async uploadVideoHls(req: Request) {
    const files = await handleUploadVideoHls(req)
    const result = await Promise.all(
      files.map(async (file) => {
        console.log(file)
        await encodeHLSWithMultipleVideoStreams(file.filepath)
        // const newName = getNameFromFullname(file.newFilename)
        console.log('🚀 ~ MediasService ~ files.map ~ newName:', file.newFilename)
        fs.unlinkSync(file.filepath)
        return {
          url: `http://localhost:4000/static/video-hls/${file.newFilename}.m3u8`,
          type: MediaType.VideoHls
        }
      })
    )
    return result
  }
}

export const mediasService = new MediasService()
