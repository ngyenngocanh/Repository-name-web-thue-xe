const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './.env' });

async function check() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  const badCars = await db.collection('cars').find({
    availability: { $type: "bool" }
  }).toArray();
  
  console.log("Bad cars count:", badCars.length);
  if (badCars.length > 0) {
    console.log("Example:", badCars[0]._id, badCars[0].availability);
    
    // Fix them
    for (const c of badCars) {
      await db.collection('cars').updateOne(
        { _id: c._id },
        { $set: { availability: { isAvailable: c.availability, unavailableDates: [] } } }
      );
    }
    console.log("Fixed all bad cars!");
  }
  
  await client.close();
}
check().catch(console.error);
