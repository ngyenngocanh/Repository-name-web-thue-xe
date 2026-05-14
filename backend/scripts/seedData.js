const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// Sample data
const sampleUsers = [
  // Admin user
  {
    fullName: 'Admin CarRental',
    email: 'admin@carrental.vn',
    password: 'admin123',
    phone: '0901234567',
    dateOfBirth: new Date('1990-01-01'),
    role: 'admin',
    isVerified: true,
    address: {
      street: '123 Nguyễn Huệ',
      city: 'TP. Hồ Chí Minh',
      district: 'Quận 1'
    }
  },
  // Regular users
  {
    fullName: 'Nguyễn Văn An',
    email: 'nguyenvanan@email.com',
    password: 'user123',
    phone: '0912345678',
    dateOfBirth: new Date('1992-05-15'),
    role: 'user',
    isVerified: true,
    address: {
      street: '456 Lê Lợi',
      city: 'TP. Hồ Chí Minh',
      district: 'Quận 3'
    }
  },
  {
    fullName: 'Trần Thị Bình',
    email: 'tranthibinh@email.com',
    password: 'user123',
    phone: '0923456789',
    dateOfBirth: new Date('1995-08-20'),
    role: 'user',
    isVerified: true,
    address: {
      street: '789 Hai Bà Trưng',
      city: 'Hà Nội',
      district: 'Quận Hoàn Kiếm'
    }
  },
  // Car owners
  {
    fullName: 'Lê Văn Cường',
    email: 'levancuong@email.com',
    password: 'owner123',
    phone: '0934567890',
    dateOfBirth: new Date('1988-03-10'),
    role: 'owner',
    isVerified: true,
    address: {
      street: '321 Đồng Khởi',
      city: 'TP. Hồ Chí Minh',
      district: 'Quận 1'
    },
    bankAccount: {
      bankName: 'Vietcombank',
      accountNumber: '1234567890',
      accountName: 'Lê Văn Cường'
    }
  },
  {
    fullName: 'Phạm Thị Dung',
    email: 'phamthidung@email.com',
    password: 'owner123',
    phone: '0945678901',
    dateOfBirth: new Date('1990-12-25'),
    role: 'owner',
    isVerified: true,
    address: {
      street: '654 Phạm Văn Đồng',
      city: 'Hà Nội',
      district: 'Quận Cầu Giấy'
    }
  },
  // Drivers
  {
    fullName: 'Hoàng Văn Em',
    email: 'hoangvanem@email.com',
    password: 'driver123',
    phone: '0956789012',
    dateOfBirth: new Date('1985-07-18'),
    role: 'driver',
    isVerified: true,
    address: {
      street: '987 Nguyễn Trãi',
      city: 'TP. Hồ Chí Minh',
      district: 'Quận 5'
    },
    isOnline: true
  },
  {
    fullName: 'Đỗ Thị Gái',
    email: 'dothigai@email.com',
    password: 'driver123',
    phone: '0967890123',
    dateOfBirth: new Date('1992-09-30'),
    role: 'driver',
    isVerified: true,
    address: {
      street: '147 Trần Phú',
      city: 'Hà Nội',
      district: 'Quận Ba Đình'
    },
    isOnline: false
  }
];

const sampleCars = [
  {
    brand: 'Toyota',
    model: 'Vios',
    year: 2022,
    licensePlate: '51A-12345',
    color: 'Trắng',
    seats: 5,
    transmission: 'automatic',
    fuel: 'gasoline',
    pricePerDay: 650000,
    pricePerWeek: 4200000,
    pricePerMonth: 15000000,
    deposit: 2000000,
    mileage: 15000,
    description: 'Toyota Vios 2022, xe mới 99%, nội thất sạch sẽ, bảo hành chính hãng. Tiết kiệm nhiên liệu, phù hợp cho di chuyển trong thành phố.',
    features: ['air_conditioning', 'bluetooth', 'usb_charger', 'abs', 'airbags'],
    location: {
      address: '123 Nguyễn Huệ, Quận 1',
      city: 'TP. Hồ Chí Minh',
      district: 'Quận 1',
      coordinates: { lat: 10.7769, lng: 106.7009 }
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1550355421-2bf5cb22a5a7?w=800', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1552519507-da3b142c3e3d?w=800' },
      { url: 'https://images.unsplash.com/photo-1583121274602-7540d7baa5d7?w=800' }
    ],
    status: 'approved'
  },
  {
    brand: 'Honda',
    model: 'City',
    year: 2023,
    licensePlate: '51B-67890',
    color: 'Bạc',
    seats: 5,
    transmission: 'automatic',
    fuel: 'gasoline',
    pricePerDay: 700000,
    pricePerWeek: 4500000,
    pricePerMonth: 16000000,
    deposit: 2500000,
    mileage: 8000,
    description: 'Honda City 2023 phiên bản RS, thiết kế thể thao, nhiều công nghệ hiện đại. Xe phù hợp cho cả gia đình và công việc.',
    features: ['air_conditioning', 'gps', 'bluetooth', 'usb_charger', 'camera', 'abs', 'airbags'],
    location: {
      address: '456 Lê Lợi, Quận 3',
      city: 'TP. Hồ Chí Minh',
      district: 'Quận 3',
      coordinates: { lat: 10.7820, lng: 106.6830 }
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1617654112368-307921295f24?w=800', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1611156858684-1b32e8cd4c3b?w=800' }
    ],
    status: 'approved'
  },
  {
    brand: 'Hyundai',
    model: 'Accent',
    year: 2021,
    licensePlate: '30C-11111',
    color: 'Đen',
    seats: 5,
    transmission: 'manual',
    fuel: 'gasoline',
    pricePerDay: 550000,
    pricePerWeek: 3500000,
    pricePerMonth: 12000000,
    deposit: 1800000,
    mileage: 25000,
    description: 'Hyundai Accent 2021, xe số sàn bền bỉ, chi phí vận hành thấp. Rất phù hợp cho người mới lái xe.',
    features: ['air_conditioning', 'bluetooth', 'usb_charger', 'abs'],
    location: {
      address: '789 Hai Bà Trưng, Quận Hoàn Kiếm',
      city: 'Hà Nội',
      district: 'Quận Hoàn Kiếm',
      coordinates: { lat: 21.0285, lng: 105.8542 }
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1606664515524-edea22f596fe?w=800', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1605559424843-7e4dac7e2575?w=800' }
    ],
    status: 'approved'
  },
  {
    brand: 'Kia',
    model: 'Seltos',
    year: 2023,
    licensePlate: '30K-22222',
    color: 'Xanh',
    seats: 5,
    transmission: 'automatic',
    fuel: 'gasoline',
    pricePerDay: 850000,
    pricePerWeek: 5500000,
    pricePerMonth: 20000000,
    deposit: 3000000,
    mileage: 12000,
    description: 'Kia Seltos 2023 SUV đô thị, gầm cao, thiết kế hiện đại. Phù hợp cho các chuyến đi du lịch và di chuyển ngoài đường.',
    features: ['air_conditioning', 'gps', 'bluetooth', 'usb_charger', 'camera', 'parking_sensors', 'abs', 'airbags'],
    location: {
      address: '321 Đồng Khởi, Quận 1',
      city: 'TP. Hồ Chí Minh',
      district: 'Quận 1',
      coordinates: { lat: 10.7769, lng: 106.7009 }
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1593941708887-5d38b590366b?w=800', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1587060452046-b3c9a8d3c8ea?w=800' }
    ],
    status: 'approved'
  },
  {
    brand: 'Mazda',
    model: '3',
    year: 2022,
    licensePlate: '51M-33333',
    color: 'Đỏ',
    seats: 5,
    transmission: 'automatic',
    fuel: 'gasoline',
    pricePerDay: 750000,
    pricePerWeek: 4800000,
    pricePerMonth: 17000000,
    deposit: 2500000,
    mileage: 18000,
    description: 'Mazda 3 2022, thiết kế đẹp mắt, nội thất cao cấp. Xe phù hợp cho những ai yêu thích sự sang trọng.',
    features: ['air_conditioning', 'gps', 'bluetooth', 'usb_charger', 'cruise_control', 'abs', 'airbags'],
    location: {
      address: '654 Phạm Văn Đồng, Quận Cầu Giấy',
      city: 'Hà Nội',
      district: 'Quận Cầu Giấy',
      coordinates: { lat: 21.0278, lng: 105.8342 }
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1583121274602-7540d7baa5d7?w=800', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1550355421-2bf5cb22a5a7?w=800' }
    ],
    status: 'approved'
  },
  {
    brand: 'Ford',
    model: 'Ranger',
    year: 2023,
    licensePlate: '51F-44444',
    color: 'Xám',
    seats: 5,
    transmission: 'manual',
    fuel: 'diesel',
    pricePerDay: 1200000,
    pricePerWeek: 8000000,
    pricePerMonth: 28000000,
    deposit: 5000000,
    mileage: 5000,
    description: 'Ford Ranger 2023 bán tải, động cơ diesel mạnh mẽ. Phù hợp cho việc chở hàng và các chuyến đi xa.',
    features: ['air_conditioning', 'bluetooth', 'usb_charger', 'abs', 'airbags'],
    location: {
      address: '987 Nguyễn Trãi, Quận 5',
      city: 'TP. Hồ Chí Minh',
      district: 'Quận 5',
      coordinates: { lat: 10.7569, lng: 106.6609 }
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1606664515524-edea22f596fe?w=800', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1605559424843-7e4dac7e2575?w=800' }
    ],
    status: 'pending'
  }
];

const sampleReviews = [
  {
    rating: {
      overall: 5,
      communication: 5,
      cleanliness: 5,
      accuracy: 5,
      value: 5
    },
    comment: 'Xe rất tốt, chủ xe thân thiện, sẽ thuê lại lần sau!',
    images: [],
    type: 'car_review'
  },
  {
    rating: {
      overall: 4,
      communication: 4,
      cleanliness: 4,
      accuracy: 4,
      value: 4
    },
    comment: 'Xe sạch sẽ, hoạt động tốt. Chủ xe đúng giờ.',
    images: [],
    type: 'renter_to_owner'
  },
  {
    rating: {
      overall: 5,
      communication: 5,
      cleanliness: 5,
      accuracy: 5,
      value: 5
    },
    comment: 'Trải nghiệm tuyệt vời, xe mới và tiện nghi.',
    images: [],
    type: 'owner_to_renter'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Car.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      // Don't hash manually - let the User model's pre-save hook handle it
      const user = new User(userData);
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`Created user: ${savedUser.email}`);
    }

    // Create cars
    const createdCars = [];
    const ownerUsers = createdUsers.filter(u => u.role === 'owner');
    
    for (let i = 0; i < sampleCars.length; i++) {
      const carData = {
        ...sampleCars[i],
        owner: ownerUsers[i % ownerUsers.length]._id
      };
      const car = new Car(carData);
      const savedCar = await car.save();
      createdCars.push(savedCar);
      console.log(`Created car: ${savedCar.brand} ${savedCar.model}`);
    }

    // Create sample bookings
    const renterUsers = createdUsers.filter(u => u.role === 'user');
    const driverUsers = createdUsers.filter(u => u.role === 'driver');
    
    for (let i = 0; i < 10; i++) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 7) + 1);

      const booking = new Booking({
        car: createdCars[i % createdCars.length]._id,
        renter: renterUsers[i % renterUsers.length]._id,
        owner: createdCars[i % createdCars.length].owner,
        startDate,
        endDate,
        pickupTime: '09:00',
        returnTime: '09:00',
        pickupLocation: 'Địa điểm nhận xe',
        returnLocation: 'Địa điểm trả xe',
        duration: {
          days: Math.floor(Math.random() * 7) + 1,
          hours: 0
        },
        pricing: {
          dailyRate: createdCars[i % createdCars.length].pricePerDay,
          totalRentalFee: createdCars[i % createdCars.length].pricePerDay * (Math.floor(Math.random() * 7) + 1),
          serviceFee: 0,
          deposit: createdCars[i % createdCars.length].deposit,
          totalAmount: createdCars[i % createdCars.length].pricePerDay * (Math.floor(Math.random() * 7) + 1) + createdCars[i % createdCars.length].deposit
        },
        status: ['pending', 'confirmed', 'active', 'completed'][Math.floor(Math.random() * 4)],
        payment: {
          method: ['credit_card', 'bank_transfer', 'wallet'][Math.floor(Math.random() * 3)],
          status: 'paid',
          paidAt: new Date()
        }
      });

      await booking.save();
      console.log(`Created booking #${i + 1}`);
    }

    // Create sample reviews
    const bookings = await Booking.find({ status: 'completed' }).populate('car renter owner');
    
    for (let i = 0; i < Math.min(bookings.length, sampleReviews.length); i++) {
      const reviewData = {
        ...sampleReviews[i],
        booking: bookings[i]._id,
        reviewer: bookings[i].renter._id,
        reviewee: bookings[i].owner._id,
        car: bookings[i].car._id
      };

      const review = new Review(reviewData);
      await review.save();
      console.log(`Created review #${i + 1}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log('Admin: admin@carrental.vn / admin123');
    console.log('User: nguyenvanan@email.com / user123');
    console.log('Owner: levancuong@email.com / owner123');
    console.log('Driver: hoangvanem@email.com / driver123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase();
