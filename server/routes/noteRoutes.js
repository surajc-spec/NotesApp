const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { canAccessNote, streamPreviewFile, toSafeNote } = require('../services/notePreviewService');

// @route POST /api/notes/upload
router.post('/upload', protect, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: typeof err === 'string' ? err : (err.message || 'File upload error') });
    }
    try {
      const { title, subject, description, isPublic } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file' });
      }

      const fileUrl = req.file.path;

      const note = await Note.create({
        title,
        subject,
        description,
        branch: req.user.branch,
        year: req.user.year,
        fileUrl,
        filePublicId: req.file.filename || req.file.public_id,
        fileResourceType: req.file.resource_type || 'raw',
        fileStorageType: 'authenticated',
        uploader: req.user.id,
        isPublic: isPublic === 'true' || isPublic === true,
      });

      const populatedNote = await note.populate('uploader', 'name email year branch');
      res.status(201).json(toSafeNote(populatedNote));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
});

// @route GET /api/notes (fetch notes grouped by subject)
router.get('/', protect, async (req, res) => {
  try {
    const { subject } = req.query;
    
    let query = {
      $and: [
        { branch: req.user.branch, year: req.user.year },
        { $or: [{ isPublic: true }, { uploader: req.user.id }] }
      ]
    };

    if (subject && subject !== 'All') {
      query.$and.push({ subject: new RegExp(`^${subject.trim()}$`, 'i') });
    }

    const notes = await Note.find(query)
      .populate('uploader', 'name email year branch')
      .sort({ createdAt: -1 });

    // Grouping logic
    const groupedNotes = notes.reduce((acc, note) => {
      const sub = note.subject || 'Uncategorized';
      if (!acc[sub]) {
        acc[sub] = [];
      }
      acc[sub].push(toSafeNote(note));
      return acc;
    }, {});

    res.json(groupedNotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/notes/mine (only user’s notes)
router.get('/mine', protect, async (req, res) => {
  try {
    const notes = await Note.find({ uploader: req.user.id })
      .populate('uploader', 'name email')
      .sort({ createdAt: -1 });

    res.json(notes.map(toSafeNote));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/notes/search?q=keyword
router.get('/search', protect, async (req, res) => {
  try {
    const { q } = req.query;
    const regex = new RegExp(q, 'i');

    const notes = await Note.find({
      $and: [
        { branch: req.user.branch, year: req.user.year },
        { $or: [{ isPublic: true }, { uploader: req.user.id }] },
        { $or: [{ title: regex }, { subject: regex }, { description: regex }] }
      ]
    }).populate('uploader', 'name email year branch').sort({ createdAt: -1 });

    res.json(notes.map(toSafeNote));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/notes/preview-info/:id
router.get('/preview-info/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('uploader', 'name email year branch');
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (!canAccessNote(note, req.user)) {
      return res.status(403).json({ message: 'Not authorized to preview this note' });
    }

    res.set({
      'Cache-Control': 'no-store, private',
      Pragma: 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    res.json(toSafeNote(note));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/notes/preview/:id
router.get('/preview/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (!canAccessNote(note, req.user)) {
      return res.status(403).json({ message: 'Not authorized to preview this note' });
    }

    await streamPreviewFile(note, res);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    } else {
      res.end();
    }
  }
});

// @route DELETE /api/notes/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.uploader.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this note' });
    }

    await note.deleteOne();
    res.json({ message: 'Note removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
