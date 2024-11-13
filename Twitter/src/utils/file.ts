import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import path from 'path'
import { UPLOAD_IMAGE_TEMP, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  // const uploadFolderPath = path.resolve(UPLOAD_IMAGE_TEMP)
  // if (!fs.existsSync(uploadFolderPath)) {
  //   fs.mkdirSync(uploadFolderPath, {
  //     recursive: true // để có thể nested folder
  //   })
  // }
  ;[UPLOAD_IMAGE_TEMP, UPLOAD_VIDEO_TEMP_DIR].forEach((file) => {
    if (!fs.existsSync(file)) {
      fs.mkdirSync(file, {
        recursive: true // để có thể nested folder
      })
    }
  })
}
export const handleUploadSingleImageToTemp = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP,
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 300 * 1024, // 300KB
    filter: ({ name, originalFilename, mimetype }) => {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })
  return new Promise<File>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!Boolean(files.image)) {
        return reject(new Error('file is not empty'))
      }
      resolve((files.image as File[])[0])
    })
  })
}

// handle multiple image
export const handleUploadImagesToTemp = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP,
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 300 * 1024, // 300KB
    maxTotalFileSize: 300 * 1024 * 4,
    filter: ({ name, originalFilename, mimetype }) => {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!Boolean(files.image)) {
        return reject(new Error('file is not empty'))
      }
      resolve(files.image as File[])
    })
  })
}
// handle video
export const handleUploadVideo = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    filter: ({ name, originalFilename, mimetype }) => {
      return true
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!Boolean(files.video)) {
        return reject(new Error('file is not empty'))
      }
      // const videos = files.video as File[]
      // videos.forEach(async (video) => {
      //   console.log(video)
      //   const ext = getExtension(video.originalFilename as string)
      //   const test = fs.renameSync(video.filepath, video.filepath + '.' + ext)
      //   console.log('🚀 ~ videos.forEach ~ test:', test)
      //   video.newFilename = video.newFilename + '.' + ext
      // })
      resolve(files.video as File[])
    })
  })
}
// handle video hls
export const handleUploadVideoHls = async (req: Request) => {
  const nanoId = (await import('nanoid')).nanoid
  const idNameFolder = nanoId()
  const folderPath = path.resolve(UPLOAD_VIDEO_DIR, idNameFolder)
  fs.mkdirSync(folderPath)
  const form = formidable({
    uploadDir: folderPath,
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 500 * 1024 * 1024, // 500MB
    filter: ({ name, originalFilename, mimetype }) => {
      return true
    },
    filename: function () {
      return idNameFolder
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!Boolean(files.video)) {
        return reject(new Error('file is not empty'))
      }
      // const videos = files.video as File[]
      // videos.forEach((video) => {
      //   const ext = getExtension(video.originalFilename as string)
      //   const test = fs.renameSync(video.filepath, video.filepath + '.' + ext)
      //   console.log('🚀 ~ videos.forEach ~ test:', test)
      //   const test1 = (video.newFilename = video.newFilename + '.' + ext)
      //   console.log('🚀 ~ videos.forEach ~ test1:', test1)
      //   const test2 = (video.filepath = video.filepath + '.' + ext)
      //   console.log('🚀 ~ videos.forEach ~ test1:', test2)
      // })

      resolve(files.video as File[])
    })
  })
}
// những hàm tiện ích
export const getNameFromFullname = (fullName: string) => {
  const namearr = fullName.split('.')
  namearr.pop()
  return namearr.join('')
}
export const getExtension = (fullname: string) => {
  const namearr = fullname.split('.')
  return namearr[namearr.length - 1]
}
