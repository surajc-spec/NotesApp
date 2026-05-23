const Note = require('../models/Note');
const { normalizeSubject } = require('../utils/subjectUtils');
const { clearCache } = require('./cacheService');

const migrateSubjects = async () => {
  const cursor = Note.find(
    {},
    { _id: 1, subject: 1, subjectKey: 1 }
  )
    .lean()
    .cursor();

  let migrated = 0;
  const operations = [];

  for await (const note of cursor) {
    const normalized = normalizeSubject(note.subject);
    if (!normalized) continue;
    if (note.subject === normalized && note.subjectKey === normalized) continue;

    operations.push({
      updateOne: {
        filter: { _id: note._id },
        update: {
          $set: {
            subject: normalized,
            subjectKey: normalized,
          },
        },
      },
    });

    if (operations.length >= 500) {
      const result = await Note.bulkWrite(operations, { ordered: false });
      migrated += result.modifiedCount;
      operations.length = 0;
    }
  }

  if (operations.length) {
    const result = await Note.bulkWrite(operations, { ordered: false });
    migrated += result.modifiedCount;
  }

  if (migrated > 0) {
    await clearCache();
    console.log(`Subject normalization migration updated ${migrated} notes.`);
  }
};

module.exports = {
  migrateSubjects,
};
