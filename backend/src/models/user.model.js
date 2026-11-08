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
        default: null,
    },

    semester: {
        type: Number,
        min: 1,
        max: 8,
        default: null,
    },

    year: {
        type: String,
        default: null,
    },

    examType: {
        type: String,
        enum: ["insem", "endsem", "all"],
        default: "insem"
    },

    isProfileComplete: {
        type: Boolean,
        default: false,
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }

}, { timestamps: true });

const userModel = mongoose.model("User",userSchema)
module.exports = userModel;
