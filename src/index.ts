import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
const app = express()
app.use(express.json())
const port = 3000
databaseService.connect()
app.get('/', (req, res) => {
  res.send('Hello world')
})

app.use('/users', usersRouter)
//localhost:3000/users/tweets

app.listen(port, () => {
  console.log(`Project twitter này đang chạy trên post ${port}`)
})
