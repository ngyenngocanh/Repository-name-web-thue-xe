/**
 * Fix script: Restore "driver" role for users who were incorrectly changed to "collaborator"
 * 
 * Logic: If a user has role "collaborator" AND has driverInfo (meaning they registered as a driver),
 * change their role back to "driver" while keeping collaboratorRequest as approved.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function fixDriverRoles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find users who are collaborators but have driver info (they were originally drivers)
    const wrongRoleUsers = await User.find({
      role: 'collaborator',
      'driverInfo.driverLicense': { $exists: true, $ne: '' }
    }).select('_id fullName email role driverInfo.driverLicense');

    console.log(`Found ${wrongRoleUsers.length} users with wrong role:`);
    
    for (const u of wrongRoleUsers) {
      console.log(`  - ${u.fullName} (${u.email}) | role: ${u.role} | license: ${u.driverInfo?.driverLicense}`);
      
      // Restore to "driver" role
      u.role = 'driver';
      await u.save();
      console.log(`    ✅ Fixed: role -> "driver"`);
    }

    console.log('\nDone! All driver roles have been restored.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixDriverRoles();
