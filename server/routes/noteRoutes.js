const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

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
        uploader: req.user.id,
        isPublic: isPublic === 'true' || isPublic === true,
      });

      res.status(201).json(note);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
});

// @route GET /api/notes (fetch notes from same year + branch + optional subject)
router.get('/', protect, async (req, res) => {
  try {
    const { subject } = req.query;
    
    let query = {
      $and: [
        // Privacy: Same branch and Same year
        { branch: req.user.branch, year: req.user.year },
        // Visibility: Either it's public OR it belongs to the logged-in user
        { $or: [{ isPublic: true }, { uploader: req.user.id }] }
      ]
    };

    if (subject && subject !== 'All') {
      query.$and.push({ subject: new RegExp(`^${subject.trim()}$`, 'i') });
    }

    const notes = await Note.find(query)
      .populate('uploader', 'name email year branch')
      .sort({ createdAt: -1 });

    res.json(notes);
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

    res.json(notes);
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

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

// @route POST /api/notes/:id/download (increment download count)
router.post('/:id/download', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Check access
    if (note.branch !== req.user.branch || note.year !== req.user.year) {
        if (note.uploader.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to access notes outside your branch/year' });
        }
    }

    note.downloads += 1;
    await note.save();

    res.json({ message: 'Download count updated', downloads: note.downloads });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
