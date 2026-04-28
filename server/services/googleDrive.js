const { google } = require('googleapis');
const fs = require('fs');

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Use environment variables for authentication
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // handle newlines correctly
  },
  scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

const uploadFileToDrive = async (filePath, mimeType, originalName) => {
  try {
    const fileMetadata = {
      name: originalName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Folder ID from .env
    };

    const media = {
      mimeType: mimeType,
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
    });

    // Make the file public so anyone with the link can view/download
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // We get a fresh instance to fetch the updated links after changing permissions
    const updatedFile = await drive.files.get({
      fileId: response.data.id,
      fields: 'webViewLink, webContentLink',
    });

    return updatedFile.data;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
};

module.exports = { uploadFileToDrive };
