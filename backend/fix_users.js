const mongoose = require('mongoose');
require('dotenv').config();
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = require('./models/User');
  const result = await User.updateMany(
    { role: 'collaborator', collaboratorRequest: { $exists: false } },
    { 
      $set: { 
        'collaboratorRequest': { status: 'pending', requestedAt: new Date() }
      } 
    }
  );
  console.log('Fixed', result.modifiedCount, 'collaborator users');
  process.exit();
})();
