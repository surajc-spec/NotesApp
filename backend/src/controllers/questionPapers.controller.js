const crypto = require("crypto");
const { getUploadUrl, getPdfUrl, deleteFile } = require("../services/r2.service");
const questionPapersModel = require("../models/questionPapers.model");
const cacheService = require("../services/cacheService");

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
    const key = `question-papers/${crypto.randomUUID()}-${safeFileName}`;

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

async function createQuestionPaper(req, res) {
  try {
    const { title, subject, subjectCode, description, branch, year, semester, pdfKey, examType } = req.body;

    const questionPaper = await questionPapersModel.create({
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

    // Flush cache on new question paper creation
    await cacheService.flush();

    return res.status(201).json({
      message: "Question paper created successfully",
      questionPaper,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create question paper",
    });
  }
}

async function viewQuestionPapers(req, res) {
  try {
    const { branch, year, semester, subjectCode, examType, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (branch) filter.branch = branch;
    if (year) filter.year = year;
    if (semester) filter.semester = semester;
    if (subjectCode) filter.subjectCode = subjectCode;
    if (examType) filter.examType = examType;

    const currentPage = Math.max(Number(page), 1);
    const currentLimit = Math.min(Math.max(Number(limit), 1), 100);

    const skip = (currentPage - 1) * currentLimit;
    const total = await questionPapersModel.countDocuments(filter);
    const questionPapers = await questionPapersModel
      .find(filter)
      .select("title subject subjectCode description branch year semester examType")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(currentLimit)
      .lean();

    return res.status(200).json({
      message: "Question papers fetched successfully",
      questionPapers,
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
      message: "Failed to fetch question papers",
    });
  }
}

async function viewPdf(req, res) {
  try {
    const { id } = req.params;
    const questionPaper = await questionPapersModel.findById(id);

    if (!questionPaper) {
      return res.status(404).json({
        message: "Question paper not found",
      });
    }

    const pdfUrl = await getPdfUrl(questionPaper.pdfKey);

    return res.status(200).json({
      pdfUrl,
    });
  } catch (error) {
    console.log("View PDF Error:", error);
    return res.status(500).json({
      message: "Failed to generate PDF URL",
    });
  }
}

async function updateQuestionPaper(req, res) {
  try {
    const { id } = req.params;
    const { title, subject, subjectCode, description, branch, year, semester, examType } = req.body;

    const paper = await questionPapersModel.findById(id);
    if (!paper) {
      return res.status(404).json({ message: "Question paper not found" });
    }

    if (title) paper.title = title;
    if (subject) paper.subject = subject;
    if (subjectCode) paper.subjectCode = subjectCode;
    if (description !== undefined) paper.description = description;
    if (branch) paper.branch = branch;
    if (year) paper.year = year;
    if (semester) paper.semester = semester;
    if (examType) paper.examType = examType;

    await paper.save();
    await cacheService.flush();

    return res.status(200).json({
      message: "Question paper updated successfully",
      questionPaper: paper,
    });
  } catch (error) {
    console.error("Update Question Paper Error:", error);
    return res.status(500).json({ message: "Failed to update question paper" });
  }
}

async function deleteQuestionPaper(req, res) {
  try {
    const { id } = req.params;
    const questionPaper = await questionPapersModel.findById(id);

    if (!questionPaper) {
      return res.status(404).json({
        message: "Question paper not found",
      });
    }

    await deleteFile(questionPaper.pdfKey);
    await questionPapersModel.findByIdAndDelete(id);

    // Flush cache on deletion
    await cacheService.flush();

    return res.status(200).json({
      message: "Question paper deleted successfully",
    });
  } catch (error) {
    console.log("Delete Question Paper Error:", error);
    return res.status(500).json({
      message: "Failed to delete question paper",
    });
  }
}

async function bulkDeleteQuestionPapers(req, res) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid or empty IDs array" });
    }

    const papers = await questionPapersModel.find({ _id: { $in: ids } });
    for (const paper of papers) {
      if (paper.pdfKey) {
        try {
          await deleteFile(paper.pdfKey);
        } catch (err) {
          console.warn(`Failed to delete R2 file for paper ${paper._id}:`, err);
        }
      }
    }

    await questionPapersModel.deleteMany({ _id: { $in: ids } });
    await cacheService.flush();

    return res.status(200).json({
      message: `${papers.length} question paper(s) deleted successfully`,
      deletedCount: papers.length,
    });
  } catch (error) {
    console.error("Bulk Delete Question Papers Error:", error);
    return res.status(500).json({ message: "Failed to bulk delete question papers" });
  }
}

module.exports = { 
  createUploadUrl, 
  createQuestionPaper, 
  viewQuestionPapers, 
  viewPdf, 
  updateQuestionPaper, 
  deleteQuestionPaper, 
  bulkDeleteQuestionPapers 
};