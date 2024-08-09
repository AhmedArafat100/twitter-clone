const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/AppError')
const Post =require('../models/postModel')
const User =require('../models/userModel')

//createPost

exports.createPost = catchAsync(async(req,res,next)=>{
    const userId = req.user._id.toString();    
    const {text}= req.body
    
    const user = await User.findById(userId)
    if(!user){
        return next(new AppError("User not found",400))
    }
    if(!text){
        return next(new AppError("text is required",400))
    }

    const newPost = await Post.create({
        text,
        user:userId
    })

    res.status(201).json({
        status:"success",
        newPost,
        messag:"Post created successfully"
    })
})


//get all posts


exports.getAllPosts = catchAsync(async(req,res,next)=>{
    const posts = await Post.find()
    .sort({createdAt:-1})
    .populate('user','-password')
    .populate('comments.user','-password')
    
    if(!posts){
        return next(new AppError("No posts found",404))
    }
    if(posts.length === 0){
        return res.status(200).json({
            status:"success",
            posts:[]
        })
    }
    res.status(200).json({
        status:"success",
        posts
    })
})


//get post by id


exports.getPostById = catchAsync(async(req,res,next)=>{
    const userId = req.params.id
    const user = await User.findById(userId)


    if(!user){
        return next(new AppError("Post not found",404))
    }
    const posts = await Post.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate("user", "-password")
    .populate("comments.user", "-password");

    if(posts.length === 0){
        return res.status(200).json({
            status:"success",
            posts:[]
        })
    }

    res.status(200).json({
        status:"success",
        posts
    })

})   


//getFollowedPosts

exports.getFollowedPosts = catchAsync(async(req,res,next)=>{
    const userId = req.user._id.toString()
    const user = await User.findById(userId)

    if(!user){
        return next(new AppError("User not found",404))
    }


    const posts = await Post.find({
        user: { $in: user.following },
      })
        .sort({ createdAt: -1 })
        .populate("user", "-password")
        .populate("comments.user", "-password");

        if(!posts){
            return next(new AppError("No posts found",404))
        }   

        if(posts.length === 0){
            return res.status(200).json({
                status:"success",
                posts:[]
            })
        }   

        res.status(200).json({
            status:"success",
            posts
        })  

})


//updatePost

exports.updatePost = catchAsync(async(req,res,next)=>{  
    //const userId = req.user._id.toString()
    const postId = req.params.id
    const {text} = req.body

    const post = await Post.findById(postId)
    if(!post){
        return next(new AppError("Post not found",404))
    }
    
    
    if (post.user.toString() !== req.user._id.toString()) {
      const error = new Error("Unauthorized to update post");
      error.status = FAIL;
      error.code = 401;
      return next(error);
    }

    post.text = text;
    await post.save();

    res.status(200).json({
        status: SUCCESS,
        data: { post },
        message: "Post updated successfully",
      });
})


//deletePost

exports.deletePost = catchAsync(async(req,res,next)=>{
    const postId = req.params.id

    const post = await Post.findById(postId)
    if(!post){
        return next(new AppError("Post not found",404))
    }

    if (post.user.toString() !== req.user._id.toString()) {
        const error = new Error("Unauthorized to delete post");
        error.status = FAIL;
        error.code = 401;
        return next(error);
      }
      await Post.findByIdAndDelete(postId);
      res.status(200).json({
        status: SUCCESS,
        data: { post },
        message: "Post deleted successfully",
      });

})



//likePost
exports.likePost = catchAsync(async(req,res,next)=>{
    const postId = req.params.id

    let post = await Post.findById(postId);

    if(!post){
        return next(new AppError("Post not found",404))
    }
    const isLiked = post.likes.includes(req.user._id.toString());
    const updateAction = isLiked
      ? { $pull: { likes: req.user._id } }
      : { $push: { likes: req.user._id } };
    post = await Post.findByIdAndUpdate(postId, updateAction, { new: true });

    const userAction = isLiked
      ? { $pull: { likedPosts: postId } }
      : { $push: { likedPosts: postId } };
    await User.updateOne({ _id: req.user._id }, userAction);

    if (!isLiked) {
      const newNotification = new Notification({
        type: "like",
        from: req.user._id,
        to: post.user,
      });
      await newNotification.save();
    }
    const message = isLiked ? "Unlike successfully" : "Like successfully";
    res.status(200).json({
      status: SUCCESS,
      data: { post },
      message,
    });   
})



//commentpost

exports.commentPost = catchAsync(async(req,res,next)=>{ 
    const postId = req.params.id
    const {text} = req.body

    const post = await Post.findById(postId).populate(
        "comments.user",
        "-password"
      );
        if (!post) {
            return next(new AppError("Post doesn't exist", 404));
        
        }

        if (!text) {
            return next(new AppError("Comment can't be empty", 400));
        }

        post.comments.push({
            user: req.user._id,
            text,
          });
          await post.save();
          res.status(201).json({
            status: SUCCESS,
            data: { post },
            message: "Comment added successfully",
          });


    })
    

//getlikedPosts

exports.getLikedPosts = catchAsync(async(req,res,next)=>{
    const userId = req.params
    const user = await User.findById(userId)

    if(!user){
        return next(new AppError("User not found",404))
    }

    const likedPosts = await Post.find({
        _id: { $in: user.likedPosts },
      })
        .populate("user", "-password")
        .populate("comments.user", "-password");
    if(!likedPosts){
        return next(new AppError("No liked posts found",404))
    }
    if(likedPosts.length === 0){
        return res.status(200).json({
            status:"success",
            likedPosts:[]
        })
    }
    res.status(200).json({
        status:"success",
        likedPosts,
        message: "Liked posts fetched successfully",
    })

})
