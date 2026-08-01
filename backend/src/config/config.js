require('dotenv').config()



const config ={
    PORT:process.env.PORT,
    MONGO_URI:process.env.MONGO_URI,
    JWT_SECRET:process.env.JWT_SECRET,
    R2_ACCOUNT_ID:process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID:process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY:process.env.R2_SECRET_ACCESS_KEY,
    R2_ENDPOINT:process.env.R2_ENDPOINT,
    R2_BUCKET_NAME:process.env.R2_BUCKET_NAME
}

module.exports = config;