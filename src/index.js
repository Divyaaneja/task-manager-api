const express = require('express')
const app = express()
require('./db/mongoose')
const dotenv = require('dotenv')

const Userrouters = require('./routers/user')
const Taskrouters = require('./routers/task')

dotenv.config()

const port = process.env.PORT
app.use(express.json())


app.use(Userrouters)
app.use(Taskrouters)



app.listen(port, ()=>{
    console.log('server is running on:'+port)
})
