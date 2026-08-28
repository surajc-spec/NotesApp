const crypto = require("crypto");
const { getUploadUrl, getPdfUrl, deleteFile, getFileStream } = require("../services/r2.service");
const notesModel = require('../models/notes.model');
const cacheService = require('../services/cacheService');

async function createUploadUrl(req, res) {
  try {
    const { fileName, fileType, fileSize } = req.body;
    if (!fileName || !fileType || !fileSize) {
      return res.status(400).json({
        message: "File name, file type and file size are required",
      });
    }

    if (fileType !== "application/pdf") {
      return res.status(400).json({
        message: "Only PDF files are allowed",
      });
    }
    const MAX_FILE_SIZE = 15 * 1024 * 1024;

    if (fileSize > MAX_FILE_SIZE) {
      return res.status(400).json({
        message: "PDF size cannot exceed 15 MB",
      });
    }

    const safeFileName = fileName.replace(/[\/\\]/g, "_");
    const key = `notes/${crypto.randomUUID()}-${safeFileName}`;

    const uploadUrl = await getUploadUrl(key);

    return res.status(200).json({
      uploadUrl,
      key,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to generate upload URL",
    });
  }
}

async function createNote(req, res) {
  try {
    const { title, subject, subjectCode, description, branch, year, semester, pdfKey, examType } = req.body;
    const notes = await notesModel.create({
      title,
      subject,
      subjectCode,
      description,
      branch,
      year,
      semester,
      pdfKey,
      examType,
    });

    // Flush cache on new note creation
    await cacheService.flush();

    return res.status(201).json({
      message: "Note created successfully",
      notes,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create note",
    });
  }
}

async function viewNotes(req, res) {
  try {
    const { branch, year, semester, subjectCode, examType, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (branch && branch !== 'all') {
      filter.branch = new RegExp(`^${branch.trim()}$`, 'i');
    }
    if (semester && semester !== 'all') {
      filter.semester = Number(semester);
    }
    if (year && year !== 'all' && (!semester || semester === 'all')) {
      filter.year = new RegExp(year.trim(), 'i');
    }
    if (subjectCode) {
      filter.subjectCode = new RegExp(subjectCode.trim(), 'i');
    }
    if (examType && examType !== 'all') {
      const cleanExam = examType.trim().toLowerCase().replace(/[-_ ]/g, '');
      if (cleanExam === 'insem') {
        filter.examType = { $regex: /^in[-_\s]?sem$/i };
      } else if (cleanExam === 'endsem') {
        filter.examType = { $regex: /^end[-_\s]?sem$/i };
      } else {
        filter.examType = new RegExp(`^${examType.trim()}$`, 'i');
      }
    }

    const currentPage = Math.max(Number(page), 1);
    const currentLimit = Math.min(Math.max(Number(limit), 1), 200);

    const skip = (currentPage - 1) * currentLimit;
    const total = await notesModel.countDocuments(filter);
    const notes = await notesModel
      .find(filter)
      .select("title subject subjectCode description branch year semester examType")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(currentLimit)
      .lean();

    return res.status(200).json({
      message: "Notes fetched successfully",
      notes,
      pagination: {
        page: Number(page),
        limit: Number(currentLimit),
        total,
        totalPages: Math.ceil(total / currentLimit),
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to fetch notes",
    });
  }
}

async function viewPdf(req, res) {
  try {
    const { id } = req.params;
    const note = await notesModel.findById(id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    // Direct binary stream mode (bypasses cross-origin S3/R2 CORS issues on mobile apps)
    if (req.query.stream === 'true') {
      const s3Response = await getFileStream(note.pdfKey);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');
      if (s3Response.ContentLength) {
        res.setHeader('Content-Length', s3Response.ContentLength);
      }
      return s3Response.Body.pipe(res);
    }

    const pdfUrl = await getPdfUrl(note.pdfKey);

    return res.status(200).json({
      pdfUrl,
      note,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to generate PDF URL",
    });
  }
}

async function updateNote(req, res) {
  try {
    const { id } = req.params;
    const { title, subject, subjectCode, description, branch, year, semester, examType } = req.body;

    const note = await notesModel.findById(id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (title) note.title = title;
    if (subject) note.subject = subject;
    if (subjectCode) note.subjectCode = subjectCode;
    if (description !== undefined) note.description = description;
    if (branch) note.branch = branch;
    if (year) note.year = year;
    if (semester) note.semester = semester;
    if (examType) note.examType = examType;

    await note.save();
    await cacheService.flush();

    return res.status(200).json({
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    console.error("Update Note Error:", error);
    return res.status(500).json({ message: "Failed to update note" });
  }
}

async function deleteNotes(req, res) {
  try {
    const { id } = req.params;
    const note = await notesModel.findById(id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    await deleteFile(note.pdfKey);
    await notesModel.findByIdAndDelete(id);

    // Flush cache on note deletion
    await cacheService.flush();

    return res.status(200).json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to delete note",
    });
  }
}

async function bulkDeleteNotes(req, res) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid or empty IDs array" });
    }

    const notes = await notesModel.find({ _id: { $in: ids } });
    for (const note of notes) {
      if (note.pdfKey) {
        try {
          await deleteFile(note.pdfKey);
        } catch (err) {
          console.warn(`Failed to delete R2 file for note ${note._id}:`, err);
        }
      }
    }

    await notesModel.deleteMany({ _id: { $in: ids } });
    await cacheService.flush();

    return res.status(200).json({
      message: `${notes.length} note(s) deleted successfully`,
      deletedCount: notes.length,
    });
  } catch (error) {
    console.error("Bulk Delete Notes Error:", error);
    return res.status(500).json({ message: "Failed to bulk delete notes" });
  }
}

module.exports = { createUploadUrl, createNote, viewNotes, viewPdf, updateNote, deleteNotes, bulkDeleteNotes };