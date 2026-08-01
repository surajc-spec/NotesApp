const config = require('../src/config/config')
const express = require('express')
const authRoutes = require('./routes/auth.routes')
const cookieParser = require('cookie-parser')
const compression = require("compression");
const cors = require("cors");

const noteRoutes = require("../src/routes/notes.routes");
const questionPaperRoutes = require("../src/routes/questionPapers.routes");

const app = express();

app.use(express.json())
app.use(cookieParser())
app.use(compression());

// Enable CORS for localhost and production deployed domains
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or same-domain proxy rewrites)
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Dynamically allow deployment origins
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use('/api/auth', authRoutes)
app.use("/api/notes", noteRoutes);
app.use("/api/question-papers", questionPaperRoutes);

module.exports = app;
