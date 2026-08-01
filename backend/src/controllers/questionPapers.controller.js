const crypto = require("crypto");

const {getUploadUrl,getPdfUrl,deleteFile}  = require("../services/r2.service");
const questionPapersModel = require("../models/questionPapers.model");

async function createUploadUrl(req, res) {
  try {
     const { fileName,fileType,fileSize  } = req.body;
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
    const {
      title,subject,subjectCode,description,branch,year,semester,pdfKey,examType} = req.body;

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
    const {branch,year,semester,subjectCode,examType,page = 1, limit = 20 } = req.query;

    const filter = {}
    
    if (branch) filter.branch = branch;
    if (year) filter.year = year;
    if (semester) filter.semester = semester;
    if (subjectCode) filter.subjectCode = subjectCode;
    if (examType) filter.examType = examType;
    
const currentPage = Math.max(Number(page), 1);

const currentLimit = Math.min(
  Math.max(Number(limit), 1),
  50
);

const skip = (currentPage - 1) * currentLimit;
    const total = await notesModel.countDocuments(filter);
    const questionPapers = await questionPapersModel
    .find(filter)
    .select("title subject subjectCode description branch year semester examType" )
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
                totalPages: Math.ceil(total / limit),
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

module.exports = {createUploadUrl,createQuestionPaper,viewQuestionPapers,viewPdf,deleteQuestionPaper };