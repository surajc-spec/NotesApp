const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const rateLimitMiddleware = require("../middlewares/rateLimit.middleware");
const cacheMiddleware = require("../middlewares/cache.middleware");
const notesController = require("../controllers/notes.controller");

router.post("/upload-url", authMiddleware.authAdmin, rateLimitMiddleware.uploadLimiter, notesController.createUploadUrl);
router.post("/create-note", authMiddleware.authAdmin, notesController.createNote);
router.post("/create-notes", authMiddleware.authAdmin, notesController.createNote);

// Multi-Level Caching placed FIRST to serve hits instantly & bypass rate-limit burn
router.get("/view-notes", cacheMiddleware(300), authMiddleware.authUser, notesController.viewNotes);
router.get("/:id/view", rateLimitMiddleware.viewPdfLimiter, authMiddleware.authUser, notesController.viewPdf);
router.delete("/:id", authMiddleware.authAdmin, notesController.deleteNotes);

module.exports = router;