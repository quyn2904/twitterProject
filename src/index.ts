import express, { NextFunction, Request, Response } from 'express'
import usersRouter from './routes/users.routes'
import cors from 'cors'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middleware'
import { createServer } from 'http'
import { config } from 'dotenv'
import mediaRouter from './routes/medias.routes'
import { initFolder } from './utils/file'

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: 'Content-Type,Authorization',
  optionsSuccessStatus: 200
}
config()

initFolder()

const app = express()
const httpServer = createServer(app)
const port = process.env.PORT || 4000
app.use(cors(corsOptions))
app.use(express.json())
databaseService.connect()
app.get('/', (req, res) => {
  res.send('Hello world')
})

app.use('/users', usersRouter)
//localhost:3000/users/tweets
app.use('/medias', mediaRouter)

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Project twitter này đang chạy trên post ${port}`)
})
