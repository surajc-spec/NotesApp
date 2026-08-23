const { GetObjectCommand,PutObjectCommand ,DeleteObjectCommand} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const r2Client = require("../config/r2.config");
const config = require("../config/config");

async function getPdfUrl(key) {
 

  const command = new GetObjectCommand({
    Bucket: config.R2_BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(r2Client, command, {
    expiresIn: 3600,
  });

  

  return url;
}

async function getUploadUrl(key) {

  const command = new PutObjectCommand({
    Bucket: config.R2_BUCKET_NAME,
    Key: key,
    ContentType: "application/pdf",
  });

  return await getSignedUrl(r2Client, command, {
    expiresIn: 300,
  });
}

async function deleteFile(key) {
  const command = new DeleteObjectCommand({
    Bucket: config.R2_BUCKET_NAME,
    Key: key,
  });

  return await r2Client.send(command);
}

async function getFileStream(key) {
  const command = new GetObjectCommand({
    Bucket: config.R2_BUCKET_NAME,
    Key: key,
  });

  return await r2Client.send(command);
}

module.exports = { getPdfUrl, getUploadUrl, deleteFile, getFileStream };