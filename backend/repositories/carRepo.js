const { getSqlPool, sql } = require('../db/sqlServer');

function parseJson(value) {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
}

function toCarRow(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    owner: row.ownerId,
    brand: row.brand,
    model: row.model,
    year: row.year,
    licensePlate: row.licensePlate,
    color: row.color,
    seats: row.seats,
    type: row.carType,
    transmission: row.transmission,
    fuel: row.fuel,
    pricePerDay: Number(row.pricePerDay ?? 0),
    pricePerHour: Number(row.pricePerHour ?? 0),
    isSelfDrive: !!row.isSelfDrive,
    isWithDriver: !!row.isWithDriver,
    isTripSupport: !!row.isTripSupport,
    pricePerDayWithDriver: Number(row.pricePerDayWithDriver ?? 0),
    pricePerHourWithDriver: Number(row.pricePerHourWithDriver ?? 0),
    driverFeePerDay: Number(row.driverFeePerDay ?? 0),
    pricePerHalfMonth: Number(row.pricePerHalfMonth ?? 0),
    pricePerMonth: Number(row.pricePerMonth ?? 0),
    priceWeekend: Number(row.priceWeekend ?? 0),
    deposit: Number(row.deposit ?? 0),
    outOfProvinceFee: Number(row.outOfProvinceFee ?? 0),
    inProvinceFee: Number(row.inProvinceFee ?? 0),
    mileage: row.mileage ?? 0,
    description: row.description,
    status: row.status,
    approvalStatus: row.approvalStatus,
    operationalStatus: row.operationalStatus,
    approvedAt: row.approvedAt,
    rejectedAt: row.rejectedAt,
    commissionPercentage: row.commissionPercentage ?? 15,
    rejectionReason: row.rejectionReason,
    addressId: row.addressId,
    images: parseJson(row.imagesJson) || [],
    features: parseJson(row.featuresJson) || [],
    location: parseJson(row.locationJson),
    availability: parseJson(row.availabilityJson),
    documents: parseJson(row.documentsJson),
    rating: { average: Number(row.ratingAverage ?? 0), count: Number(row.ratingCount ?? 0) },
    totalTrips: row.totalTrips ?? 0,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// Populate owner data by joining Users table
async function populateOwner(cars) {
  if (!cars || cars.length === 0) return cars;
  const pool = await getSqlPool();
  const ownerIds = [...new Set(cars.map(c => c.owner).filter(Boolean))];
  if (ownerIds.length === 0) return cars;
  
  const placeholders = ownerIds.map((_, i) => `@oid${i}`).join(',');
  const req = pool.request();
  ownerIds.forEach((id, i) => req.input(`oid${i}`, sql.VarChar(24), id));
  
  const result = await req.query(`SELECT id, fullName, email, phone FROM dbo.Users WHERE id IN (${placeholders})`);
  const ownerMap = {};
  for (const row of result.recordset) {
    ownerMap[row.id] = {
      _id: row.id,
      id: row.id,
      fullName: row.fullName,
      email: row.email,
      phone: row.phone,
    };
  }
  
  return cars.map(c => ({ ...c, owner: ownerMap[c.owner] || c.owner }));
}

// Populate address data
async function populateAddress(cars) {
  if (!cars || cars.length === 0) return cars;
  const pool = await getSqlPool();
  const addressIds = [...new Set(cars.map(c => c.addressId).filter(Boolean))];
  if (addressIds.length === 0) return cars;
  
  const placeholders = addressIds.map((_, i) => `@aid${i}`).join(',');
  const req = pool.request();
  addressIds.forEach((id, i) => req.input(`aid${i}`, sql.VarChar(24), id));
  
  const result = await req.query(`SELECT * FROM dbo.Addresses WHERE id IN (${placeholders})`);
  const addrMap = {};
  for (const row of result.recordset) {
    addrMap[row.id] = {
      _id: row.id, id: row.id,
      street: row.street,
      fullAddress: row.fullAddress,
      ward: parseJson(row.wardJson),
      province: parseJson(row.provinceJson),
    };
  }
  
  return cars.map(c => ({ ...c, addressId: addrMap[c.addressId] || c.addressId }));
}

async function getAll({ filter = {}, skip = 0, limit = 12, sort = 'createdAt DESC', populate = [] } = {}) {
  const pool = await getSqlPool();
  const req = pool.request();
  
  let where = '1=1';
  
  if (filter.city) {
    // Location is stored as JSON text; use LIKE as a pragmatic filter.
    req.input('cityLike', sql.NVarChar(200), `%${filter.city}%`);
    where += ' AND locationJson LIKE @cityLike';
  }
  if (filter.brand) {
    req.input('brand', sql.NVarChar(50), filter.brand);
    where += ' AND brand = @brand';
  }
  if (filter.type) {
    req.input('carType', sql.NVarChar(50), filter.type);
    where += ' AND carType = @carType';
  }
  if (filter.status) {
    if (filter.status === 'approved') {
      where += " AND (status = 'approved' OR approvalStatus = 'approved')";
    } else {
      req.input('status', sql.VarChar(20), filter.status);
      where += ' AND status = @status';
    }
  }
  if (filter.approvalStatus) {
    req.input('approvalStatus', sql.VarChar(20), filter.approvalStatus);
    where += ' AND approvalStatus = @approvalStatus';
  }
  if (filter.ownerId) {
    req.input('ownerId', sql.VarChar(24), filter.ownerId);
    where += ' AND ownerId = @ownerId';
  }
  if (filter.search) {
    req.input('search', sql.NVarChar(200), `%${filter.search}%`);
    where += ' AND (brand LIKE @search OR model LIKE @search OR licensePlate LIKE @search)';
  }
  if (filter.minPrice) {
    req.input('minPrice', sql.Decimal(18, 2), parseFloat(filter.minPrice));
    where += ' AND pricePerDay >= @minPrice';
  }
  if (filter.maxPrice) {
    req.input('maxPrice', sql.Decimal(18, 2), parseFloat(filter.maxPrice));
    where += ' AND pricePerDay <= @maxPrice';
  }
  if (filter.seats) {
    req.input('seats', sql.Int, parseInt(filter.seats, 10));
    where += ' AND seats = @seats';
  }
  if (filter.transmission) {
    req.input('transmission', sql.VarChar(20), filter.transmission);
    where += ' AND transmission = @transmission';
  }
  if (filter.fuel) {
    req.input('fuel', sql.VarChar(20), filter.fuel);
    where += ' AND fuel = @fuel';
  }
  if (filter.operationalStatus) {
    req.input('operationalStatus', sql.VarChar(20), filter.operationalStatus);
    where += ' AND operationalStatus = @operationalStatus';
  }
  
  req.input('skip', sql.Int, skip);
  req.input('limit', sql.Int, limit);
  
  const result = await req.query(`
    SELECT * FROM dbo.Cars WHERE ${where} ORDER BY ${sort}
    OFFSET @skip ROWS FETCH NEXT @limit ROWS ONLY
  `);
  
  let cars = result.recordset.map(toCarRow);
  
  if (populate.includes('owner')) cars = await populateOwner(cars);
  if (populate.includes('address')) cars = await populateAddress(cars);
  
  return cars;
}

async function getById(id, populate = []) {
  const pool = await getSqlPool();
  const result = await pool
    .request()
    .input('id', sql.VarChar(24), String(id))
    .query('SELECT TOP 1 * FROM dbo.Cars WHERE id = @id');
  
  let car = toCarRow(result.recordset?.[0]);
  if (!car) return null;
  
  let cars = [car];
  if (populate.includes('owner')) cars = await populateOwner(cars);
  if (populate.includes('address')) cars = await populateAddress(cars);
  
  return cars[0];
}

async function countDocuments(filter = {}) {
  const pool = await getSqlPool();
  const req = pool.request();
  
  let where = '1=1';
  if (filter.city) {
    req.input('cityLike', sql.NVarChar(200), `%${filter.city}%`);
    where += ' AND locationJson LIKE @cityLike';
  }
  if (filter.status) {
    if (filter.status === 'approved') {
      where += " AND (status = 'approved' OR approvalStatus = 'approved')";
    } else {
      req.input('status', sql.VarChar(20), filter.status);
      where += ' AND status = @status';
    }
  }
  if (filter.approvalStatus) {
    if (filter.approvalStatus.$ne) {
      req.input('asNe', sql.VarChar(20), filter.approvalStatus.$ne);
      where += ' AND (approvalStatus IS NULL OR approvalStatus <> @asNe)';
    } else {
      req.input('approvalStatus', sql.VarChar(20), filter.approvalStatus);
      where += ' AND approvalStatus = @approvalStatus';
    }
  }
  if (filter.minPrice) {
    req.input('minPrice', sql.Decimal(18, 2), parseFloat(filter.minPrice));
    where += ' AND pricePerDay >= @minPrice';
  }
  if (filter.maxPrice) {
    req.input('maxPrice', sql.Decimal(18, 2), parseFloat(filter.maxPrice));
    where += ' AND pricePerDay <= @maxPrice';
  }
  if (filter.seats) {
    req.input('seats', sql.Int, parseInt(filter.seats, 10));
    where += ' AND seats = @seats';
  }
  if (filter.transmission) {
    req.input('transmission', sql.VarChar(20), filter.transmission);
    where += ' AND transmission = @transmission';
  }
  if (filter.fuel) {
    req.input('fuel', sql.VarChar(20), filter.fuel);
    where += ' AND fuel = @fuel';
  }
  if (filter.operationalStatus) {
    req.input('operationalStatus', sql.VarChar(20), filter.operationalStatus);
    where += ' AND operationalStatus = @operationalStatus';
  }
  if (filter.ownerId) {
    req.input('ownerId', sql.VarChar(24), filter.ownerId);
    where += ' AND ownerId = @ownerId';
  }
  if (filter.search) {
    req.input('search', sql.NVarChar(200), `%${filter.search}%`);
    where += ' AND (brand LIKE @search OR model LIKE @search OR licensePlate LIKE @search)';
  }
  
  const result = await req.query(`SELECT COUNT(*) as cnt FROM dbo.Cars WHERE ${where}`);
  return result.recordset[0].cnt;
}

async function createCar(data) {
  const pool = await getSqlPool();
  const id = data.id || require('crypto').randomBytes(12).toString('hex');
  const now = new Date();
  
  await pool.request()
    .input('id', sql.VarChar(24), id)
    .input('ownerId', sql.VarChar(24), data.ownerId || data.owner)
    .input('brand', sql.NVarChar(50), data.brand || '')
    .input('model', sql.NVarChar(50), data.model || '')
    .input('year', sql.Int, data.year || 0)
    .input('licensePlate', sql.VarChar(30), data.licensePlate || '')
    .input('color', sql.NVarChar(30), data.color || 'Đen')
    .input('seats', sql.Int, data.seats || 4)
    .input('carType', sql.NVarChar(50), data.type || '')
    .input('transmission', sql.VarChar(20), data.transmission || '')
    .input('fuel', sql.VarChar(20), data.fuel || '')
    .input('pricePerDay', sql.Decimal(18, 2), data.pricePerDay || 0)
    .input('pricePerHour', sql.Decimal(18, 2), data.pricePerHour || 0)
    .input('isSelfDrive', sql.Bit, data.isSelfDrive !== false ? 1 : 0)
    .input('isWithDriver', sql.Bit, data.isWithDriver ? 1 : 0)
    .input('isTripSupport', sql.Bit, data.isTripSupport ? 1 : 0)
    .input('pricePerDayWithDriver', sql.Decimal(18, 2), data.pricePerDayWithDriver || 0)
    .input('pricePerHourWithDriver', sql.Decimal(18, 2), data.pricePerHourWithDriver || 0)
    .input('deposit', sql.Decimal(18, 2), data.deposit || 0)
    .input('mileage', sql.Int, data.mileage || 0)
    .input('description', sql.NVarChar(1000), data.description || null)
    .input('status', sql.VarChar(20), data.status || 'pending')
    .input('approvalStatus', sql.VarChar(20), data.approvalStatus || 'pending')
    .input('operationalStatus', sql.VarChar(20), data.operationalStatus || 'inactive')
    .input('commissionPercentage', sql.Int, data.commissionPercentage || 15)
    .input('driverFeePerDay', sql.Decimal(18, 2), data.driverFeePerDay || 0)
    .input('imagesJson', sql.NVarChar(sql.MAX), JSON.stringify(data.images || []))
    .input('featuresJson', sql.NVarChar(sql.MAX), JSON.stringify(data.features || []))
    .input('createdAt', sql.DateTime2, now)
    .input('updatedAt', sql.DateTime2, now)
    .query(`
      INSERT INTO dbo.Cars (
        id, ownerId, brand, model, year, licensePlate, color, seats,
        carType, transmission, fuel, pricePerDay, pricePerHour,
        isSelfDrive, isWithDriver, isTripSupport,
        pricePerDayWithDriver, pricePerHourWithDriver, driverFeePerDay,
        deposit, mileage, description, status, approvalStatus, operationalStatus,
        commissionPercentage, imagesJson, featuresJson, createdAt, updatedAt
      ) VALUES (
        @id, @ownerId, @brand, @model, @year, @licensePlate, @color, @seats,
        @carType, @transmission, @fuel, @pricePerDay, @pricePerHour,
        @isSelfDrive, @isWithDriver, @isTripSupport,
        @pricePerDayWithDriver, @pricePerHourWithDriver, @driverFeePerDay,
        @deposit, @mileage, @description, @status, @approvalStatus, @operationalStatus,
        @commissionPercentage, @imagesJson, @featuresJson, @createdAt, @updatedAt
      )
    `);
  
  return getById(id, ['owner']);
}

async function updateCar(id, updates) {
  const pool = await getSqlPool();
  const req = pool.request();
  req.input('id', sql.VarChar(24), String(id));
  
  const setClauses = [];
  const fieldMap = {
    brand: [sql.NVarChar(50), 'brand'],
    model: [sql.NVarChar(50), 'model'],
    year: [sql.Int, 'year'],
    licensePlate: [sql.VarChar(30), 'licensePlate'],
    color: [sql.NVarChar(30), 'color'],
    seats: [sql.Int, 'seats'],
    type: [sql.NVarChar(50), 'carType'],
    transmission: [sql.VarChar(20), 'transmission'],
    fuel: [sql.VarChar(20), 'fuel'],
    pricePerDay: [sql.Decimal(18, 2), 'pricePerDay'],
    pricePerHour: [sql.Decimal(18, 2), 'pricePerHour'],
    pricePerDayWithDriver: [sql.Decimal(18, 2), 'pricePerDayWithDriver'],
    pricePerHourWithDriver: [sql.Decimal(18, 2), 'pricePerHourWithDriver'],
    priceWeekend: [sql.Decimal(18, 2), 'priceWeekend'],
    deposit: [sql.Decimal(18, 2), 'deposit'],
    mileage: [sql.Int, 'mileage'],
    description: [sql.NVarChar(1000), 'description'],
    status: [sql.VarChar(20), 'status'],
    approvalStatus: [sql.VarChar(20), 'approvalStatus'],
    operationalStatus: [sql.VarChar(20), 'operationalStatus'],
    commissionPercentage: [sql.Int, 'commissionPercentage'],
    driverFeePerDay: [sql.Decimal(18, 2), 'driverFeePerDay'],
    rejectionReason: [sql.NVarChar(500), 'rejectionReason'],
    ratingAverage: [sql.Decimal(3, 2), 'ratingAverage'],
    ratingCount: [sql.Int, 'ratingCount'],
  };
  
  for (const [key, [sqlType, col]] of Object.entries(fieldMap)) {
    if (updates[key] !== undefined) {
      req.input(col, sqlType, updates[key]);
      setClauses.push(`${col}=@${col}`);
    }
  }
  
  // Date fields
  if (updates.approvedAt !== undefined) { req.input('approvedAt', sql.DateTime2, updates.approvedAt); setClauses.push('approvedAt=@approvedAt'); }
  if (updates.rejectedAt !== undefined) { req.input('rejectedAt', sql.DateTime2, updates.rejectedAt); setClauses.push('rejectedAt=@rejectedAt'); }
  
  // JSON fields
  if (updates.images !== undefined) { req.input('imagesJson', sql.NVarChar(sql.MAX), JSON.stringify(updates.images)); setClauses.push('imagesJson=@imagesJson'); }
  if (updates.features !== undefined) { req.input('featuresJson', sql.NVarChar(sql.MAX), JSON.stringify(updates.features)); setClauses.push('featuresJson=@featuresJson'); }
  if (updates.availability !== undefined) { req.input('availabilityJson', sql.NVarChar(sql.MAX), JSON.stringify(updates.availability)); setClauses.push('availabilityJson=@availabilityJson'); }
  
  setClauses.push('updatedAt=SYSUTCDATETIME()');
  
  await req.query(`UPDATE dbo.Cars SET ${setClauses.join(', ')} WHERE id=@id`);
  return getById(id, ['owner']);
}

async function deleteCar(id) {
  const pool = await getSqlPool();
  const car = await getById(id);
  if (!car) return null;
  await pool.request().input('id', sql.VarChar(24), String(id)).query('DELETE FROM dbo.Cars WHERE id=@id');
  return car;
}

module.exports = {
  getAll, getById, countDocuments,
  createCar, updateCar, deleteCar,
  populateOwner, populateAddress,
};
