const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/AppError')
const User =require('../models/userModel')
const Notification =require('../models/NotificationModel')


//getUserProfile
exports.getUserProfile = catchAsync(async(req,res,next)=>{
    const {userId}= req.params.id

    const checkUser = await User.findById(userId)

    if(checkUser){
        return next(new AppError("User Not found",400))
    }

    res.status(200).json({
        status:"success",
        checkUser
    })
})


//followUser
exports.followUser = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const currentUserId = req.user._id.toString();
  
	if (id === currentUserId) {
	  return next(new AppError("You can't follow yourself", 400));
	}
  
	try {
	  const modifyUser = await User.findById(id);
	  const currentUser = await User.findById(currentUserId);
  
	  if (!modifyUser || !currentUser) {
		return next(new AppError('User not found', 400));
	  }
  
	  const isFollowing = currentUser.following.includes(id);
  
	  if (isFollowing) {
		await User.findByIdAndUpdate(id, {
		  $pull: { followers: req.user._id },
		}, { new: true, runValidators: false });
		await User.findByIdAndUpdate(currentUserId, {
		  $pull: { following: id },
		}, { new: true, runValidators: false });
		return res.status(200).json({
		  status: "success",
		  data: { userId: modifyUser._id },
		  message: "Unfollowed successfully",
		});
	  } else {
		await User.findByIdAndUpdate(id, {
		  $push: { followers: req.user._id },
		}, { new: true, runValidators: false });
		await User.findByIdAndUpdate(currentUserId, {
		  $push: { following: id },
		}, { new: true, runValidators: false });
  
		const newNotification = {
			type: "follow",
			from: req.user._id,
			to: modifyUser._id,
		};

	await Notification.create(newNotification);


  
		return res.status(200).json({
		  status: "success",
		  data: { userId: modifyUser._id },
		  message: "Followed successfully",
		});
	  }
	} catch (error) {
	  console.error("Error in followUser:", error);
	  return next(new AppError("An error occurred while processing your request", 500));
	}
  });
  
//getSuggestedUsers
exports.getSuggestedUsers= catchAsync(async(req,res,next)=>{
	const currentUserId = req.user._id;
	const usersFollowedByMe = await User.findById(currentUserId).select(
		"following"
	  );
	  const users = await User.aggregate([
		{
		  $match: {
			_id: { $ne: currentUserId },
		  },
		},
		{
		  $sample: { size: 10 },
		},
	  ]);
	  const filteredUsers = users.filter(
		(user) => !usersFollowedByMe.following.includes(user._id)
	  );
	  const suggestedUsers = filteredUsers.slice(0, 4);
	  suggestedUsers.forEach((user) => (user.password = null));
	  res.status(200).json({
		status: SUCCESS,
		data: { users: suggestedUsers },
		message: "Suggested users fetched successfully",
})
})


// write function to update user
exports.updateUser = catchAsync(async(req,res,next)=>{
	const { fullName, email, username, currentPassword, newPassword, bio, link } =
    req.body;
//   let profileImg, coverImg;

	const checkUser = await User.findById(req.user._id);
	

	if(!checkUser){
		return next(new AppError("User Not found",400))
	}
	if (
		(currentPassword && !newPassword) ||
		(!currentPassword && newPassword)
	  ){
		return next(new AppError("Please provide both current and new password", 400));
	  }
		const isPasswordCorrect = await checkUser.comparePassword(currentPassword,checkUser.password);
	
	  if (!isPasswordCorrect) {
		return next(new AppError("Incorrect password", 400));
	  }

	  checkUser.fullName = fullName || checkUser.fullName;
	  checkUser.email = email || checkUser.email;
	  checkUser.username = username || checkUser.username;
	//   checkUser.profileImg = profileImg || checkUser.profileImg;
	//   checkUser.coverImg = coverImg || checkUser.coverImg;
	  checkUser.bio = bio || checkUser.bio;
	  checkUser.link = link || checkUser.link;
	  await checkUser.save();
	  checkUser.password = undefined;
	  res.status(200).json({
		status: "SUCCESS",
		data: { checkUser },
		message: "User updated successfully",
	  });


})