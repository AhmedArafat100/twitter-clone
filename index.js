const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const AppError = require('./utils/AppError')
const authRouter = require('./router/authRouter')
const userRouter = require('./router/userRouter')
const postRouter = require('./router/postRouter')
const notificationRouter = require('./router/NotificationRouter')
const bodyParser = require("body-parser")

require('dotenv').config()
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.use('/api/v1/auth',authRouter)
app.use('/api/v1/user',userRouter)
app.use('/api/v1/post',postRouter)
app.use('/api/v1/notification',notificationRouter)


app.all('*',(req,res,next)=>{


    next(new AppError(`Can Not find ${req.originalUrl} on this server!!`,404))
})






mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log("DATABASE CONNECTED SUCCESSFULLY!!");
})



const port = process.env.PORT || 3000
app.listen(port,()=>{
    console.log(`SERVER IS RUNNING ON ${port}`);
})