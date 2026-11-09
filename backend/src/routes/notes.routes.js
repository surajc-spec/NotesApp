const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const rateLimitMiddleware = require("../middlewares/rateLimit.middleware");
const cacheMiddleware = require("../middlewares/cache.middleware");
const notesController = require("../controllers/notes.controller");

router.post("/upload-url", authMiddleware.authAdmin, rateLimitMiddleware.uploadLimiter, notesController.createUploadUrl);
router.post("/create-note", authMiddleware.authAdmin, notesController.createNote);
router.post("/create-notes", authMiddleware.authAdmin, notesController.createNote);

router.get("/view-notes", cacheMiddleware(300), authMiddleware.authUser, notesController.viewNotes);
router.get("/:id/view", rateLimitMiddleware.viewPdfLimiter, authMiddleware.authUser, notesController.viewPdf);

// AI Summary endpoints (strictly authenticated users only)
router.get("/:id/summary", rateLimitMiddleware.apiLimiter, authMiddleware.authUser, notesController.getNoteSummary);
router.post("/:id/summary/regenerate", rateLimitMiddleware.apiLimiter, authMiddleware.authUser, notesController.regenerateNoteSummary);

// Admin Management & Bulk Actions
router.put("/:id", authMiddleware.authAdmin, notesController.updateNote);
router.post("/bulk-delete", authMiddleware.authAdmin, notesController.bulkDeleteNotes);
router.delete("/:id", authMiddleware.authAdmin, notesController.deleteNotes);

module.exports = router;