const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const validator = require('validator')


const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      // required: true,
      unique: true,
    },
    fullName: {
      type: String,
      // required: true,
    },
    password: {
      type: String,
      minLength: 6,
    },
    email: {
      type: String,
      // required: true,
      unique: true,
      //validate: [validator.isEmail, 'Please provide a valid email']
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    profileImg: {
      type: String,
      default: "",
    },
    coverImg: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "",
    },
    likedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  // Hash the password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
