const { getSqlPool, sql } = require('../db/sqlServer');

function parseJson(value) {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
}

function toBookingRow(row) {
  if (!row) return null;
  return {
    _id: row.id, id: row.id,
    car: row.carId,
    renter: row.renterId,
    owner: row.ownerId,
    bookedBy: row.bookedById,
    driver: row.driverId,
    mode: row.mode,
    rentalType: row.rentalType,
    contractId: row.contractId,
    contractFile: row.contractFile,
    startDate: row.startDate,
    endDate: row.endDate,
    pickupTime: row.pickupTime,
    returnTime: row.returnTime,
    pickupLocation: row.pickupLocation,
    returnLocation: row.returnLocation,
    pickupAddress: row.pickupAddressId,
    returnAddress: row.returnAddressId,
    status: row.status,
    extraFee: Number(row.extraFee ?? 0),
    duration: parseJson(row.durationJson) || {},
    pricing: parseJson(row.pricingJson) || {},
    trip: parseJson(row.tripJson) || {},
    payment: parseJson(row.paymentJson) || {},
    settlement: parseJson(row.settlementJson) || {},
    documents: parseJson(row.documentsJson) || {},
    cancellation: parseJson(row.cancellationJson) || {},
    longTermAgreements: parseJson(row.longTermAgreementsJson) || {},
    contactInfo: parseJson(row.contactInfoJson) || {},
    options: parseJson(row.optionsJson) || {},
    notes: row.notes,
    bookingType: row.bookingType,
    prebook: parseJson(row.prebookJson) || {},
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function populateRefs(bookings, fields = ['renter', 'owner', 'car']) {
  if (!bookings || bookings.length === 0) return bookings;
  const pool = await getSqlPool();
  
  const userIds = new Set();
  const carIds = new Set();
  const addressIds = new Set();
  for (const b of bookings) {
    if (fields.includes('renter') && b.renter) userIds.add(b.renter);
    if (fields.includes('owner') && b.owner) userIds.add(b.owner);
    if (fields.includes('bookedBy') && b.bookedBy) userIds.add(b.bookedBy);
    if (fields.includes('driver') && b.driver) userIds.add(b.driver);
    if (fields.includes('car') && b.car) carIds.add(b.car);
    if (fields.includes('pickupAddress') && b.pickupAddress) addressIds.add(b.pickupAddress);
    if (fields.includes('returnAddress') && b.returnAddress) addressIds.add(b.returnAddress);
  }
  
  // Fetch users
  const userMap = {};
  if (userIds.size > 0) {
    const ids = [...userIds];
    const ph = ids.map((_, i) => `@u${i}`).join(',');
    const req = pool.request();
    ids.forEach((id, i) => req.input(`u${i}`, sql.VarChar(24), id));
    const result = await req.query(`
      SELECT u.id, u.fullName, u.email, u.phone, u.avatarJson, u.ratingAverage, u.ratingCount, 
             u.idCardJson, u.drivingLicenseJson, u.addressId, a.fullAddress as address
      FROM dbo.Users u 
      LEFT JOIN dbo.Addresses a ON u.addressId = a.id 
      WHERE u.id IN (${ph})
    `);
    for (const r of result.recordset) {
      userMap[r.id] = { 
        _id: r.id, 
        id: r.id, 
        fullName: r.fullName, 
        email: r.email, 
        phone: r.phone, 
        avatar: parseJson(r.avatarJson), 
        rating: { average: Number(r.ratingAverage ?? 0), count: Number(r.ratingCount ?? 0) },
        idCard: parseJson(r.idCardJson),
        drivingLicense: parseJson(r.drivingLicenseJson),
        addressId: r.addressId,
        address: r.address
      };
    }
  }
  
  // Fetch cars
  const carMap = {};
  if (carIds.size > 0) {
    const ids = [...carIds];
    const ph = ids.map((_, i) => `@c${i}`).join(',');
    const req = pool.request();
    ids.forEach((id, i) => req.input(`c${i}`, sql.VarChar(24), id));
    const result = await req.query(`SELECT id, brand, model, year, licensePlate, imagesJson, locationJson, pricePerDay, color, seats, fuel, transmission, ownerId FROM dbo.Cars WHERE id IN (${ph})`);
    for (const r of result.recordset) {
      carMap[r.id] = { 
        _id: r.id, 
        id: r.id, 
        brand: r.brand, 
        model: r.model, 
        year: r.year, 
        licensePlate: r.licensePlate, 
        images: parseJson(r.imagesJson), 
        location: parseJson(r.locationJson), 
        pricePerDay: Number(r.pricePerDay),
        color: r.color,
        seats: r.seats,
        fuel: r.fuel,
        transmission: r.transmission,
        owner: r.ownerId
      };
    }
  }
  
  // Fetch addresses
  const addrMap = {};
  if (addressIds.size > 0) {
    const ids = [...addressIds];
    const ph = ids.map((_, i) => `@a${i}`).join(',');
    const req = pool.request();
    ids.forEach((id, i) => req.input(`a${i}`, sql.VarChar(24), id));
    const result = await req.query(`SELECT id, fullAddress, street, wardJson, provinceJson FROM dbo.Addresses WHERE id IN (${ph})`);
    for (const r of result.recordset) {
      addrMap[r.id] = { 
        _id: r.id, 
        id: r.id, 
        fullAddress: r.fullAddress, 
        street: r.street, 
        ward: parseJson(r.wardJson), 
        province: parseJson(r.provinceJson) 
      };
    }
  }
  
  return bookings.map(b => ({
    ...b,
    renter: (fields.includes('renter') && userMap[b.renter]) || b.renter,
    owner: (fields.includes('owner') && userMap[b.owner]) || b.owner,
    bookedBy: (fields.includes('bookedBy') && userMap[b.bookedBy]) || b.bookedBy,
    driver: (fields.includes('driver') && userMap[b.driver]) || b.driver,
    car: (fields.includes('car') && carMap[b.car]) || b.car,
    pickupAddress: (fields.includes('pickupAddress') && addrMap[b.pickupAddress]) || b.pickupAddress,
    returnAddress: (fields.includes('returnAddress') && addrMap[b.returnAddress]) || b.returnAddress,
  }));
}

async function getAll({ filter = {}, skip = 0, limit = 10, sort = 'createdAt DESC', populate = [] } = {}) {
  const pool = await getSqlPool();
  const req = pool.request();
  let where = '1=1';
  
  if (filter.status) {
    if (filter.status.$in) {
      const list = filter.status.$in.map((s, i) => { req.input(`st${i}`, sql.VarChar(20), s); return `@st${i}`; }).join(',');
      where += ` AND status IN (${list})`;
    } else {
      req.input('status', sql.VarChar(20), filter.status);
      where += ' AND status = @status';
    }
  }
  if (filter.renterId) { req.input('renterId', sql.VarChar(24), filter.renterId); where += ' AND renterId = @renterId'; }
  if (filter.ownerId) { req.input('ownerId', sql.VarChar(24), filter.ownerId); where += ' AND ownerId = @ownerId'; }
  if (filter.carId) { req.input('carId', sql.VarChar(24), filter.carId); where += ' AND carId = @carId'; }
  if (filter.bookingType) { req.input('bookingType', sql.VarChar(20), filter.bookingType); where += ' AND bookingType = @bookingType'; }
  if (filter.$or) {
    const orConditions = filter.$or.map((cond, i) => {
      if (cond.renter) { req.input(`orRenter${i}`, sql.VarChar(24), cond.renter); return `renterId = @orRenter${i}`; }
      if (cond.bookedBy) { req.input(`orBookedBy${i}`, sql.VarChar(24), cond.bookedBy); return `bookedById = @orBookedBy${i}`; }
      if (cond.owner) { req.input(`orOwner${i}`, sql.VarChar(24), cond.owner); return `ownerId = @orOwner${i}`; }
      if (cond.driver) { req.input(`orDriver${i}`, sql.VarChar(24), cond.driver); return `driverId = @orDriver${i}`; }
      if (cond.car) { req.input(`orCar${i}`, sql.VarChar(24), cond.car); return `carId = @orCar${i}`; }
      return '1=0';
    }).join(' OR ');
    if (orConditions) {
      where += ` AND (${orConditions})`;
    }
  }

  if (filter.overlapStartDate && filter.overlapEndDate) {
    req.input('overlapStart', sql.DateTime2, filter.overlapStartDate);
    req.input('overlapEnd', sql.DateTime2, filter.overlapEndDate);
    where += ' AND startDate <= @overlapEnd AND endDate >= @overlapStart';
  }
  
  if (filter.createdAt) {
    if (filter.createdAt.$gte) { req.input('cGte', sql.DateTime2, filter.createdAt.$gte); where += ' AND createdAt >= @cGte'; }
    if (filter.createdAt.$lt) { req.input('cLt', sql.DateTime2, filter.createdAt.$lt); where += ' AND createdAt < @cLt'; }
    if (filter.createdAt.$lte) { req.input('cLte', sql.DateTime2, filter.createdAt.$lte); where += ' AND createdAt <= @cLte'; }
  }
  if (filter.startDate) {
    if (filter.startDate.$gt) { req.input('sdGt', sql.DateTime2, filter.startDate.$gt); where += ' AND startDate > @sdGt'; }
  }
  
  req.input('skip', sql.Int, skip);
  req.input('limit', sql.Int, limit);
  
  const listCols = `id, carId, renterId, ownerId, bookedById, driverId, mode, rentalType, 
    contractId, contractFile, startDate, endDate, pickupTime, returnTime, 
    pickupLocation, returnLocation, pickupAddressId, returnAddressId, 
    status, extraFee, pricingJson, bookingType, 
    createdAt, updatedAt, confirmedAt, cancelledAt, cancellationReason`;
  const result = await req.query(`SELECT ${listCols} FROM dbo.Bookings WHERE ${where} ORDER BY ${sort} OFFSET @skip ROWS FETCH NEXT @limit ROWS ONLY`);
  let bookings = result.recordset.map(toBookingRow);
  
  if (populate.length > 0) bookings = await populateRefs(bookings, populate);
  return bookings;
}

async function getById(id, populate = []) {
  const pool = await getSqlPool();
  const result = await pool.request().input('id', sql.VarChar(24), String(id)).query('SELECT TOP 1 * FROM dbo.Bookings WHERE id = @id');
  let booking = toBookingRow(result.recordset?.[0]);
  if (!booking) return null;
  if (populate.length > 0) {
    const arr = await populateRefs([booking], populate);
    booking = arr[0];
  }
  return booking;
}

async function countDocuments(filter = {}) {
  const pool = await getSqlPool();
  const req = pool.request();
  let where = '1=1';
  
  if (filter.status) {
    if (filter.status.$in) {
      const list = filter.status.$in.map((s, i) => { req.input(`st${i}`, sql.VarChar(20), s); return `@st${i}`; }).join(',');
      where += ` AND status IN (${list})`;
    } else {
      req.input('status', sql.VarChar(20), filter.status);
      where += ' AND status = @status';
    }
  }
  if (filter.renterId) { req.input('renterId', sql.VarChar(24), filter.renterId); where += ' AND renterId = @renterId'; }
  if (filter.ownerId) { req.input('ownerId', sql.VarChar(24), filter.ownerId); where += ' AND ownerId = @ownerId'; }
  if (filter.carId) { req.input('carId', sql.VarChar(24), filter.carId); where += ' AND carId = @carId'; }
  if (filter.$or) {
    const orConditions = filter.$or.map((cond, i) => {
      if (cond.renter) { req.input(`orRenter${i}`, sql.VarChar(24), cond.renter); return `renterId = @orRenter${i}`; }
      if (cond.bookedBy) { req.input(`orBookedBy${i}`, sql.VarChar(24), cond.bookedBy); return `bookedById = @orBookedBy${i}`; }
      return '1=0';
    }).join(' OR ');
    if (orConditions) {
      where += ` AND (${orConditions})`;
    }
  }

  if (filter.createdAt) {
    if (filter.createdAt.$gte) { req.input('cGte', sql.DateTime2, filter.createdAt.$gte); where += ' AND createdAt >= @cGte'; }
    if (filter.createdAt.$lt) { req.input('cLt', sql.DateTime2, filter.createdAt.$lt); where += ' AND createdAt < @cLt'; }
    if (filter.createdAt.$lte) { req.input('cLte', sql.DateTime2, filter.createdAt.$lte); where += ' AND createdAt <= @cLte'; }
  }
  
  const result = await req.query(`SELECT COUNT(*) as cnt FROM dbo.Bookings WHERE ${where}`);
  return result.recordset[0].cnt;
}

async function getCompletedRevenue(filter = {}) {
  const pool = await getSqlPool();
  const req = pool.request();
  let where = "status = 'completed'";
  
  if (filter.createdAt?.$gte) { req.input('cGte', sql.DateTime2, filter.createdAt.$gte); where += ' AND createdAt >= @cGte'; }
  if (filter.createdAt?.$lt) { req.input('cLt', sql.DateTime2, filter.createdAt.$lt); where += ' AND createdAt < @cLt'; }
  if (filter.createdAt?.$lte) { req.input('cLte', sql.DateTime2, filter.createdAt.$lte); where += ' AND createdAt <= @cLte'; }
  
  const result = await req.query(`SELECT ISNULL(SUM(CAST(JSON_VALUE(pricingJson, '$.totalAmount') AS DECIMAL(18,2))), 0) as total FROM dbo.Bookings WHERE ${where}`);
  return result.recordset[0].total;
}

async function getTopCarsByRevenue(startDate, topN = 5) {
  const pool = await getSqlPool();
  const result = await pool.request()
    .input('startDate', sql.DateTime2, startDate)
    .input('topN', sql.Int, topN)
    .query(`
      SELECT TOP (@topN)
        b.carId,
        SUM(CAST(JSON_VALUE(b.pricingJson, '$.totalAmount') AS DECIMAL(18,2))) as revenue,
        COUNT(*) as bookings,
        c.brand, c.model, c.licensePlate
      FROM dbo.Bookings b
      LEFT JOIN dbo.Cars c ON c.id = b.carId
      WHERE b.status = 'completed' AND b.createdAt >= @startDate
      GROUP BY b.carId, c.brand, c.model, c.licensePlate
      ORDER BY revenue DESC
    `);
  
  return result.recordset.map(r => ({
    _id: r.carId,
    brand: r.brand, model: r.model, licensePlate: r.licensePlate,
    revenue: Number(r.revenue), bookings: r.bookings,
  }));
}

async function getTopUsersBySpending(startDate, topN = 5) {
  const pool = await getSqlPool();
  const result = await pool.request()
    .input('startDate', sql.DateTime2, startDate)
    .input('topN', sql.Int, topN)
    .query(`
      SELECT TOP (@topN)
        b.renterId,
        SUM(CAST(JSON_VALUE(b.pricingJson, '$.totalAmount') AS DECIMAL(18,2))) as totalSpent,
        COUNT(*) as bookings,
        u.fullName, u.email
      FROM dbo.Bookings b
      LEFT JOIN dbo.Users u ON u.id = b.renterId
      WHERE b.status = 'completed' AND b.createdAt >= @startDate
      GROUP BY b.renterId, u.fullName, u.email
      ORDER BY totalSpent DESC
    `);
  
  return result.recordset.map(r => ({
    _id: r.renterId, fullName: r.fullName, email: r.email,
    totalSpent: Number(r.totalSpent), bookings: r.bookings,
  }));
}

async function getDistinctCarIds(filter = {}) {
  const pool = await getSqlPool();
  const req = pool.request();
  let where = '1=1';
  if (filter.status?.$in) {
    const list = filter.status.$in.map((s, i) => { req.input(`st${i}`, sql.VarChar(20), s); return `@st${i}`; }).join(',');
    where += ` AND status IN (${list})`;
  }
  const result = await req.query(`SELECT DISTINCT carId FROM dbo.Bookings WHERE ${where} AND carId IS NOT NULL`);
  return result.recordset.map(r => r.carId);
}

async function updateBooking(id, updates) {
  const pool = await getSqlPool();
  const req = pool.request();
  req.input('id', sql.VarChar(24), String(id));
  
  const setClauses = [];
  if (updates.status !== undefined) { req.input('status', sql.VarChar(20), updates.status); setClauses.push('status=@status'); }
  if (updates.confirmedAt !== undefined) { req.input('confirmedAt', sql.DateTime2, updates.confirmedAt); setClauses.push('confirmedAt=@confirmedAt'); }
  if (updates.cancelledAt !== undefined) { req.input('cancelledAt', sql.DateTime2, updates.cancelledAt); setClauses.push('cancelledAt=@cancelledAt'); }
  if (updates.cancellationReason !== undefined) { req.input('cancellationReason', sql.NVarChar(500), updates.cancellationReason); setClauses.push('cancellationReason=@cancellationReason'); }
  if (updates.driverId !== undefined) { req.input('driverId', sql.VarChar(24), updates.driverId); setClauses.push('driverId=@driverId'); }
  if (updates.pricingJson !== undefined) { req.input('pricingJson', sql.NVarChar(sql.MAX), updates.pricingJson); setClauses.push('pricingJson=@pricingJson'); }
  if (updates.paymentJson !== undefined) { req.input('paymentJson', sql.NVarChar(sql.MAX), updates.paymentJson); setClauses.push('paymentJson=@paymentJson'); }
  if (updates.settlementJson !== undefined) { req.input('settlementJson', sql.NVarChar(sql.MAX), updates.settlementJson); setClauses.push('settlementJson=@settlementJson'); }
  if (updates.cancellationJson !== undefined) { req.input('cancellationJson', sql.NVarChar(sql.MAX), updates.cancellationJson); setClauses.push('cancellationJson=@cancellationJson'); }
  if (updates.prebookJson !== undefined) { req.input('prebookJson', sql.NVarChar(sql.MAX), updates.prebookJson); setClauses.push('prebookJson=@prebookJson'); }
  if (updates.contractId !== undefined) { req.input('contractId', sql.VarChar(100), updates.contractId); setClauses.push('contractId=@contractId'); }
  if (updates.contractFile !== undefined) { req.input('contractFile', sql.NVarChar(500), updates.contractFile); setClauses.push('contractFile=@contractFile'); }
  if (updates.documentsJson !== undefined) { req.input('documentsJson', sql.NVarChar(sql.MAX), updates.documentsJson); setClauses.push('documentsJson=@documentsJson'); }
  
  if (setClauses.length === 0) return getById(id);
  setClauses.push('updatedAt=SYSUTCDATETIME()');
  await req.query(`UPDATE dbo.Bookings SET ${setClauses.join(', ')} WHERE id=@id`);
  return getById(id);
}

async function createBooking(data) {
  const pool = await getSqlPool();
  const req = pool.request();
  
  const id = data._id ? String(data._id) : (new (require('mongoose').Types.ObjectId)()).toString();
  req.input('id', sql.VarChar(24), id);
  req.input('carId', sql.VarChar(24), data.car ? String(data.car) : null);
  req.input('renterId', sql.VarChar(24), data.renter ? String(data.renter) : null);
  req.input('ownerId', sql.VarChar(24), data.owner ? String(data.owner) : null);
  req.input('bookedById', sql.VarChar(24), data.bookedBy ? String(data.bookedBy) : null);
  req.input('driverId', sql.VarChar(24), data.driver ? String(data.driver) : null);
  req.input('mode', sql.VarChar(20), data.mode || 'daily');
  req.input('rentalType', sql.VarChar(50), data.rentalType || 'self_drive');
  req.input('startDate', sql.DateTime2, new Date(data.startDate));
  req.input('endDate', sql.DateTime2, new Date(data.endDate));
  req.input('pickupTime', sql.VarChar(10), data.pickupTime || null);
  req.input('returnTime', sql.VarChar(10), data.returnTime || null);
  req.input('pickupLocation', sql.NVarChar(500), data.pickupLocation || null);
  req.input('returnLocation', sql.NVarChar(500), data.returnLocation || null);
  req.input('pickupAddressId', sql.VarChar(24), data.pickupAddress ? String(data.pickupAddress) : null);
  req.input('returnAddressId', sql.VarChar(24), data.returnAddress ? String(data.returnAddress) : null);
  req.input('status', sql.VarChar(20), data.status || 'pending');
  req.input('extraFee', sql.Decimal(18, 2), data.extraFee || 0);
  req.input('durationJson', sql.NVarChar(sql.MAX), data.duration ? JSON.stringify(data.duration) : null);
  req.input('pricingJson', sql.NVarChar(sql.MAX), data.pricing ? JSON.stringify(data.pricing) : null);
  req.input('tripJson', sql.NVarChar(sql.MAX), data.trip ? JSON.stringify(data.trip) : null);
  req.input('paymentJson', sql.NVarChar(sql.MAX), data.payment ? JSON.stringify(data.payment) : null);
  req.input('contactInfoJson', sql.NVarChar(sql.MAX), data.contactInfo ? JSON.stringify(data.contactInfo) : null);
  req.input('optionsJson', sql.NVarChar(sql.MAX), data.options ? JSON.stringify(data.options) : null);
  req.input('notes', sql.NVarChar(sql.MAX), data.notes || null);
  req.input('bookingType', sql.VarChar(20), data.bookingType || 'immediate');
  req.input('prebookJson', sql.NVarChar(sql.MAX), data.prebook ? JSON.stringify(data.prebook) : null);
  
  await req.query(`
    INSERT INTO dbo.Bookings (
      id, carId, renterId, ownerId, bookedById, driverId, mode, rentalType,
      startDate, endDate, pickupTime, returnTime, pickupLocation, returnLocation,
      pickupAddressId, returnAddressId, status, extraFee, durationJson, pricingJson,
      tripJson, paymentJson, contactInfoJson, optionsJson, notes, bookingType, prebookJson,
      createdAt, updatedAt
    ) VALUES (
      @id, @carId, @renterId, @ownerId, @bookedById, @driverId, @mode, @rentalType,
      @startDate, @endDate, @pickupTime, @returnTime, @pickupLocation, @returnLocation,
      @pickupAddressId, @returnAddressId, @status, @extraFee, @durationJson, @pricingJson,
      @tripJson, @paymentJson, @contactInfoJson, @optionsJson, @notes, @bookingType, @prebookJson,
      SYSUTCDATETIME(), SYSUTCDATETIME()
    )
  `);
  
  return getById(id);
}

async function checkAvailability(carId, startDate, endDate) {
  const pool = await getSqlPool();
  // We need to check if there is any booking for this car that overlaps with the given dates
  // Overlap condition: b.startDate <= endDate AND b.endDate >= startDate
  const result = await pool.request()
    .input('carId', sql.VarChar(24), String(carId))
    .input('startDate', sql.DateTime2, new Date(startDate))
    .input('endDate', sql.DateTime2, new Date(endDate))
    .query(`
      SELECT TOP 1 * FROM dbo.Bookings
      WHERE carId = @carId 
      AND status IN ('confirmed', 'active')
      AND startDate <= @endDate AND endDate >= @startDate
    `);
    
  if (result.recordset.length > 0) {
    return { available: false, offender: toBookingRow(result.recordset[0]) };
  }
  
  // Check pre-bookings
  const prebookResult = await pool.request()
    .input('carId', sql.VarChar(24), String(carId))
    .input('startDate', sql.DateTime2, new Date(startDate))
    .input('endDate', sql.DateTime2, new Date(endDate))
    .input('now', sql.DateTime2, new Date())
    .query(`
      SELECT TOP 1 * FROM dbo.Bookings
      WHERE carId = @carId 
      AND status = 'pending'
      AND bookingType = 'prebook'
      AND JSON_VALUE(prebookJson, '$.status') = 'holding'
      AND CAST(JSON_VALUE(prebookJson, '$.deadline') AS DATETIME2) > @now
      AND startDate <= @endDate AND endDate >= @startDate
    `);
    
  if (prebookResult.recordset.length > 0) {
    return { available: false, offender: toBookingRow(prebookResult.recordset[0]) };
  }
  
  return { available: true, offender: null };
}

async function getStatsSummary(userId) {
  const pool = await getSqlPool();
  const req = pool.request();
  req.input('userId', sql.VarChar(24), String(userId));

  // Get status counts
  const statusResult = await req.query(`
    SELECT status, COUNT(*) as count 
    FROM dbo.Bookings 
    WHERE renterId = @userId OR ownerId = @userId 
    GROUP BY status
  `);

  // Get earnings (as owner)
  const earningsResult = await req.query(`
    SELECT ISNULL(SUM(CAST(JSON_VALUE(pricingJson, '$.totalRentalFee') AS DECIMAL(18,2))), 0) as total
    FROM dbo.Bookings
    WHERE ownerId = @userId AND status = 'completed'
  `);

  // Get spent (as renter)
  const spentResult = await req.query(`
    SELECT ISNULL(SUM(CAST(JSON_VALUE(pricingJson, '$.totalAmount') AS DECIMAL(18,2))), 0) as total
    FROM dbo.Bookings
    WHERE renterId = @userId AND status = 'completed'
  `);

  return {
    statusCounts: statusResult.recordset,
    totalEarnings: Number(earningsResult.recordset[0].total),
    totalSpent: Number(spentResult.recordset[0].total)
  };
}

module.exports = {
  getAll, getById, countDocuments,
  getCompletedRevenue, getTopCarsByRevenue, getTopUsersBySpending,
  getDistinctCarIds, updateBooking, populateRefs, createBooking, checkAvailability,
  getStatsSummary,
};
