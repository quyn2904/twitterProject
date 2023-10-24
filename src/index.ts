import express, { NextFunction, Request, Response } from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { log } from 'console'
import { defaultErrorHandler } from './middlewares/error.middleware'
const app = express()
app.use(express.json())
const port = 3000
databaseService.connect()
app.get('/', (req, res) => {
  res.send('Hello world')
})

app.use('/users', usersRouter)
//localhost:3000/users/tweets

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Project twitter này đang chạy trên post ${port}`)
})
