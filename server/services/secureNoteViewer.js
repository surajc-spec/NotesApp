const crypto = require('crypto');
const fs = require('fs');
const fsp = require('fs/promises');
const http = require('http');
const https = require('https');
const path = require('path');
const jwt = require('jsonwebtoken');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');

const CACHE_ROOT = path.join(__dirname, '..', '.secure-cache');
const ORIGINAL_CACHE_DIR = path.join(CACHE_ROOT, 'originals');
const PAGE_CACHE_DIR = path.join(CACHE_ROOT, 'pages');
const TOKEN_TTL = '5m';
const IMAGE_SCALE = Number(process.env.SECURE_VIEW_IMAGE_SCALE || 1400);

const ensureDir = (dir) => fsp.mkdir(dir, { recursive: true });

const hash = (value) => crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const escapeXml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const isCloudinaryPdf = (fileUrl = '') => /^https?:\/\/res\.cloudinary\.com\//i.test(fileUrl);

const getPdfPoppler = () => {
  if (!['win32', 'darwin'].includes(process.platform)) {
    throw new Error('Local PDF conversion is not available on this server platform');
  }

  return require('pdf-poppler');
};

const buildCloudinaryPageImageUrl = (fileUrl, page) => {
  if (!isCloudinaryPdf(fileUrl)) {
    return null;
  }

  const normalizedUrl = fileUrl.replace('/raw/upload/', '/image/upload/');
  const transformedUrl = normalizedUrl.replace(
    '/image/upload/',
    `/image/upload/f_png,pg_${page},w_${IMAGE_SCALE},c_limit/`
  );

  return transformedUrl.replace(/\.pdf($|\?)/i, '.png$1');
};

const toSafeNote = (note) => {
  const source = typeof note.toObject === 'function' ? note.toObject() : note;
  const { fileUrl, __v, ...safe } = source;
  return {
    ...safe,
    noteId: String(source._id),
  };
};

const createViewToken = (note, user) =>
  jwt.sign(
    {
      purpose: 'secure-note-view',
      noteId: String(note._id),
      userId: String(user._id || user.id),
      branch: user.branch,
      year: user.year,
    },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  );

const verifyViewToken = (token, noteId, user) => {
  if (!token) {
    throw new Error('Missing secure view token');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (
    decoded.purpose !== 'secure-note-view' ||
    decoded.noteId !== String(noteId) ||
    decoded.userId !== String(user._id || user.id)
  ) {
    throw new Error('Invalid secure view token');
  }

  return decoded;
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

const downloadRemotePdf = (url, destination, redirectCount = 0) =>
  new Promise((resolve, reject) => {
    if (redirectCount > 4) {
      reject(new Error('Too many redirects while fetching PDF'));
      return;
    }

    const client = url.startsWith('https:') ? https : http;
    const request = client.get(url, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
        response.resume();
        downloadRemotePdf(response.headers.location, destination, redirectCount + 1).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode < 200 || response.statusCode >= 300) {
        response.resume();
        reject(new Error(`Unable to fetch PDF source (${response.statusCode})`));
        return;
      }

      const file = fs.createWriteStream(destination);
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    });

    request.on('error', reject);
  });

const downloadRemoteFile = (url, destination) => downloadRemotePdf(url, destination);

const getSourcePdfPath = async (note) => {
  if (!note.fileUrl) {
    throw new Error('Note does not have an attached file');
  }

  if (!/^https?:\/\//i.test(note.fileUrl)) {
    return resolveLocalPdfPath(note.fileUrl);
  }

  await ensureDir(ORIGINAL_CACHE_DIR);
  const cachedPdf = path.join(ORIGINAL_CACHE_DIR, `${note._id}-${hash(note.fileUrl)}.pdf`);
  try {
    await fsp.access(cachedPdf, fs.constants.R_OK);
    return cachedPdf;
  } catch (_) {
    await downloadRemotePdf(note.fileUrl, cachedPdf);
    return cachedPdf;
  }
};

const getPdfPageCount = async (pdfPath) => {
  const buffer = await fsp.readFile(pdfPath);
  const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
  return pdf.getPageCount();
};

const findConvertedPage = async (directory, prefix, page) => {
  const files = await fsp.readdir(directory);
  const pattern = new RegExp(`^${escapeRegExp(prefix)}(-0*${page})?\\.png$`, 'i');
  const match = files.find((file) => pattern.test(file));
  if (!match) {
    throw new Error('PDF page conversion did not produce an image');
  }

  return path.join(directory, match);
};

const getConvertedPagePath = async (note, sourcePdfPath, page) => {
  const notePageDir = path.join(PAGE_CACHE_DIR, String(note._id));
  await ensureDir(notePageDir);

  const cachedPage = path.join(notePageDir, `page-${page}-${IMAGE_SCALE}.png`);
  try {
    await fsp.access(cachedPage, fs.constants.R_OK);
    return cachedPage;
  } catch (_) {
    const cloudinaryPageUrl = buildCloudinaryPageImageUrl(note.fileUrl, page);
    if (cloudinaryPageUrl) {
      await downloadRemoteFile(cloudinaryPageUrl, cachedPage);
      return cachedPage;
    }

    const pdfPoppler = getPdfPoppler();
    const prefix = `render-${page}-${IMAGE_SCALE}-${Date.now()}`;
    await pdfPoppler.convert(sourcePdfPath, {
      format: 'png',
      out_dir: notePageDir,
      out_prefix: prefix,
      page,
      scale: IMAGE_SCALE,
    });

    const convertedPath = await findConvertedPage(notePageDir, prefix, page);
    await fsp.rename(convertedPath, cachedPage);
    return cachedPage;
  }
};

const createWatermarkSvg = (width, height, user) => {
  const stamp = new Date().toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  const text = escapeXml(`Viewed by ${user.name || 'User'} | ${user.email || ''} | ${stamp}`);
  const fontSize = Math.max(18, Math.round(width / 38));
  const footerSize = Math.max(16, Math.round(width / 46));

  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="wm" width="${width / 1.25}" height="${height / 4}" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
          <text x="24" y="${height / 8}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="rgba(20,20,20,0.12)">${text}</text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wm)" />
      <rect x="0" y="${height - footerSize * 2.8}" width="100%" height="${footerSize * 2.8}" fill="rgba(255,255,255,0.72)" />
      <text x="24" y="${height - footerSize}" font-family="Arial, sans-serif" font-size="${footerSize}" font-weight="700" fill="rgba(20,20,20,0.62)">${text}</text>
    </svg>
  `);
};

const renderWatermarkedPage = async (pagePath, user) => {
  const image = sharp(pagePath);
  const metadata = await image.metadata();
  const watermark = createWatermarkSvg(metadata.width, metadata.height, user);

  return image
    .composite([{ input: watermark, left: 0, top: 0 }])
    .png({ compressionLevel: 8, adaptiveFiltering: true })
    .toBuffer();
};

module.exports = {
  TOKEN_TTL,
  canAccessNote,
  createViewToken,
  getConvertedPagePath,
  getPdfPageCount,
  getSourcePdfPath,
  renderWatermarkedPage,
  toSafeNote,
  verifyViewToken,
};
