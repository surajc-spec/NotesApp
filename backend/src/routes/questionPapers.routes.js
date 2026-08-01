const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const questionPapersController = require("../controllers/questionPapers.controller");

router.post("/upload-url",authMiddleware.authAdmin,questionPapersController.createUploadUrl);
router.post("/create-question-paper",authMiddleware.authAdmin,questionPapersController.createQuestionPaper);
router.get("/view-question-papers",authMiddleware.authUser,questionPapersController.viewQuestionPapers);
router.get("/:id/view",authMiddleware.authUser,questionPapersController.viewPdf);
router.delete("/:id",authMiddleware.authAdmin,questionPapersController.deleteQuestionPaper);

    
module.exports = router;