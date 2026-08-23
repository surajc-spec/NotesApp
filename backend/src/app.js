const config = require('../src/config/config')
const express = require('express')
const authRoutes = require('./routes/auth.routes')
const cookieParser = require('cookie-parser')
const compression = require("compression");
const cors = require("cors");

const noteRoutes = require("../src/routes/notes.routes");
const questionPaperRoutes = require("../src/routes/questionPapers.routes");
const contactRoutes = require("../src/routes/contact.routes");
const feedbackRoutes = require("../src/routes/feedback.routes");
const { antiScraperMiddleware, honeypotTrapHandler } = require("./middlewares/antiScraper.middleware");

const app = express();

app.use(express.json())
app.use(cookieParser())
app.use(compression());

// Enable CORS for localhost, mobile Capacitor app, and production deployed domains
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost",
  "https://localhost",
  "capacitor://localhost",
  "https://noteshare.online",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like native mobile apps, curl, or same-domain proxy rewrites)
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Dynamically allow deployment origins
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

// Anti-Scraper Security Middleware (Blocks Python/Curl/Bot user-agents & Banned IPs)
app.use(antiScraperMiddleware);

// Lightweight health check endpoint for 24/7 keep-alive cron pinging
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Security Honeypot Trap (Bans any automated scraper that hits this endpoint)
app.get('/api/security/v1/trap', honeypotTrapHandler);

app.use('/api/auth', authRoutes)
app.use("/api/notes", noteRoutes);
app.use("/api/question-papers", questionPaperRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/feedback", feedbackRoutes);

module.exports = app;
