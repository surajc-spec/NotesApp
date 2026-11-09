const { GoogleGenAI } = require('@google/genai');
const { getFileStream } = require('./r2.service');
const config = require('../config/config');

let aiClient = null;

function getAiClient() {
  if (!aiClient) {
    if (!config.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured in backend environment.');
    }
    aiClient = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
  }
  return aiClient;
}

/**
 * Summarize a PDF note document stored in Cloudflare R2
 * @param {string} pdfKey - S3/R2 object key
 * @param {object} metadata - Document metadata (title, subject, branch, semester)
 * @returns {Promise<string>} Structured Markdown summary
 */
async function generatePdfSummary(pdfKey, metadata = {}) {
  const ai = getAiClient();

  // 1. Fetch PDF buffer directly from Cloudflare R2
  const s3Response = await getFileStream(pdfKey);
  if (!s3Response || !s3Response.Body) {
    throw new Error('Could not retrieve PDF file from Cloudflare R2 storage.');
  }

  const byteArray = await s3Response.Body.transformToByteArray();
  const buffer = Buffer.from(byteArray);
  const base64Data = buffer.toString('base64');

  const docTitle = metadata.title || 'Engineering Study Notes';
  const docSubject = metadata.subject || 'Engineering Subject';
  const docBranch = metadata.branch || 'Engineering';
  const docSemester = metadata.semester ? `Semester ${metadata.semester}` : '';

  const prompt = `You are a senior university engineering professor preparing an exhaustive, high-scoring exam revision guide for students studying "${docTitle}" (${docSubject}, ${docBranch} ${docSemester}).

CRITICAL REQUIREMENTS:
1. QUESTION-WISE STRUCTURE: The entire summary MUST be organized question-by-question based on the core topics in these notes. Identify 5 to 7 most critical and frequent university semester exam questions that comprehensively cover the syllabus of this document. DO NOT mention marks or weightage numbers.
2. NO ASCII ART OR TEXT-BASED DIAGRAMS: Absolutely DO NOT draw diagrams using text, boxes, arrows, or ASCII art (no "[RNN] ---> [RNN]" or pseudo-graphics). Instead, provide rich written explanations and state clearly what diagram or architecture students should draw on paper in exams.
3. ZERO EMOJIS: Do not use any emojis anywhere in the document (no icons, symbols, or AI decor). Maintain a formal, academic textbook tone.
4. DEEP CONCEPTUAL CONTENT: Focus heavily on thorough explanations of concepts, internal mechanisms, workings, comparisons, and step-by-step logic.
5. MATHEMATICAL FORMULAS INTEGRATED NATURALLY: Wherever formulas exist for a question, format them in clean LaTeX ($$ ... $$ for standalone formulas, $ ... $ for inline variables) with an explicit explanation of every variable.

Structure your response strictly as follows:

# Unit Exam Revision Guide: ${docTitle}

## Unit Syllabus Overview
(2-3 concise sentences summarizing the overall domain and syllabus boundaries covered by this unit.)

---

## Question-Wise Exam Solutions

For each of the 5 to 7 major exam questions, format like this:

### Question [N]: [Realistic University Exam Question Title]
- **Concept & Detailed Explanation**: 
(Provide thorough theoretical explanation of the theory, working mechanics, architecture, and background.)
- **Mathematical Formulations**: 
(Include all necessary equations, state updates, activation functions in clean LaTeX $$ ... $$, explaining each parameter. If the topic is purely qualitative, write "Qualitative topic: Focus on architectural characteristics and use cases".)
- **Key Points & Comparative Analysis**:
(Bullet points of key points, or a comparative Markdown table if the question compares two or more techniques.)
- **Exam Guidance & Diagram to Draw**:
(Specific guidance on what schematic diagram, flowchart, or block architecture to sketch in the exam to secure maximum marks.)

---`;

  const modelsToTry = ['gemini-3.5-flash', 'gemini-3.5-flash-lite'];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: 'application/pdf',
                  data: base64Data,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
      });

      if (response && response.text) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn(`[AI Service] Model ${modelName} failed:`, err.message);
      lastError = err;
    }
  }

  throw new Error(lastError ? lastError.message : 'AI generation failed across all available models.');
}

module.exports = {
  generatePdfSummary,
};
