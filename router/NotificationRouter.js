const express = require('express')
const NotificationController = require('../controllers/NotificationController')
const authController = require('../controllers/authController')
const router = express.Router()


router.get('/',authController.protect,NotificationController.getAllNotifications)
router.delete('/delete',authController.protect,NotificationController.deleteAllNotifications)



module.exports=router

