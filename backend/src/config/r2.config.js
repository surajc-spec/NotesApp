const {S3Client} = require("@aws-sdk/client-s3");
const config = require('../config/config')

const r2Client  = new S3Client({
  region: "auto",
  endpoint:config.R2_ENDPOINT,
  
  credentials: {
    accessKeyId:config.R2_ACCESS_KEY_ID ,
    secretAccessKey: config.R2_SECRET_ACCESS_KEY,
  },
});

module.exports = r2Client;