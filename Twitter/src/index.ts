import express, { Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv'
import usersRouter from './routes/users.routes'
import { initFolder } from './utils/file'
import staticRouter from './routes/static.routes'
import mediasRoutes from './routes/medias.routes'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import databaseService from './services/database.services'
import cors from 'cors'
import tweetsRouter from './routes/tweets.routes'
import bookmarksRouter from './routes/bookmarks.routes'
import likesRouter from './routes/like.routes'
import searchRouter from './routes/search.routes'
databaseService.connect().then(() => {
  databaseService.indexUser()
})
const app = express()
const port = 4000
app.use(cors())
app.use(express.json())
dotenv.config()
app.use('/users', usersRouter)
// Tạo folder upload
initFolder()
app.use('/medias', mediasRoutes)
// Cách 1
// app.use('/static', express.static(UPLOAD_IMAGE_DIR))
// Cách 2
app.use('/static', staticRouter)
// flow error handler xử lý lỗi cho cả cái app , khi cái app của chúng ta có lỗi thì sẽ chạy vào này
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarksRouter)
app.use('/likes', likesRouter)
app.use('/search', searchRouter)
app.use(defaultErrorHandler)
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// khi có nhiều hàm async thì chỉ cần try catch thằng ngoài cùng là đủ rồi

// flow tối ưu khi có lỗi ở 1 path , để cho khỏi cần dùng try,catch ở nhiều hàm => tạo hàm ở thư mục utils
