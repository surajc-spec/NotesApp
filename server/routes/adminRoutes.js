const express = require('express');
const jwt = require('jsonwebtoken');
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs/promises');
const cloudinary = require('cloudinary').v2;

const Note = require('../models/Note');
const QuestionPaper = require('../models/QuestionPaper');
const User = require('../models/User');
const ContactMessage = require('../models/ContactMessage');
const RateLimitEvent = require('../models/RateLimitEvent');
const { getAdminSecret, protectAdmin } = require('../middleware/adminMiddleware');
const { normalizeSubject } = require('../utils/subjectUtils');
const { clearCache } = require('../services/cacheService');

const router = express.Router();
const activeNotes = { isDeleted: { $ne: true } };

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const normalizeEmail = (email) =>
  String(email || '')
    .trim()
    .toLowerCase();

const compact = (values) => [...new Set(values.filter(Boolean))];

const safeFileName = (value, fallback) =>
  String(value || fallback)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120) || fallback;

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

const fetchRemoteBuffer = (url, redirectCount = 0) =>
  new Promise((resolve, reject) => {
    if (redirectCount > 4) {
      reject(new Error('Too many redirects'));
      return;
    }

    const client = url.startsWith('https:') ? https : http;
    client.get(url, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
        response.resume();
        fetchRemoteBuffer(response.headers.location, redirectCount + 1).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode < 200 || response.statusCode >= 300) {
        response.resume();
        reject(new Error(`Download failed with status ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });

const getNoteFileBuffer = async (note) => {
  const urls = getStorageUrlCandidates(note);
  let lastError;

  for (const url of urls) {
    try {
      if (/^https?:\/\//i.test(url)) {
        return await fetchRemoteBuffer(url);
      }

      const relativePath = url.replace(/^[/\\]+/, '');
      const localPath = path.resolve(__dirname, '..', relativePath);
      return await fs.readFile(localPath);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('No file available');
};

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let c = index;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

const crc32 = (buffer) => {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const dosDateTime = (date) => {
  const year = Math.max(date.getFullYear(), 1980);
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
};

const createZip = (entries) => {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  entries.forEach((entry) => {
    const name = Buffer.from(entry.name);
    const data = entry.data;
    const crc = crc32(data);
    const stamp = dosDateTime(entry.date || new Date());

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(stamp.time, 10);
    localHeader.writeUInt16LE(stamp.date, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, name, data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(stamp.time, 12);
    centralHeader.writeUInt16LE(stamp.date, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(data.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralParts.push(centralHeader, name);
    offset += localHeader.length + name.length + data.length;
  });

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, ...centralParts, end]);
};

router.post('/login', async (req, res) => {
  const email = normalizeEmail(req.body.email).replace(/^["']|["']$/g, '');
  const password = String(req.body.password || '').trim().replace(/^["']|["']$/g, '');
  
  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL).replace(/^["']|["']$/g, '');
  const adminPassword = String(process.env.ADMIN_PASSWORD || '').trim().replace(/^["']|["']$/g, '');

  if (!adminEmail || !adminPassword || email !== adminEmail || password !== adminPassword) {
    return res.status(403).json({ message: 'Invalid admin credentials' });
  }

  const token = jwt.sign(
    {
      admin: true,
      email: adminEmail,
    },
    getAdminSecret(),
    {
      expiresIn: '8h',
    }
  );

  return res.json({
    email: adminEmail,
    token,
  });
});

router.get('/users', protectAdmin, async (req, res) => {
  const users = await User
    .find({})
    .select('name email branch year createdAt')
    .sort({ createdAt: -1 })
    .lean();

  res.json(users);
});

router.get('/notes', protectAdmin, async (req, res) => {
  const notes = await Note
    .find(activeNotes)
    .populate('uploader', 'name email branch year')
    .sort({ createdAt: -1 })
    .lean();

  res.json(notes.map((note) => ({
    _id: note._id,
    title: note.title,
    subject: normalizeSubject(note.subject),
    createdAt: note.createdAt,
    uploader: note.uploader,
  })));
});

router.get('/stats', protectAdmin, async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalNotes,
    subjects,
    uploadsToday,
    newestUser,
    newestUpload
  ] = await Promise.all([
    User.countDocuments(),
    Note.countDocuments(activeNotes),
    Note.distinct('subjectKey', activeNotes),
    Note.countDocuments({ ...activeNotes, createdAt: { $gte: today } }),
    User.findOne({}).select('name email createdAt').sort({ createdAt: -1 }).lean(),
    Note.findOne(activeNotes).select('title subject createdAt').sort({ createdAt: -1 }).lean(),
  ]);

  res.json({
    totalUsers,
    totalNotes,
    totalSubjects: subjects.filter(Boolean).length,
    uploadsToday,
    newestUser,
    newestUpload: newestUpload ? {
      ...newestUpload,
      subject: normalizeSubject(newestUpload.subject),
    } : null,
  });
});

router.get('/messages', protectAdmin, async (req, res) => {
  const messages = await ContactMessage.find({}).sort({ createdAt: -1 }).lean();
  return res.json(messages);
});

router.patch('/messages/:id', protectAdmin, async (req, res) => {
  const status = String(req.body.status || '').trim().toLowerCase();

  if (!['new', 'read', 'reply_later', 'resolved'].includes(status)) {
    return res.status(400).json({ message: 'Invalid message status' });
  }

  const message = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).lean();

  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }

  return res.json(message);
});

router.get('/rate-limit-events', protectAdmin, async (req, res) => {
  const events = await RateLimitEvent
    .find({})
    .select('email route reason createdAt')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return res.json(events);
});

router.get('/analytics', protectAdmin, async (req, res) => {
  return res.json({
    configured: false,
    activeUsers: null,
    averageEngagementTime: null,
    returningUsers: null,
    traffic: {
      newUsers: null,
      returningUsers: null,
      views: null,
    },
    message: 'Google Analytics reporting is not configured on the server.',
  });
});

router.get('/question-paper-metrics', protectAdmin, async (req, res) => {
  const [papers, subjects, mostUploaded] = await Promise.all([
    QuestionPaper.countDocuments(),
    QuestionPaper.distinct('subjectKey'),
    QuestionPaper.aggregate([
      { $group: { _id: '$subjectKey', uploads: { $sum: 1 } } },
      { $sort: { uploads: -1, _id: 1 } },
      { $limit: 1 },
    ]),
  ]);

  return res.json({
    papers,
    subjects: subjects.filter(Boolean).length,
    mostUploadedSubject: mostUploaded[0]?._id || null,
    mostViewedSubject: null,
  });
});

router.patch('/notes/:id/soft-delete', protectAdmin, async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, ...activeNotes },
    { isDeleted: true, deletedAt: new Date(), deletedBy: req.admin.email },
    { new: true }
  ).select('_id title').lean();

  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }

  await clearCache();
  return res.json({ message: 'Note removed from public content.', note });
});

router.get('/preview/:id', protectAdmin, async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, ...activeNotes }).lean();

  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }

  const file = await getNoteFileBuffer(note);
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="${safeFileName(note.title, 'note')}.pdf"`,
    'Cache-Control': 'no-store',
  });

  return res.send(file);
});

router.get('/download/:id', protectAdmin, async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, ...activeNotes }).lean();

  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }

  const file = await getNoteFileBuffer(note);
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${safeFileName(note.title, 'note')}.pdf"`,
    'Cache-Control': 'no-store',
  });

  return res.send(file);
});

router.get('/download-all', protectAdmin, async (req, res) => {
  const notes = await Note
    .find(activeNotes)
    .select('title subject fileUrl filePublicId fileResourceType fileStorageType createdAt')
    .sort({ createdAt: -1 })
    .lean();

  const entries = [];

  for (const note of notes) {
    try {
      const data = await getNoteFileBuffer(note);
      entries.push({
        name: `${safeFileName(normalizeSubject(note.subject), 'GENERAL')}/${safeFileName(note.title, String(note._id))}.pdf`,
        data,
        date: note.createdAt,
      });
    } catch (error) {
      entries.push({
        name: `FAILED/${safeFileName(note.title, String(note._id))}.txt`,
        data: Buffer.from(`Could not download this note: ${error.message}`),
        date: new Date(),
      });
    }
  }

  const zip = createZip(entries);

  res.set({
    'Content-Type': 'application/zip',
    'Content-Disposition': 'attachment; filename="noteshare-notes.zip"',
    'Cache-Control': 'no-store',
  });

  return res.send(zip);
});

module.exports = router;
