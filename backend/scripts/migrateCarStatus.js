/**
 * Migration Script: Update existing cars to new status system
 * Run: node backend/scripts/migrateCarStatus.js
 * 
 * This script updates all existing cars to use the new status fields:
 * - approvalStatus: 'pending' | 'approved' | 'rejected'
 * - operationalStatus: 'available' | 'rented' | 'maintenance' | 'repair' | 'inactive'
 * 
 * Mapping from old status:
 * - 'pending' -> approvalStatus: 'pending', operationalStatus: 'inactive'
 * - 'approved' -> approvalStatus: 'approved', operationalStatus: 'available'
 * - 'available' -> approvalStatus: 'approved', operationalStatus: 'available'
 * - 'rejected' -> approvalStatus: 'rejected', operationalStatus: 'inactive'
 * - 'inactive' -> approvalStatus: 'approved', operationalStatus: 'inactive'
 * - 'maintenance' -> approvalStatus: 'approved', operationalStatus: 'maintenance'
 * - 'repair' -> approvalStatus: 'approved', operationalStatus: 'repair'
 */

const mongoose = require('mongoose');
const Car = require('../models/Car');

// Load environment variables
require('dotenv').config({ path: '../../.env' });

async function migrateCarStatus() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/car_rental');
    console.log('Connected to MongoDB');

    // Get all cars
    const cars = await Car.find({});
    console.log(`Found ${cars.length} cars to migrate`);

    let updatedCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (const car of cars) {
      try {
        // Skip if already has new fields properly set
        if (car.approvalStatus && car.operationalStatus) {
          console.log(`⏭️  Car ${car._id} (${car.brand} ${car.model}) - Already migrated`);
          skippedCount++;
          continue;
        }

        // Determine new status values based on old status
        let approvalStatus, operationalStatus;
        const oldStatus = car.status || 'pending';

        switch (oldStatus) {
          case 'pending':
            approvalStatus = 'pending';
            operationalStatus = 'inactive';
            break;
          case 'approved':
            approvalStatus = 'approved';
            operationalStatus = 'available';
            break;
          case 'available':
            approvalStatus = 'approved';
            operationalStatus = 'available';
            break;
          case 'rejected':
            approvalStatus = 'rejected';
            operationalStatus = 'inactive';
            break;
          case 'inactive':
            approvalStatus = 'approved';
            operationalStatus = 'inactive';
            break;
          case 'maintenance':
            approvalStatus = 'approved';
            operationalStatus = 'maintenance';
            break;
          case 'repair':
            approvalStatus = 'approved';
            operationalStatus = 'repair';
            break;
          default:
            approvalStatus = 'pending';
            operationalStatus = 'inactive';
        }

        // Update car with new fields
        await Car.findByIdAndUpdate(car._id, {
          approvalStatus,
          operationalStatus,
          // Keep old status for backward compatibility
          status: oldStatus
        });

        console.log(`✅ Car ${car._id} (${car.brand} ${car.model}) - Updated: approvalStatus=${approvalStatus}, operationalStatus=${operationalStatus}`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Error updating car ${car._id}:`, error.message);
        errors.push({ carId: car._id, error: error.message });
      }
    }

    // Summary
    console.log('\n=== Migration Summary ===');
    console.log(`Total cars: ${cars.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped (already migrated): ${skippedCount}`);
    console.log(`Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\nErrors encountered:');
      errors.forEach(e => console.log(`  - Car ${e.carId}: ${e.error}`));
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run migration
migrateCarStatus();
