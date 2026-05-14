const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const dropIndex = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/carrental';
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('reviews');

    console.log('Dropping unique booking index...');
    // The index name from the error is 'booking_1'
    try {
      await collection.dropIndex('booking_1');
      console.log('Successfully dropped booking_1 index');
    } catch (e) {
      console.log('Could not drop index (it might not exist as named):', e.message);
    }

    console.log('Checking current indexes...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

dropIndex();
