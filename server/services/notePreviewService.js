const fs = require('fs');
const fsp = require('fs/promises');
const http = require('http');
const https = require('https');
const path = require('path');
const cloudinary = require('cloudinary').v2;

const toSafeNote = (note) => {
  const source = typeof note.toObject === 'function' ? note.toObject() : note;
  const {
    fileUrl,
    filePublicId,
    fileResourceType,
    fileStorageType,
    __v,
    ...safe
  } = source;

  return {
    ...safe,
    noteId: String(source._id),
  };
};

const canAccessNote = (note, user) => {
  const uploaderId = note.uploader?._id || note.uploader;
  const isOwner = uploaderId && uploaderId.toString() === String(user._id || user.id);
  if (isOwner) return true;

  return note.isPublic && note.branch === user.branch && note.year === user.year;
};

const resolveLocalPdfPath = (fileUrl) => {
  const relativePath = fileUrl.replace(/^[/\\]+/, '');
  const resolvedPath = path.resolve(__dirname, '..', relativePath);
  const uploadsRoot = path.resolve(__dirname, '..', 'uploads');

  if (!resolvedPath.startsWith(uploadsRoot + path.sep) && resolvedPath !== uploadsRoot) {
    throw new Error('Stored file path is outside the uploads directory');
  }

  return resolvedPath;
};

const getSignedStorageUrl = (note) => {
  if (note.filePublicId) {
    return cloudinary.url(note.filePublicId, {
      secure: true,
      sign_url: true,
      resource_type: note.fileResourceType || 'raw',
      type: note.fileStorageType || 'authenticated',
    });
  }

  return note.fileUrl;
};

const pipeRemoteFile = (url, res, redirectCount = 0) =>
  new Promise((resolve, reject) => {
    if (redirectCount > 4) {
      reject(new Error('Too many redirects while opening preview'));
      return;
    }

    const client = url.startsWith('https:') ? https : http;
    const request = client.get(url, (storageResponse) => {
      if ([301, 302, 303, 307, 308].includes(storageResponse.statusCode)) {
        storageResponse.resume();
        pipeRemoteFile(storageResponse.headers.location, res, redirectCount + 1).then(resolve).catch(reject);
        return;
      }

      if (storageResponse.statusCode < 200 || storageResponse.statusCode >= 300) {
        storageResponse.resume();
        reject(new Error(`Storage preview failed (${storageResponse.statusCode})`));
        return;
      }

      storageResponse.pipe(res);
      storageResponse.on('end', resolve);
      storageResponse.on('error', reject);
    });

    request.on('error', reject);
  });

const streamPreviewFile = async (note, res) => {
  const sourceUrl = getSignedStorageUrl(note);
  if (!sourceUrl) {
    throw new Error('Note does not have an attached file');
  }

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'inline; filename="preview.pdf"',
    'Cache-Control': 'no-store, private',
    Pragma: 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': 'noindex, noarchive, nosnippet',
  });

  if (/^https?:\/\//i.test(sourceUrl)) {
    await pipeRemoteFile(sourceUrl, res);
    return;
  }

  const localPath = resolveLocalPdfPath(sourceUrl);
  await fsp.access(localPath, fs.constants.R_OK);
  await new Promise((resolve, reject) => {
    const stream = fs.createReadStream(localPath);
    stream.pipe(res);
    stream.on('end', resolve);
    stream.on('error', reject);
  });
};

module.exports = {
  canAccessNote,
  streamPreviewFile,
  toSafeNote,
};
