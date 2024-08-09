const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/AppError')
const Notification = require("../models/NotificationModel");

exports.getAllNotifications = catchAsync(async (req, res, next) => {  
    const userId = req.user._id;
    const notifications = await Notification.find({ to: userId })
        .sort({
        createdAt: -1,
        })
        .populate({ path: "from", select: "username profileImg" });
    if (!notifications) {
        return next(new AppError("No notifications found",404))
    }
    if (notifications.length === 0) {
        return res.status(200).json({
        status: "success",
        data: { notifications: [] },
        message: "No notifications found",
        });
    }
    await Notification.updateMany({ to: userId }, { $set: { read: true } });
    res.status(200).json({
        status: "success",
        data: { notifications },
        message: "Notifications fetched successfully",
    });
})

exports.deleteAllNotifications = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    await Notification.deleteMany({ to: userId });
    res.status(200).json({
        status: "success",
        message: "All notifications deleted successfully",
    });
})

