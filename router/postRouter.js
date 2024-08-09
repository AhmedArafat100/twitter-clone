const express = require('express')
const postController = require('../controllers/postController')
const authController = require('../controllers/authController')
const router = express.Router()



router.post('/create',authController.protect,postController.createPost)
router.get('/',authController.protect,postController.getAllPosts)
router.get('/following',authController.protect,postController.getFollowedPosts)
router.get('/:userId',authController.protect,postController.getPostById)
router.delete('/:postId',authController.protect,postController.deletePost)
router.get('/likes/:userId',authController.protect,postController.getLikedPosts)
router.post('/comment/:postId',authController.protect,postController.createPost)
router.post('/like/:postId',authController.protect,postController.likePost)
router.put("/update/:id",authController.protect,postController.updatePost)




module.exports=router

