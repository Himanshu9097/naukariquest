require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  const User = require('./models/User');
  const candidates = await User.find({ role: 'candidate', email: { $exists: true, $ne: '' } }).select('name email');
  
  console.log(`\nFound ${candidates.length} candidates in User model:`);
  candidates.forEach(c => console.log(` - ${c.name || 'No name'} <${c.email}>`));

  if (candidates.length === 0) {
    console.log('\n❌ No candidates found — emails won\'t send because no candidate accounts exist yet!');
    mongoose.disconnect();
    return;
  }

  // Now test sending to the first candidate
  const { blastJobNotification } = require('./services/emailService');
  const fakeJob = {
    _id: new mongoose.Types.ObjectId(),
    title: 'Test Job — Email Blast Working!',
    company: 'NaukriQuest Test',
    location: 'Remote',
    type: 'Full-time',
    salary: '10-20 LPA',
    apply_link: '',
  };

  console.log('\n📣 Triggering blast...');
  await blastJobNotification(fakeJob);
  
  console.log('\n✅ Blast complete. Check inboxes!');
  mongoose.disconnect();
}

test().catch(err => { console.error(err); process.exit(1); });
