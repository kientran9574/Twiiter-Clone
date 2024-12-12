import { Request } from 'express'
import { File } from 'formidable'
import fs from 'fs'
import { StringChain } from 'lodash'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { EncodingStatus, MediaType } from '~/constants/enum'
import { Media } from '~/models/Other'
import VideoStatus from '~/models/databases/VideoStatus.schema'
import {
  getNameFromFullname,
  handleUploadImagesToTemp,
  handleUploadSingleImageToTemp,
  handleUploadVideo,
  handleUploadVideoHls
} from '~/utils/file'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import databaseService from './database.services'

// Tạo hàng đợi
class Queue {
  items: string[]
  encoding: boolean
  constructor() {
    this.items = []
    this.encoding = false
  }
  async enqueue(item: string) {
    this.items.push(item)
    // item = /home/duy/Downloads/12312312/1231231221.mp4
    const idName = item.split('\\').pop() as string
    console.log('🚀 ~ Queue ~ enqueue ~ idName:', idName)
    await databaseService.videoStatus.insertOne(
      new VideoStatus({
        name: idName,
        status: EncodingStatus.Pending
      })
    )
    this.processEncode()
  }
  async processEncode() {
    if (this.encoding) return
    if (this.items.length > 0) {
      // Nếu nó request thứ nhất đang encode thì không cho thằng thứ hai chạy
      this.encoding = true
      // Lấy ra item thứ đầu tiên
      const videoPath = this.items[0]
      const idName = videoPath.split('\\').pop() as string
      console.log('🚀 ~ Queue ~ enqueue ~ idName:', idName)
      await databaseService.videoStatus.updateOne(
        {
          name: idName
        },
        {
          $set: {
            status: EncodingStatus.Processing
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
      try {
        await encodeHLSWithMultipleVideoStreams(videoPath)
        this.items.shift()
        fs.unlinkSync(videoPath)
        const idName = videoPath.split('\\').pop() as string
        console.log('🚀 ~ Queue ~ enqueue ~ idName:', idName)
        await databaseService.videoStatus.updateOne(
          {
            name: idName
          },
          {
            $set: {
              status: EncodingStatus.Success
            },
            $currentDate: {
              updated_at: true
            }
          }
        )
        console.log(`Encode video ${videoPath} success`)
      } catch (error) {
        const idName = videoPath.split('\\').pop() as string
        console.log('🚀 ~ Queue ~ enqueue ~ idName:', idName)
        await databaseService.videoStatus.updateOne(
          {
            name: idName
          },
          {
            $set: {
              status: EncodingStatus.Failed
            },
            $currentDate: {
              updated_at: true
            }
          }
        )
        console.error(`Encode video ${videoPath} error`)
        console.error(error)
      }
      this.encoding = false
      // Thực hiện đệ quy để gọi lại nó , cho request thứ hai chạy vào khi request thứ nhất nó encode xong
      this.processEncode()
    } else {
      console.log('Encode video queue is empty')
    }
  }
}
const queue = new Queue()
//---------------------------------------------------------------------------
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
        queue.enqueue(file.filepath)
        // await encodeHLSWithMultipleVideoStreams(file.filepath)
        // const newName = getNameFromFullname(file.newFilename)
        // fs.unlinkSync(file.filepath)
        return {
          url: `http://localhost:4000/static/video-hls/${file.newFilename}.m3u8`,
          type: MediaType.VideoHls
        }
      })
    )
    return result
  }
  async videoStatusService(id: string) {
    const data = await databaseService.videoStatus.findOne({ name: id })
    return data
  }
}

export const mediasService = new MediasService()
