const User =require('../models/userModel')
const jwt = require('jsonwebtoken')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/AppError')
const { promisify } = require('util')


const createSendToken=(user,statusCode,res)=>{
    const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    })
    res.cookie('jwt',token,{
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
          ),
          httpOnly: true
    })

    user.password=undefined

    res.status(statusCode).json({
        status:"success",
        token,
        data:{
            user
        }
    })

}




exports.signup = catchAsync(async(req,res)=>{

    const newUser = await User.create(req.body)

    createSendToken(newUser,200,res)

})



exports.login=catchAsync(async(req,res,next)=>{
    const {email,password}= req.body

    if(!email || !password){
        return next(new AppError("please fill the form"),400)
    }

    const existingUser = await User.findOne({email}).select("+password")

    if(!existingUser || !(await existingUser.comparePassword(password,existingUser.password))){
        return next(new AppError('Incorrect email or password',401))
    }

    createSendToken(existingUser,200,res)
}) 


exports.logout = (req, res) => {
    res.clearCookie("jwt")
    res.status(200).json({ status: 'success' });
  };


exports.protect=catchAsync(async(req,res,next)=>{
    let token
    if(req.headers.authorization ||  req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }else if(req.cookies.jwt){
        token = req.cookies.jwt
    } 


    if(!token){
        return next(new AppError("you Are Not Authorized!!!",400))
    }

    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET)

    const user = await User.findById(decoded.id)
    
    if(!user){
        return next(new AppError('the user that does no longer exist',401))
      }

      req.user= user
      next()

})
  
