const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const rateLimitMiddleware = require("../middlewares/rateLimit.middleware");
const notesController = require("../controllers/notes.controller");

router.post("/upload-url", authMiddleware.authAdmin, rateLimitMiddleware.uploadLimiter, notesController.createUploadUrl);
router.post("/create-note", authMiddleware.authAdmin, notesController.createNote);
router.post("/create-notes", authMiddleware.authAdmin, notesController.createNote);
router.get("/view-notes", rateLimitMiddleware.apiLimiter, authMiddleware.authUser, notesController.viewNotes);
router.get("/:id/view", rateLimitMiddleware.viewPdfLimiter, authMiddleware.authUser, notesController.viewPdf);
router.delete("/:id", authMiddleware.authAdmin, notesController.deleteNotes);

module.exports = router;