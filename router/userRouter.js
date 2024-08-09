const express = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')
const router = express.Router()



router.post('/follow/:id',authController.protect,userController.followUser)
router.get('/suggested',authController.protect,userController.getSuggestedUsers)
router.get('/profile/:id',authController.protect,userController.getUserProfile)
router.put('/update',authController.protect,userController.updateUser)



module.exports=router

