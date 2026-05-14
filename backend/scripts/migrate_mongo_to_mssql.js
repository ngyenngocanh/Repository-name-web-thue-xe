/* eslint-disable no-console */
require('dotenv').config({ override: true });

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { getSqlPool, sql } = require('../db/sqlServer');

// Load mongoose models
const User = require('../models/User');
const Address = require('../models/Address');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Contract = require('../models/Contract');
const Notification = require('../models/Notification');
const Payout = require('../models/Payout');
const TripConfig = require('../models/TripConfig');
const TripSettings = require('../models/TripSettings');

const LOG_PATH = path.join(__dirname, 'migrate_mongo_to_mssql.log');
fs.writeFileSync(LOG_PATH, '', 'utf8');

function log(...args) {
  const line = `[${new Date().toISOString()}] ${args
    .map((a) => (typeof a === 'string' ? a : JSON.stringify(a)))
    .join(' ')}\n`;
  fs.appendFileSync(LOG_PATH, line, 'utf8');
  console.log(...args);
}

function oid(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value.toString) return value.toString();
  return String(value);
}

function json(value) {
  if (value === undefined) return null;
  if (value === null) return null;
  return JSON.stringify(value);
}

function date(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  // guard invalid
  // eslint-disable-next-line no-restricted-globals
  return isNaN(d.getTime()) ? null : d;
}

function pick(obj, keys) {
  const out = {};
  for (const k of keys) out[k] = obj?.[k];
  return out;
}

async function connectMongo() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Missing env MONGODB_URI (Mongo connection string)');
  }
  await mongoose.connect(process.env.MONGODB_URI);
}

async function truncateTables(pool) {
  // Order matters because of FK constraints we added.
  const statements = [
    'DELETE FROM dbo.Notifications',
    'DELETE FROM dbo.Payouts',
    'DELETE FROM dbo.Contracts',
    'DELETE FROM dbo.Reviews',
    'DELETE FROM dbo.Bookings',
    'DELETE FROM dbo.Cars',
    'DELETE FROM dbo.Addresses',
    'DELETE FROM dbo.Users',
    'DELETE FROM dbo.TripConfigs',
    'DELETE FROM dbo.TripSettings',
  ];

  for (const stmt of statements) {
    // Ignore missing tables (in case user edited schema)
    try {
      // eslint-disable-next-line no-await-in-loop
      await pool.request().query(stmt);
    } catch (e) {
      console.warn(`[warn] Skip "${stmt}": ${e.message}`);
    }
  }
}

async function insertUsers(pool) {
  const users = await User.find({}).lean();
  log(`[Users] ${users.length}`);

  for (const u of users) {
    const req = pool.request();
    req.input('id', sql.VarChar(24), oid(u._id));
    req.input('fullName', sql.NVarChar(100), u.fullName ?? '');
    req.input('email', sql.VarChar(255), u.email ?? '');
    req.input('passwordHash', sql.VarChar(255), u.password ?? '');
    req.input('phone', sql.VarChar(30), u.phone ?? '');
    req.input('role', sql.VarChar(20), u.role ?? 'user');
    req.input('isVerified', sql.Bit, !!u.isVerified);
    req.input('isOnline', sql.Bit, !!u.isOnline);
    req.input('isActive', sql.Bit, u.isActive !== false);
    req.input('ratingAverage', sql.Decimal(3, 1), u.rating?.average ?? 0);
    req.input('ratingCount', sql.Int, u.rating?.count ?? 0);
    req.input('totalEarnings', sql.Decimal(18, 2), u.totalEarnings ?? 0);
    req.input('addressId', sql.VarChar(24), oid(u.addressId));

    req.input('avatarJson', sql.NVarChar(sql.MAX), json(u.avatar));
    req.input('idCardJson', sql.NVarChar(sql.MAX), json(u.idCard));
    req.input('drivingLicenseJson', sql.NVarChar(sql.MAX), json(u.drivingLicense));
    req.input('bankAccountJson', sql.NVarChar(sql.MAX), json(u.bankAccount));
    req.input('emergencyContactJson', sql.NVarChar(sql.MAX), json(u.emergencyContact));
    req.input('preferencesJson', sql.NVarChar(sql.MAX), json(u.preferences));
    req.input('totalTripsJson', sql.NVarChar(sql.MAX), json(u.totalTrips));
    req.input('collaboratorRequestJson', sql.NVarChar(sql.MAX), json(u.collaboratorRequest));
    req.input('contractJson', sql.NVarChar(sql.MAX), json(u.contract));
    req.input('driverSchedulesJson', sql.NVarChar(sql.MAX), json(u.driverSchedules));
    req.input('driverInfoJson', sql.NVarChar(sql.MAX), json(u.driverInfo));
    req.input('ownerInfoJson', sql.NVarChar(sql.MAX), json(u.ownerInfo));

    req.input('lastLogin', sql.DateTime2, date(u.lastLogin));
    req.input('createdAt', sql.DateTime2, date(u.createdAt));
    req.input('updatedAt', sql.DateTime2, date(u.updatedAt));

    await req.query(`
      INSERT INTO dbo.Users (
        id, fullName, email, passwordHash, phone, role,
        isVerified, isOnline, isActive,
        ratingAverage, ratingCount, totalEarnings, addressId,
        avatarJson, idCardJson, drivingLicenseJson, bankAccountJson, emergencyContactJson,
        preferencesJson, totalTripsJson, collaboratorRequestJson, contractJson,
        driverSchedulesJson, driverInfoJson, ownerInfoJson,
        lastLogin, createdAt, updatedAt
      )
      VALUES (
        @id, @fullName, @email, @passwordHash, @phone, @role,
        @isVerified, @isOnline, @isActive,
        @ratingAverage, @ratingCount, @totalEarnings, @addressId,
        @avatarJson, @idCardJson, @drivingLicenseJson, @bankAccountJson, @emergencyContactJson,
        @preferencesJson, @totalTripsJson, @collaboratorRequestJson, @contractJson,
        @driverSchedulesJson, @driverInfoJson, @ownerInfoJson,
        @lastLogin, @createdAt, @updatedAt
      )
    `);
  }
}

async function fetchExistingUserIds(pool) {
  const result = await pool.request().query('SELECT id FROM dbo.Users');
  const ids = new Set();
  for (const row of result.recordset || []) ids.add(String(row.id));
  return ids;
}

function makePlaceholderEmail(id) {
  // Keep it unique and valid-ish; domain reserved for invalid addresses.
  return `missing+${id}@local.invalid`;
}

async function ensurePlaceholderUsers(pool, missingUserIds) {
  if (!missingUserIds || missingUserIds.size === 0) {
    log('[Users] placeholder inserted=0');
    return;
  }

  let inserted = 0;
  for (const id of missingUserIds) {
    const req = pool.request();
    req.input('id', sql.VarChar(24), id);
    req.input('fullName', sql.NVarChar(100), '(missing user)');
    req.input('email', sql.VarChar(255), makePlaceholderEmail(id));
    req.input('passwordHash', sql.VarChar(255), 'MISSING');
    req.input('phone', sql.VarChar(30), '0000000000');
    req.input('role', sql.VarChar(20), 'user');
    req.input('isVerified', sql.Bit, 0);
    req.input('isOnline', sql.Bit, 0);
    req.input('isActive', sql.Bit, 0);
    req.input('ratingAverage', sql.Decimal(3, 1), 0);
    req.input('ratingCount', sql.Int, 0);
    req.input('totalEarnings', sql.Decimal(18, 2), 0);

    // Insert only if not exists (in case rerun without wipe)
    // eslint-disable-next-line no-await-in-loop
    const res = await req.query(`
      IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE id = @id)
      BEGIN
        INSERT INTO dbo.Users (
          id, fullName, email, passwordHash, phone, role,
          isVerified, isOnline, isActive,
          ratingAverage, ratingCount, totalEarnings
        )
        VALUES (
          @id, @fullName, @email, @passwordHash, @phone, @role,
          @isVerified, @isOnline, @isActive,
          @ratingAverage, @ratingCount, @totalEarnings
        )
      END
    `);
    // `rowsAffected` is an array, but not consistent across versions; just count by checking existence again.
    // eslint-disable-next-line no-await-in-loop
    const check = await pool.request().input('id', sql.VarChar(24), id).query('SELECT 1 AS ok FROM dbo.Users WHERE id=@id');
    if ((check.recordset || []).length === 1) inserted += 1;
    void res;
  }

  log(`[Users] placeholder ensured=${missingUserIds.size} (total users now should cover all references)`);
  log(`[Users] placeholder inserted~=${inserted}`);
}

async function fetchExistingBookingIds(pool) {
  const result = await pool.request().query('SELECT id FROM dbo.Bookings');
  const ids = new Set();
  for (const row of result.recordset || []) ids.add(String(row.id));
  return ids;
}

async function collectReferencedBookingIds() {
  const ids = new Set();
  const add = (v) => {
    const s = oid(v);
    if (s) ids.add(s);
  };

  const reviews = await Review.find({}, { booking: 1 }).lean();
  for (const r of reviews) add(r.booking);

  const contracts = await Contract.find({}, { booking: 1 }).lean();
  for (const c of contracts) add(c.booking);

  const notifs = await Notification.find({}, { metadata: 1 }).lean();
  for (const n of notifs) add(n.metadata?.bookingId);

  return ids;
}

async function ensurePlaceholderBookings(pool, missingBookingIds, fallbackUserId) {
  if (!missingBookingIds || missingBookingIds.size === 0) {
    log('[Bookings] placeholder inserted=0');
    return;
  }
  if (!fallbackUserId) throw new Error('Missing fallbackUserId for placeholder bookings');

  let inserted = 0;
  const now = new Date();

  for (const id of missingBookingIds) {
    const req = pool.request();
    req.input('id', sql.VarChar(24), id);
    req.input('renterId', sql.VarChar(24), fallbackUserId);
    req.input('ownerId', sql.VarChar(24), fallbackUserId);
    req.input('mode', sql.VarChar(20), 'daily');
    req.input('rentalType', sql.VarChar(20), 'self_drive');
    req.input('startDate', sql.DateTime2, now);
    req.input('endDate', sql.DateTime2, now);
    req.input('pickupTime', sql.VarChar(5), '00:00');
    req.input('returnTime', sql.VarChar(5), '00:00');
    req.input('pickupLocation', sql.NVarChar(500), '(missing booking)');
    req.input('returnLocation', sql.NVarChar(500), '(missing booking)');
    req.input('status', sql.VarChar(20), 'cancelled');
    req.input('extraFee', sql.Decimal(18, 2), 0);
    req.input('bookingType', sql.VarChar(20), 'immediate');
    req.input('createdAt', sql.DateTime2, now);
    req.input('updatedAt', sql.DateTime2, now);

    // eslint-disable-next-line no-await-in-loop
    await req.query(`
      IF NOT EXISTS (SELECT 1 FROM dbo.Bookings WHERE id = @id)
      BEGIN
        INSERT INTO dbo.Bookings (
          id, carId, renterId, ownerId, bookedById, driverId,
          mode, rentalType, contractId, contractFile,
          startDate, endDate, pickupTime, returnTime,
          pickupLocation, returnLocation, pickupAddressId, returnAddressId,
          status, extraFee,
          durationJson, pricingJson, tripJson, paymentJson, settlementJson,
          documentsJson, cancellationJson, longTermAgreementsJson, contactInfoJson,
          optionsJson, notes,
          bookingType, prebookJson,
          createdAt, updatedAt
        )
        VALUES (
          @id, NULL, @renterId, @ownerId, NULL, NULL,
          @mode, @rentalType, NULL, NULL,
          @startDate, @endDate, @pickupTime, @returnTime,
          @pickupLocation, @returnLocation, NULL, NULL,
          @status, @extraFee,
          NULL, NULL, NULL, NULL, NULL,
          NULL, NULL, NULL, NULL,
          NULL, NULL,
          @bookingType, NULL,
          @createdAt, @updatedAt
        )
      END
    `);
    inserted += 1;
  }

  log(`[Bookings] placeholder ensured=${missingBookingIds.size}`);
  log(`[Bookings] placeholder inserted~=${inserted}`);
}

async function insertAddresses(pool, existingUserIds) {
  const addresses = await Address.find({}).lean();
  log(`[Addresses] ${addresses.length}`);

  for (const a of addresses) {
    const ownerId = oid(a.owner);
    // With placeholders, this should always exist. Keep a guard anyway.
    if (!ownerId || !existingUserIds.has(ownerId)) {
      throw new Error(`Address ownerId missing after placeholder step: ownerId=${ownerId} addressId=${oid(a._id)}`);
    }

    const req = pool.request();
    req.input('id', sql.VarChar(24), oid(a._id));
    req.input('street', sql.NVarChar(200), a.street ?? '');
    req.input('wardJson', sql.NVarChar(sql.MAX), json(a.ward));
    req.input('provinceJson', sql.NVarChar(sql.MAX), json(a.province));
    req.input('fullAddress', sql.NVarChar(500), a.fullAddress ?? '');
    req.input('referenceType', sql.VarChar(20), a.referenceType ?? 'User');
    req.input('referenceId', sql.VarChar(24), oid(a.referenceId));
    req.input('ownerId', sql.VarChar(24), ownerId);
    req.input('isDefault', sql.Bit, !!a.isDefault);
    req.input('addressType', sql.VarChar(20), a.addressType ?? 'home');
    req.input('isActive', sql.Bit, a.isActive !== false);
    req.input('metadataJson', sql.NVarChar(sql.MAX), json(a.metadata));
    req.input('createdAt', sql.DateTime2, date(a.createdAt));
    req.input('updatedAt', sql.DateTime2, date(a.updatedAt));

    await req.query(`
      INSERT INTO dbo.Addresses (
        id, street, wardJson, provinceJson, fullAddress,
        referenceType, referenceId, ownerId,
        isDefault, addressType, isActive, metadataJson,
        createdAt, updatedAt
      )
      VALUES (
        @id, @street, @wardJson, @provinceJson, @fullAddress,
        @referenceType, @referenceId, @ownerId,
        @isDefault, @addressType, @isActive, @metadataJson,
        @createdAt, @updatedAt
      )
    `);
  }
  log(`[Addresses] inserted=${addresses.length}`);
}

async function insertCars(pool, existingUserIds) {
  const cars = await Car.find({}).lean();
  log(`[Cars] ${cars.length}`);

  for (const c of cars) {
    const ownerId = oid(c.owner);
    if (!ownerId || !existingUserIds.has(ownerId)) {
      throw new Error(`Car ownerId missing after placeholder step: ownerId=${ownerId} carId=${oid(c._id)}`);
    }

    const req = pool.request();
    req.input('id', sql.VarChar(24), oid(c._id));
    req.input('ownerId', sql.VarChar(24), ownerId);
    req.input('brand', sql.NVarChar(50), c.brand ?? '');
    req.input('model', sql.NVarChar(50), c.model ?? '');
    req.input('year', sql.Int, c.year ?? 0);
    req.input('licensePlate', sql.VarChar(30), c.licensePlate ?? '');
    req.input('color', sql.NVarChar(30), c.color ?? '');
    req.input('seats', sql.Int, c.seats ?? 0);
    req.input('carType', sql.NVarChar(50), c.type ?? '');
    req.input('transmission', sql.VarChar(20), c.transmission ?? '');
    req.input('fuel', sql.VarChar(20), c.fuel ?? '');

    req.input('pricePerDay', sql.Decimal(18, 2), c.pricePerDay ?? 0);
    req.input('pricePerHour', sql.Decimal(18, 2), c.pricePerHour ?? 0);
    req.input('isSelfDrive', sql.Bit, c.isSelfDrive !== false);
    req.input('isWithDriver', sql.Bit, !!c.isWithDriver);
    req.input('isTripSupport', sql.Bit, !!c.isTripSupport);
    req.input('pricePerDayWithDriver', sql.Decimal(18, 2), c.pricePerDayWithDriver ?? 0);
    req.input('pricePerHourWithDriver', sql.Decimal(18, 2), c.pricePerHourWithDriver ?? 0);
    req.input('driverFeePerDay', sql.Decimal(18, 2), c.driverFeePerDay ?? 0);
    req.input('pricePerHalfMonth', sql.Decimal(18, 2), c.pricePerHalfMonth ?? 0);
    req.input('pricePerMonth', sql.Decimal(18, 2), c.pricePerMonth ?? 0);
    req.input('priceWeekend', sql.Decimal(18, 2), c.priceWeekend ?? 0);
    req.input('deposit', sql.Decimal(18, 2), c.deposit ?? 0);
    req.input('outOfProvinceFee', sql.Decimal(18, 2), c.outOfProvinceFee ?? 0);
    req.input('inProvinceFee', sql.Decimal(18, 2), c.inProvinceFee ?? 0);
    req.input('mileage', sql.Int, c.mileage ?? 0);
    req.input('description', sql.NVarChar(1000), c.description ?? null);

    req.input('status', sql.VarChar(20), c.status ?? 'pending');
    req.input('approvalStatus', sql.VarChar(20), c.approvalStatus ?? 'pending');
    req.input('operationalStatus', sql.VarChar(20), c.operationalStatus ?? 'inactive');
    req.input('approvedAt', sql.DateTime2, date(c.approvedAt));
    req.input('rejectedAt', sql.DateTime2, date(c.rejectedAt));
    req.input('commissionPercentage', sql.Int, c.commissionPercentage ?? 15);
    req.input('rejectionReason', sql.NVarChar(500), c.rejectionReason ?? null);

    req.input('addressId', sql.VarChar(24), oid(c.addressId));
    req.input('imagesJson', sql.NVarChar(sql.MAX), json(c.images));
    req.input('featuresJson', sql.NVarChar(sql.MAX), json(c.features));
    req.input('locationJson', sql.NVarChar(sql.MAX), json(c.location));
    req.input('availabilityJson', sql.NVarChar(sql.MAX), json(c.availability));
    req.input('documentsJson', sql.NVarChar(sql.MAX), json(c.documents));

    req.input('ratingAverage', sql.Decimal(3, 1), c.rating?.average ?? 0);
    req.input('ratingCount', sql.Int, c.rating?.count ?? 0);
    req.input('totalTrips', sql.Int, c.totalTrips ?? 0);
    req.input('createdAt', sql.DateTime2, date(c.createdAt));
    req.input('updatedAt', sql.DateTime2, date(c.updatedAt));

    await req.query(`
      INSERT INTO dbo.Cars (
        id, ownerId, brand, model, year, licensePlate, color, seats,
        carType, transmission, fuel,
        pricePerDay, pricePerHour,
        isSelfDrive, isWithDriver, isTripSupport,
        pricePerDayWithDriver, pricePerHourWithDriver,
        driverFeePerDay, pricePerHalfMonth, pricePerMonth, priceWeekend,
        deposit, outOfProvinceFee, inProvinceFee, mileage,
        description, status, approvalStatus, operationalStatus,
        approvedAt, rejectedAt, commissionPercentage, rejectionReason,
        addressId, imagesJson, featuresJson, locationJson, availabilityJson, documentsJson,
        ratingAverage, ratingCount, totalTrips,
        createdAt, updatedAt
      )
      VALUES (
        @id, @ownerId, @brand, @model, @year, @licensePlate, @color, @seats,
        @carType, @transmission, @fuel,
        @pricePerDay, @pricePerHour,
        @isSelfDrive, @isWithDriver, @isTripSupport,
        @pricePerDayWithDriver, @pricePerHourWithDriver,
        @driverFeePerDay, @pricePerHalfMonth, @pricePerMonth, @priceWeekend,
        @deposit, @outOfProvinceFee, @inProvinceFee, @mileage,
        @description, @status, @approvalStatus, @operationalStatus,
        @approvedAt, @rejectedAt, @commissionPercentage, @rejectionReason,
        @addressId, @imagesJson, @featuresJson, @locationJson, @availabilityJson, @documentsJson,
        @ratingAverage, @ratingCount, @totalTrips,
        @createdAt, @updatedAt
      )
    `);
  }
  log(`[Cars] inserted=${cars.length}`);
}

async function insertBookings(pool, existingUserIds) {
  const bookings = await Booking.find({}).lean();
  log(`[Bookings] ${bookings.length}`);

  for (const b of bookings) {
    const renterId = oid(b.renter);
    const ownerId = oid(b.owner);
    if (!renterId || !existingUserIds.has(renterId)) {
      throw new Error(`Booking renterId missing after placeholder step: renterId=${renterId} bookingId=${oid(b._id)}`);
    }
    if (!ownerId || !existingUserIds.has(ownerId)) {
      throw new Error(`Booking ownerId missing after placeholder step: ownerId=${ownerId} bookingId=${oid(b._id)}`);
    }

    const req = pool.request();
    req.input('id', sql.VarChar(24), oid(b._id));
    req.input('carId', sql.VarChar(24), oid(b.car));
    req.input('renterId', sql.VarChar(24), renterId);
    req.input('ownerId', sql.VarChar(24), ownerId);
    req.input('bookedById', sql.VarChar(24), oid(b.bookedBy));
    req.input('driverId', sql.VarChar(24), oid(b.driver));
    req.input('mode', sql.VarChar(20), b.mode ?? 'daily');
    req.input('rentalType', sql.VarChar(20), b.rentalType ?? 'self_drive');
    req.input('contractId', sql.NVarChar(100), b.contractId ?? null);
    req.input('contractFile', sql.NVarChar(500), b.contractFile ?? null);
    req.input('startDate', sql.DateTime2, date(b.startDate));
    req.input('endDate', sql.DateTime2, date(b.endDate));
    req.input('pickupTime', sql.VarChar(5), b.pickupTime ?? '00:00');
    req.input('returnTime', sql.VarChar(5), b.returnTime ?? '00:00');
    req.input('pickupLocation', sql.NVarChar(500), b.pickupLocation ?? '');
    req.input('returnLocation', sql.NVarChar(500), b.returnLocation ?? '');
    req.input('pickupAddressId', sql.VarChar(24), oid(b.pickupAddress));
    req.input('returnAddressId', sql.VarChar(24), oid(b.returnAddress));
    req.input('status', sql.VarChar(20), b.status ?? 'pending');
    req.input('extraFee', sql.Decimal(18, 2), b.extraFee ?? 0);

    req.input('durationJson', sql.NVarChar(sql.MAX), json(b.duration));
    req.input('pricingJson', sql.NVarChar(sql.MAX), json(b.pricing));
    req.input('tripJson', sql.NVarChar(sql.MAX), json(b.trip));
    req.input('paymentJson', sql.NVarChar(sql.MAX), json(b.payment));
    req.input('settlementJson', sql.NVarChar(sql.MAX), json(b.settlement));
    req.input('documentsJson', sql.NVarChar(sql.MAX), json(b.documents));
    req.input('cancellationJson', sql.NVarChar(sql.MAX), json(b.cancellation));
    req.input('longTermAgreementsJson', sql.NVarChar(sql.MAX), json(b.longTermAgreements));
    req.input('contactInfoJson', sql.NVarChar(sql.MAX), json(b.contactInfo));
    req.input('optionsJson', sql.NVarChar(sql.MAX), json(b.options));
    req.input('notes', sql.NVarChar(500), b.notes ?? null);

    req.input('bookingType', sql.VarChar(20), b.bookingType ?? 'immediate');
    req.input('prebookJson', sql.NVarChar(sql.MAX), json(b.prebook));

    req.input('createdAt', sql.DateTime2, date(b.createdAt));
    req.input('updatedAt', sql.DateTime2, date(b.updatedAt));

    await req.query(`
      INSERT INTO dbo.Bookings (
        id, carId, renterId, ownerId, bookedById, driverId,
        mode, rentalType, contractId, contractFile,
        startDate, endDate, pickupTime, returnTime,
        pickupLocation, returnLocation, pickupAddressId, returnAddressId,
        status, extraFee,
        durationJson, pricingJson, tripJson, paymentJson, settlementJson,
        documentsJson, cancellationJson, longTermAgreementsJson, contactInfoJson,
        optionsJson, notes,
        bookingType, prebookJson,
        createdAt, updatedAt
      )
      VALUES (
        @id, @carId, @renterId, @ownerId, @bookedById, @driverId,
        @mode, @rentalType, @contractId, @contractFile,
        @startDate, @endDate, @pickupTime, @returnTime,
        @pickupLocation, @returnLocation, @pickupAddressId, @returnAddressId,
        @status, @extraFee,
        @durationJson, @pricingJson, @tripJson, @paymentJson, @settlementJson,
        @documentsJson, @cancellationJson, @longTermAgreementsJson, @contactInfoJson,
        @optionsJson, @notes,
        @bookingType, @prebookJson,
        @createdAt, @updatedAt
      )
    `);
  }
  log(`[Bookings] inserted=${bookings.length}`);
}

async function insertReviews(pool, existingBookingIds) {
  const reviews = await Review.find({}).lean();
  log(`[Reviews] ${reviews.length}`);

  for (const r of reviews) {
    const bookingId = oid(r.booking);
    if (!bookingId || !existingBookingIds.has(bookingId)) {
      throw new Error(`Review bookingId missing in SQL: bookingId=${bookingId} reviewId=${oid(r._id)}`);
    }

    const req = pool.request();
    req.input('id', sql.VarChar(24), oid(r._id));
    req.input('bookingId', sql.VarChar(24), bookingId);
    req.input('reviewerId', sql.VarChar(24), oid(r.reviewer));
    req.input('revieweeId', sql.VarChar(24), oid(r.reviewee));
    req.input('carId', sql.VarChar(24), oid(r.car));
    req.input('reviewType', sql.VarChar(30), r.type ?? '');
    req.input('ratingJson', sql.NVarChar(sql.MAX), json(r.rating ?? {}));
    req.input('comment', sql.NVarChar(1000), r.comment ?? '');
    req.input('imagesJson', sql.NVarChar(sql.MAX), json(r.images));
    req.input('responseJson', sql.NVarChar(sql.MAX), json(r.response));
    req.input('flagsJson', sql.NVarChar(sql.MAX), json(r.flags));
    req.input('isPublic', sql.Bit, r.isPublic !== false);
    req.input('isVerified', sql.Bit, !!r.isVerified);
    req.input('createdAt', sql.DateTime2, date(r.createdAt));
    req.input('updatedAt', sql.DateTime2, date(r.updatedAt));

    await req.query(`
      INSERT INTO dbo.Reviews (
        id, bookingId, reviewerId, revieweeId, carId, reviewType,
        ratingJson, comment, imagesJson, responseJson, flagsJson,
        isPublic, isVerified,
        createdAt, updatedAt
      )
      VALUES (
        @id, @bookingId, @reviewerId, @revieweeId, @carId, @reviewType,
        @ratingJson, @comment, @imagesJson, @responseJson, @flagsJson,
        @isPublic, @isVerified,
        @createdAt, @updatedAt
      )
    `);
  }
  log(`[Reviews] inserted=${reviews.length}`);
}

async function insertContracts(pool, existingBookingIds) {
  const contracts = await Contract.find({}).lean();
  log(`[Contracts] ${contracts.length}`);

  for (const c of contracts) {
    const bookingId = oid(c.booking);
    if (!bookingId || !existingBookingIds.has(bookingId)) {
      throw new Error(`Contract bookingId missing in SQL: bookingId=${bookingId} contractId=${oid(c._id)}`);
    }

    const req = pool.request();
    req.input('id', sql.VarChar(24), oid(c._id));
    req.input('bookingId', sql.VarChar(24), bookingId);
    req.input('renterId', sql.VarChar(24), oid(c.renter));
    req.input('ownerId', sql.VarChar(24), oid(c.owner));
    req.input('carId', sql.VarChar(24), oid(c.car));
    req.input('driverId', sql.VarChar(24), oid(c.driver));
    req.input('contractCode', sql.NVarChar(100), c.contractId ?? null);
    req.input('content', sql.NVarChar(sql.MAX), c.content ?? null);
    req.input('fileName', sql.NVarChar(255), c.fileName ?? null);
    req.input('renterSignatureJson', sql.NVarChar(sql.MAX), json(c.renterSignature));
    req.input('ownerSignatureJson', sql.NVarChar(sql.MAX), json(c.ownerSignature));
    req.input('status', sql.VarChar(20), c.status ?? 'pending');
    req.input('createdAt', sql.DateTime2, date(c.createdAt));
    req.input('updatedAt', sql.DateTime2, date(c.updatedAt));

    await req.query(`
      INSERT INTO dbo.Contracts (
        id, bookingId, renterId, ownerId, carId, driverId,
        contractCode, content, fileName,
        renterSignatureJson, ownerSignatureJson,
        status, createdAt, updatedAt
      )
      VALUES (
        @id, @bookingId, @renterId, @ownerId, @carId, @driverId,
        @contractCode, @content, @fileName,
        @renterSignatureJson, @ownerSignatureJson,
        @status, @createdAt, @updatedAt
      )
    `);
  }
  log(`[Contracts] inserted=${contracts.length}`);
}

async function insertNotifications(pool) {
  const items = await Notification.find({}).lean();
  log(`[Notifications] ${items.length}`);

  for (const n of items) {
    const req = pool.request();
    req.input('id', sql.VarChar(24), oid(n._id));
    req.input('recipientId', sql.VarChar(24), oid(n.recipient));
    req.input('recipientType', sql.VarChar(20), n.recipientType ?? 'user');
    req.input('title', sql.NVarChar(255), n.title ?? '');
    req.input('message', sql.NVarChar(sql.MAX), n.message ?? '');
    req.input('notificationType', sql.VarChar(20), n.type ?? 'system');
    req.input('isRead', sql.Bit, !!n.read);
    req.input('metadataJson', sql.NVarChar(sql.MAX), json(n.metadata));
    req.input('createdAt', sql.DateTime2, date(n.createdAt));

    await req.query(`
      INSERT INTO dbo.Notifications (
        id, recipientId, recipientType, title, message,
        notificationType, isRead, metadataJson, createdAt
      )
      VALUES (
        @id, @recipientId, @recipientType, @title, @message,
        @notificationType, @isRead, @metadataJson, @createdAt
      )
    `);
  }
}

async function insertPayouts(pool) {
  const items = await Payout.find({}).lean();
  log(`[Payouts] ${items.length}`);

  for (const p of items) {
    const req = pool.request();
    req.input('id', sql.VarChar(24), oid(p._id));
    req.input('payeeId', sql.VarChar(24), oid(p.payee));
    req.input('role', sql.VarChar(20), p.role ?? '');
    req.input('amount', sql.Decimal(18, 2), p.amount ?? 0);
    req.input('status', sql.VarChar(20), p.status ?? 'completed');
    req.input('transactionId', sql.NVarChar(100), p.transactionId ?? null);
    req.input('notes', sql.NVarChar(500), p.notes ?? null);
    req.input('bankAccountJson', sql.NVarChar(sql.MAX), json(p.bankAccount));
    req.input('processedById', sql.VarChar(24), oid(p.processedBy));
    req.input('createdAt', sql.DateTime2, date(p.createdAt));
    req.input('updatedAt', sql.DateTime2, date(p.updatedAt));

    await req.query(`
      INSERT INTO dbo.Payouts (
        id, payeeId, role, amount, status,
        transactionId, notes, bankAccountJson, processedById,
        createdAt, updatedAt
      )
      VALUES (
        @id, @payeeId, @role, @amount, @status,
        @transactionId, @notes, @bankAccountJson, @processedById,
        @createdAt, @updatedAt
      )
    `);
  }
}

async function insertTripConfigs(pool) {
  const items = await TripConfig.find({}).lean();
  log(`[TripConfigs] ${items.length}`);

  for (const t of items) {
    const req = pool.request();
    req.input('id', sql.VarChar(24), oid(t._id));
    req.input('source', sql.NVarChar(255), t.source ?? '');
    req.input('destination', sql.NVarChar(255), t.destination ?? '');
    req.input('fixedPrice', sql.Decimal(18, 2), t.fixedPrice ?? 0);
    req.input('roundTripPrice', sql.Decimal(18, 2), t.roundTripPrice ?? 0);
    req.input('description', sql.NVarChar(1000), t.description ?? null);
    req.input('applicableCarsJson', sql.NVarChar(sql.MAX), json(t.applicableCars?.map(oid)));
    req.input('schedulesJson', sql.NVarChar(sql.MAX), json(t.schedules));
    req.input('stopPointsJson', sql.NVarChar(sql.MAX), json(t.stopPoints));
    req.input('isActive', sql.Bit, t.isActive !== false);
    req.input('createdAt', sql.DateTime2, date(t.createdAt));
    req.input('updatedAt', sql.DateTime2, date(t.updatedAt));

    await req.query(`
      INSERT INTO dbo.TripConfigs (
        id, source, destination, fixedPrice, roundTripPrice, description,
        applicableCarsJson, schedulesJson, stopPointsJson, isActive,
        createdAt, updatedAt
      )
      VALUES (
        @id, @source, @destination, @fixedPrice, @roundTripPrice, @description,
        @applicableCarsJson, @schedulesJson, @stopPointsJson, @isActive,
        @createdAt, @updatedAt
      )
    `);
  }
}

async function insertTripSettings(pool) {
  const items = await TripSettings.find({}).lean();
  log(`[TripSettings] ${items.length}`);

  for (const s of items) {
    const req = pool.request();
    req.input('id', sql.VarChar(24), oid(s._id));
    req.input('settingsKey', sql.NVarChar(100), s.key ?? 'global_trip_settings');
    // tiers is nested. also convert applicableCars ObjectIds to string inside each tier.
    const tiers = s.tiers ?? {};
    const tiersNormalized = {
      short: tiers.short
        ? { ...tiers.short, applicableCars: (tiers.short.applicableCars ?? []).map(oid) }
        : undefined,
      long: tiers.long
        ? { ...tiers.long, applicableCars: (tiers.long.applicableCars ?? []).map(oid) }
        : undefined,
      business: tiers.business
        ? { ...tiers.business, applicableCars: (tiers.business.applicableCars ?? []).map(oid) }
        : undefined,
    };
    req.input('tiersJson', sql.NVarChar(sql.MAX), json(tiersNormalized));
    req.input('createdAt', sql.DateTime2, date(s.createdAt));
    req.input('updatedAt', sql.DateTime2, date(s.updatedAt));

    await req.query(`
      INSERT INTO dbo.TripSettings (id, settingsKey, tiersJson, createdAt, updatedAt)
      VALUES (@id, @settingsKey, @tiersJson, @createdAt, @updatedAt)
    `);
  }
}

async function collectReferencedUserIds() {
  const ids = new Set();

  const add = (v) => {
    const s = oid(v);
    if (s) ids.add(s);
  };

  // Addresses
  const addresses = await Address.find({}, { owner: 1 }).lean();
  for (const a of addresses) add(a.owner);

  // Cars
  const cars = await Car.find({}, { owner: 1 }).lean();
  for (const c of cars) add(c.owner);

  // Bookings
  const bookings = await Booking.find(
    {},
    { renter: 1, owner: 1, bookedBy: 1, driver: 1, cancellation: 1 }
  ).lean();
  for (const b of bookings) {
    add(b.renter);
    add(b.owner);
    add(b.bookedBy);
    add(b.driver);
    add(b.cancellation?.cancelledBy);
  }

  // Reviews
  const reviews = await Review.find({}, { reviewer: 1, reviewee: 1, response: 1, flags: 1 }).lean();
  for (const r of reviews) {
    add(r.reviewer);
    add(r.reviewee);
    add(r.response?.respondedBy);
    add(r.flags?.reportedBy);
  }

  // Contracts
  const contracts = await Contract.find({}, { renter: 1, owner: 1, driver: 1 }).lean();
  for (const c of contracts) {
    add(c.renter);
    add(c.owner);
    add(c.driver);
  }

  // Notifications
  const notifs = await Notification.find({}, { recipient: 1 }).lean();
  for (const n of notifs) add(n.recipient);

  // Payouts
  const payouts = await Payout.find({}, { payee: 1, processedBy: 1 }).lean();
  for (const p of payouts) {
    add(p.payee);
    add(p.processedBy);
  }

  return ids;
}

async function main() {
  const wipe = process.argv.includes('--wipe');

  log('Connecting Mongo...');
  await connectMongo();
  log('Connecting SQL Server...');
  const pool = await getSqlPool();

  if (wipe) {
    log('Wiping SQL tables...');
    await truncateTables(pool);
  }

  // IMPORTANT: Order matters (FKs)
  await insertUsers(pool);
  const referencedUserIds = await collectReferencedUserIds();
  const currentUserIds = await fetchExistingUserIds(pool);
  const missingUserIds = new Set([...referencedUserIds].filter((id) => !currentUserIds.has(id)));
  log(`[Users] referenced=${referencedUserIds.size} current=${currentUserIds.size} missing=${missingUserIds.size}`);
  await ensurePlaceholderUsers(pool, missingUserIds);

  const existingUserIds = await fetchExistingUserIds(pool);
  await insertAddresses(pool, existingUserIds);
  await insertCars(pool, existingUserIds);
  await insertBookings(pool, existingUserIds);
  let existingBookingIds = await fetchExistingBookingIds(pool);
  const referencedBookingIds = await collectReferencedBookingIds();
  const missingBookingIds = new Set([...referencedBookingIds].filter((id) => !existingBookingIds.has(id)));
  if (missingBookingIds.size > 0) {
    const fallbackUserId = [...existingUserIds][0];
    log(`[Bookings] referenced=${referencedBookingIds.size} current=${existingBookingIds.size} missing=${missingBookingIds.size}`);
    await ensurePlaceholderBookings(pool, missingBookingIds, fallbackUserId);
    existingBookingIds = await fetchExistingBookingIds(pool);
  }
  await insertReviews(pool, existingBookingIds);
  await insertContracts(pool, existingBookingIds);
  await insertNotifications(pool);
  await insertPayouts(pool);
  await insertTripConfigs(pool);
  await insertTripSettings(pool);

  log('Done.');
  await mongoose.disconnect();
  await pool.close();
}

main().catch(async (err) => {
  log('ERROR', err?.message || String(err));
  try {
    fs.appendFileSync(LOG_PATH, `${err?.stack || ''}\n`, 'utf8');
  } catch {}
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});

