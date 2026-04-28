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

      const fileUrl = `/uploads/${req.file.filename}`;

      const note = await Note.create({
        title,
        subject,
        description,
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

// @route GET /api/notes (fetch public notes from same year + user's own private notes)
router.get('/', protect, async (req, res) => {
  try {
    // Find all users in the same year (case-insensitive and trimmed)
    const User = require('../models/User');
    const yearRegex = new RegExp(`^${req.user.year.trim()}$`, 'i');
    const usersInSameYear = await User.find({ year: yearRegex }).select('_id');
    const userIds = usersInSameYear.map(u => u._id);

    const notes = await Note.find({
      $or: [
        { isPublic: true, uploader: { $in: userIds } },
        { uploader: req.user.id }
      ]
    }).populate('uploader', 'name email year').sort({ createdAt: -1 });

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
    const regex = new RegExp(q, 'i'); // case-insensitive

    const User = require('../models/User');
    const yearRegex = new RegExp(`^${req.user.year.trim()}$`, 'i');
    const usersInSameYear = await User.find({ year: yearRegex }).select('_id');
    const userIds = usersInSameYear.map(u => u._id);

    const notes = await Note.find({
      $and: [
        { $or: [{ title: regex }, { subject: regex }] },
        { $or: [{ isPublic: true, uploader: { $in: userIds } }, { uploader: req.user.id }] }
      ]
    }).populate('uploader', 'name email year').sort({ createdAt: -1 });

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

    // Ensure users can only delete their own notes
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
    
    if (!note.isPublic && note.uploader.toString() !== req.user.id) {
       return res.status(401).json({ message: 'Not authorized to access this note' });
    }

    note.downloads += 1;
    await note.save();

    res.json({ message: 'Download count updated', downloads: note.downloads });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
