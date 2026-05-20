require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function viewUsers() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/notes-app';
  console.log(`Connecting to database at: ${mongoUri.replace(/:([^:@]+)@/, ':****@')}...\n`);
  
  try {
    await mongoose.connect(mongoUri);
    
    const users = await User.find({}).sort({ createdAt: -1 });
    
    if (users.length === 0) {
      console.log('📝 No registered users found in the database.');
    } else {
      console.log(`👥 Found ${users.length} registered user(s):`);
      console.log('--------------------------------------------------');
      users.forEach((user, index) => {
        console.log(`[User #${index + 1}]`);
        console.log(`  Name   : ${user.name}`);
        console.log(`  Email  : ${user.email}`);
        console.log(`  Branch : ${user.branch}`);
        console.log(`  Year   : ${user.year}`);
        console.log(`  Joined : ${user.createdAt.toLocaleString()}`);
        console.log('--------------------------------------------------');
      });
    }
  } catch (error) {
    console.error('❌ Error reading database users:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

viewUsers();
