const fs = require('fs');
const fsp = require('fs/promises');
const http = require('http');
const https = require('https');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const bcrypt = require('bcryptjs');
const { normalizeSubject } = require('../utils/subjectUtils');

const toSafeNote = (note) => {
  const source = typeof note.toObject === 'function' ? note.toObject() : note;
  const {
    fileUrl,
    filePublicId,
    fileResourceType,
    fileStorageType,
    password, // Exclude hashed password from output
    __v,
    ...safe
  } = source;

  return {
    ...safe,
    subject: normalizeSubject(source.subject),
    subjectKey: normalizeSubject(source.subjectKey || source.subject),
    noteId: String(source._id),
    isPasswordProtected: !!source.password,
  };
};

const canAccessNote = (note, user) => {
  const uploaderId = note.uploader?._id || note.uploader;
  const isOwner = uploaderId && uploaderId.toString() === String(user._id || user.id);
  if (isOwner) return true;

  return note.isPublic && note.branch === user.branch && note.year === user.year;
};

const verifyNotePassword = async (note, user, enteredPassword) => {
  const uploaderId = note.uploader?._id || note.uploader;
  const isOwner = uploaderId && uploaderId.toString() === String(user._id || user.id);
  if (isOwner) return true;

  if (!note.password) return true;
  if (!enteredPassword) return false;

  return await bcrypt.compare(enteredPassword, note.password);
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

const compact = (values) => [...new Set(values.filter(Boolean))];

const getStorageUrlCandidates = (note) => {
  const urls = [note.fileUrl];

  if (note.filePublicId) {
    const resourceTypes = compact([note.fileResourceType, 'raw', 'image']);
    const storageTypes = compact([note.fileStorageType, 'authenticated', 'upload']);

    resourceTypes.forEach((resourceType) => {
      storageTypes.forEach((type) => {
        urls.push(cloudinary.url(note.filePublicId, {
          secure: true,
          sign_url: type === 'authenticated',
          resource_type: resourceType,
          type,
        }));
      });
    });
  }

  return compact(urls);
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
        reject(new Error(`Storage preview failed (${storageResponse.statusCode}) for ${new URL(url).hostname}`));
        return;
      }

      storageResponse.pipe(res);
      storageResponse.on('end', resolve);
      storageResponse.on('error', reject);
    });

    request.on('error', reject);
  });

const streamPreviewFile = async (note, res) => {
  const sourceUrls = getStorageUrlCandidates(note);
  if (sourceUrls.length === 0) {
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

  const remoteUrls = sourceUrls.filter((url) => /^https?:\/\//i.test(url));
  if (remoteUrls.length > 0) {
    let lastError;
    for (const remoteUrl of remoteUrls) {
      try {
        await pipeRemoteFile(remoteUrl, res);
        return;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('Could not open remote preview');
  }

  const localSource = sourceUrls.find((url) => !/^https?:\/\//i.test(url));
  if (!localSource) {
    throw new Error('Note does not have a readable preview source');
  }

  const localPath = resolveLocalPdfPath(localSource);
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
  verifyNotePassword,
  streamPreviewFile,
  toSafeNote,
};
