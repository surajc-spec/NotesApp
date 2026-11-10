const mongoose = require('mongoose');
const config = require('../src/config/config');
const notesModel = require('../src/models/notes.model');
const aiService = require('../src/services/ai.service');

const DELAY_BETWEEN_REQUESTS_MS = 4500; // 4.5 seconds to safely stay under 15 RPM

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(config.MONGO_URI);
  console.log('Connected to MongoDB.');

  // Find all notes that are not ready yet
  const pendingNotes = await notesModel.find({
    $or: [
      { 'summary.status': { $ne: 'ready' } },
      { 'summary.content': { $exists: false } },
      { 'summary.content': null },
      { 'summary.content': '' },
    ],
  }).sort({ createdAt: -1 });

  console.log(`\n========================================`);
  console.log(`Found ${pendingNotes.length} notes requiring summary generation.`);
  console.log(`========================================\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < pendingNotes.length; i++) {
    const note = pendingNotes[i];
    const indexStr = `[${i + 1}/${pendingNotes.length}]`;
    console.log(`${indexStr} Starting: "${note.title}" (${note.subject || 'N/A'})`);

    if (!note.pdfKey) {
      console.warn(`  ⚠️ Skipped: No pdfKey found for note "${note.title}"`);
      continue;
    }

    try {
      note.summary = {
        content: null,
        status: 'generating',
        generatedAt: new Date(),
      };
      await note.save();

      const summaryContent = await aiService.generatePdfSummary(note.pdfKey, {
        title: note.title,
        subject: note.subject,
        branch: note.branch,
        semester: note.semester,
      });

      note.summary = {
        content: summaryContent,
        status: 'ready',
        generatedAt: new Date(),
      };
      await note.save();

      successCount++;
      console.log(`  ✓ SUCCESS: Saved to DB (${summaryContent.length} chars)`);
    } catch (err) {
      failCount++;
      console.error(`  ✗ FAILED: ${err.message}`);
      note.summary = {
        content: null,
        status: 'failed',
        generatedAt: new Date(),
      };
      await note.save();

      // If rate limited or 503, back off an extra 12 seconds
      if (err.message.includes('429') || err.message.includes('503') || err.message.includes('quota') || err.message.includes('demand')) {
        console.log(`  ⏳ Demand/rate limit detected, sleeping 12s...`);
        await sleep(12000);
      }
    }

    // Safety pause between notes
    if (i < pendingNotes.length - 1) {
      console.log(`  Waiting ${DELAY_BETWEEN_REQUESTS_MS / 1000}s before next note...`);
      await sleep(DELAY_BETWEEN_REQUESTS_MS);
    }
  }

  console.log(`\n========================================`);
  console.log(`BATCH COMPLETE!`);
  console.log(`Successfully generated: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`========================================\n`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Fatal batch error:', err);
  process.exit(1);
});
