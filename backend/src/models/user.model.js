const mongoose = require('mongoose')
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    password: {
        type: String,
        required: true
    },

    branch: {
        type: String,
        required: true
    },

    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },

    year: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }

}, { timestamps: true });

const userModel = mongoose.model("User",userSchema)
module.exports = userModel;
