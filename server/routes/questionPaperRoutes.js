const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const path = require('path');

const QuestionPaper = require('../models/QuestionPaper');
const { normalizeSubject } = require('../utils/subjectUtils');
const { protect, protectCached } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { streamPreviewFile } = require('../services/notePreviewService');
const { getCacheRaw, setCacheRaw, clearCache } = require('../services/cacheService');

const CACHE_DEBUG = process.env.CACHE_DEBUG === 'true';
const PERF_DEBUG = process.env.PERF_DEBUG === 'true';

const getMs = (start) => Number(process.hrtime.bigint() - start) / 1000000;

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getUserId = (user) => String(user.id || user._id);

const getTitleFromFileName = (fileName) =>
  path.basename(fileName || 'Question Paper', path.extname(fileName || ''));

const getStoredFileName = (fileName) => {
  const extension = path.extname(fileName || '.pdf') || '.pdf';
  const baseName = getTitleFromFileName(fileName)
    .replace(/[^a-z0-9-_\s]/gi, '')
    .trim()
    .replace(/\s+/g, '_') || 'question_paper';

  return `${Date.now()}_${crypto.randomUUID()}_${baseName}${extension.toLowerCase()}`;
};

const getBaseQuestionPaperQuery = (user) => ({
  branch: user.branch,
  year: user.year,
  $or: [
    { isPublic: true },
    { uploader: getUserId(user) },
  ],
});

const toSafeQuestionPaper = (questionPaper) => {
  const source = typeof questionPaper.toObject === 'function'
    ? questionPaper.toObject()
    : questionPaper;

  const {
    pdfUrl,
    previewUrl,
    filePublicId,
    fileResourceType,
    fileStorageType,
    __v,
    ...safe
  } = source;

  return {
    ...safe,
    subject: normalizeSubject(source.subject),
    subjectKey: normalizeSubject(source.subjectKey || source.subject),
    noteId: String(source._id),
    questionPaperId: String(source._id),
    isPasswordProtected: false,
  };
};

const groupQuestionPapersBySubject = (questionPapers) =>
  questionPapers.reduce((acc, questionPaper) => {
    const safeQuestionPaper = toSafeQuestionPaper(questionPaper);
    const subject = safeQuestionPaper.subject || 'OTHER';

    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(safeQuestionPaper);

    return acc;
  }, {});

const buildQuestionPaperQuery = (req) => {
  const query = {
    ...getBaseQuestionPaperQuery(req.user),
  };

  const subject = req.query.subject && req.query.subject !== 'All'
    ? normalizeSubject(req.query.subject)
    : 'All';

  if (subject !== 'All') {
    query.subjectKey = subject;
  }

  const search = String(req.query.search || '').trim();

  if (search) {
    const normalizedSearch = normalizeSubject(search);
    const text = new RegExp(escapeRegex(search), 'i');

    query.$and = [
      {
        $or: [
          { title: text },
          { description: text },
          { originalFileName: text },
          { subjectKey: normalizedSearch },
        ],
      },
    ];
  }

  return { query, subject, search };
};

const getQuestionPapersHandler = async (req, res) => {
  try {
    const routeStart = process.hrtime.bigint();
    let cacheMs = 0;
    let mongoMs = 0;
    let serializationMs = 0;

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 0, 0), 50);
    const { query, subject, search } = buildQuestionPaperQuery(req);
    const key = `noteshare:questionpapers:${req.user.id}:${subject}:${search}:${page}:${limit || 'all'}`;

    const cacheStart = process.hrtime.bigint();
    const cached = await getCacheRaw(key);
    cacheMs = getMs(cacheStart);

    if (cached) {
      if (CACHE_DEBUG) console.log('Cache HIT', key);
      if (PERF_DEBUG) {
        console.log({
          route: 'GET /api/questionpapers',
          cache: 'hit',
          authMs: req.perfAuthMs,
          cacheMs,
          mongoMs,
          serializationMs,
          responseBytes: Buffer.byteLength(cached),
          totalMs: getMs(routeStart),
        });
      }

      return res.type('application/json').send(cached);
    }

    if (CACHE_DEBUG) console.log('Cache MISS', key);

    const dbQuery = QuestionPaper
      .find(query)
      .populate('uploader', 'name email year branch')
      .sort({ createdAt: -1 });

    if (limit) {
      const mongoStart = process.hrtime.bigint();

      dbQuery.skip((page - 1) * limit).limit(limit);

      const [questionPapers, total] = await Promise.all([
        dbQuery.lean(),
        QuestionPaper.countDocuments(query),
      ]);

      mongoMs = getMs(mongoStart);

      const payload = {
        data: groupQuestionPapersBySubject(questionPapers),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      };

      const serializationStart = process.hrtime.bigint();
      const serialized = JSON.stringify(payload);
      serializationMs = getMs(serializationStart);

      await setCacheRaw(key, serialized);

      if (PERF_DEBUG) {
        console.log({
          route: 'GET /api/questionpapers',
          cache: 'miss',
          authMs: req.perfAuthMs,
          cacheMs,
          mongoMs,
          serializationMs,
          responseBytes: Buffer.byteLength(serialized),
          totalMs: getMs(routeStart),
        });
      }

      return res.type('application/json').send(serialized);
    }

    const mongoStart = process.hrtime.bigint();
    const questionPapers = await dbQuery.lean();
    mongoMs = getMs(mongoStart);

    const serializationStart = process.hrtime.bigint();
    const serialized = JSON.stringify(groupQuestionPapersBySubject(questionPapers));
    serializationMs = getMs(serializationStart);

    await setCacheRaw(key, serialized);

    if (PERF_DEBUG) {
      console.log({
        route: 'GET /api/questionpapers',
        cache: 'miss',
        authMs: req.perfAuthMs,
        cacheMs,
        mongoMs,
        serializationMs,
        responseBytes: Buffer.byteLength(serialized),
        totalMs: getMs(routeStart),
      });
    }

    return res.type('application/json').send(serialized);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

router.get('/', protectCached, getQuestionPapersHandler);

router.post('/', protect, (req, res) => {
  upload.array('pdf', 25)(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const files = req.files || [];

      if (files.length === 0) {
        return res.status(400).json({ message: 'Please upload at least one PDF' });
      }

      const subject = normalizeSubject(req.body.subject);

      if (!subject) {
        return res.status(400).json({ message: 'Subject is required' });
      }

      const providedTitle = String(req.body.title || '').trim();

      const questionPapers = files.map((file) => ({
        title: providedTitle || getTitleFromFileName(file.originalname),
        subject,
        subjectKey: subject,
        description: req.body.description,
        branch: req.user.branch,
        year: req.user.year,
        uploader: req.user.id,
        isPublic: req.body.isPublic === undefined ? true : req.body.isPublic === 'true',
        originalFileName: file.originalname,
        storedFileName: getStoredFileName(file.originalname),
        pdfUrl: file.path,
        previewUrl: file.path,
        filePublicId: file.filename || file.public_id,
        fileResourceType: file.resource_type || 'raw',
        fileStorageType: 'authenticated',
      }));

      const inserted = await QuestionPaper.insertMany(questionPapers);

      await clearCache();

      const populated = await QuestionPaper
        .find({ _id: { $in: inserted.map((questionPaper) => questionPaper._id) } })
        .populate('uploader', 'name email year branch')
        .sort({ createdAt: -1 })
        .lean();

      return res.status(201).json({
        count: populated.length,
        data: populated.map(toSafeQuestionPaper),
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });
});

router.get('/subjects', protectCached, async (req, res) => {
  try {
    const subjects = await QuestionPaper
      .distinct('subjectKey', getBaseQuestionPaperQuery(req.user));

    return res.json(subjects.sort());
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const questionPaper = await QuestionPaper
      .findById(req.params.id)
      .populate('uploader', 'name email year branch')
      .lean();

    if (!questionPaper) {
      return res.status(404).json({ message: 'Question paper not found' });
    }

    const uploaderId = questionPaper.uploader?._id || questionPaper.uploader;
    const isOwner = uploaderId && uploaderId.toString() === getUserId(req.user);
    const hasAccess = isOwner ||
      (questionPaper.isPublic && questionPaper.branch === req.user.branch && questionPaper.year === req.user.year);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.json(toSafeQuestionPaper(questionPaper));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/:id/preview', protect, async (req, res) => {
  try {
    const questionPaper = await QuestionPaper.findById(req.params.id);

    if (!questionPaper) {
      return res.status(404).json({ message: 'Question paper not found' });
    }

    const uploaderId = questionPaper.uploader?._id || questionPaper.uploader;
    const isOwner = uploaderId && uploaderId.toString() === getUserId(req.user);
    const hasAccess = isOwner ||
      (questionPaper.isPublic && questionPaper.branch === req.user.branch && questionPaper.year === req.user.year);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await streamPreviewFile({
      ...questionPaper.toObject(),
      fileUrl: questionPaper.previewUrl || questionPaper.pdfUrl,
    }, res);
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: 'Preview failed' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const questionPaper = await QuestionPaper.findById(req.params.id);

    if (!questionPaper) {
      return res.status(404).json({ message: 'Question paper not found' });
    }

    if (String(questionPaper.uploader) !== getUserId(req.user)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await questionPaper.deleteOne();
    await clearCache();

    return res.json({ message: 'Deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
module.exports.getQuestionPapersMiddleware = [
  protectCached,
  getQuestionPapersHandler,
];
