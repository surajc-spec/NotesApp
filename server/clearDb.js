require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Note = require('./models/Note');

async function clearDatabase() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/notes-app';
  console.log(`Connecting to MongoDB at: ${mongoUri}...`);
  
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected successfully to MongoDB!');
    
    // 1. Delete all Notes
    const notesCount = await Note.countDocuments();
    const deletedNotes = await Note.deleteMany({});
    console.log(`🗑️ Deleted ${deletedNotes.deletedCount} of ${notesCount} notes.`);
    
    // 2. Delete all Users
    const usersCount = await User.countDocuments();
    const deletedUsers = await User.deleteMany({});
    console.log(`🗑️ Deleted ${deletedUsers.deletedCount} of ${usersCount} users.`);
    
    console.log('🎉 Database cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Error clearing the database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    process.exit(0);
  }
}

clearDatabase();
