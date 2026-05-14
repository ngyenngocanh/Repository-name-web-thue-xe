const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Require authentication
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payout = require('../models/Payout');

const isMssql = process.env.DB_PROVIDER === 'mssql';

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// GET /api/payouts/balances
// Get list of drivers and collaborators with their earning balances
router.get('/balances', auth, isAdmin, async (req, res) => {
  try {
    // Fetch all drivers and collaborators
    let users;
    if (isMssql) {
      const userRepo = require('../repositories/userRepo');
      users = await userRepo.getAll({ 
        filter: { role: { $in: ['driver', 'collaborator'] } },
        limit: 1000 // Ensure we get all of them for payout management
      });
    } else {
      users = await User.find({ role: { $in: ['driver', 'collaborator'] } }).select('-password');
    }

    const balances = await Promise.all(users.map(async (u) => {
      // Calculate total earnings from Bookings
      let totalEarned = 0;
      let totalPaid = 0;
      
      if (isMssql) {
        const payoutRepo = require('../repositories/payoutRepo');
        const ep = await payoutRepo.getEarningsAndPayouts(u._id, u.role);
        totalEarned = ep.totalEarned;
        totalPaid = ep.totalPaid;
      } else {
        if (u.role === 'driver') {
          // Driver earnings: from driverFee in pricing where driver = u._id
          const bookingsData = await Booking.aggregate([
            { 
              $match: { 
                driver: u._id,
                status: { $in: ['completed', 'active'] }, // Trạng thái hợp lệ để tính lương
                'payment.status': 'paid'
              } 
            },
            { 
              $group: { 
                 _id: null, 
                 totalDriverFee: { $sum: "$pricing.driverFee" },
                 totalDriverTripFee: { $sum: "$pricing.driverTripFee" }
              } 
            }
          ]);
          if (bookingsData.length > 0) {
             totalEarned += (bookingsData[0].totalDriverFee || 0) + (bookingsData[0].totalDriverTripFee || 0);
          }
        } else if (u.role === 'collaborator') {
          // CTV earnings: from ctvCommission in pricing where bookedBy = u._id
          const bookingsData = await Booking.aggregate([
            { 
              $match: { 
                bookedBy: u._id,
                status: { $in: ['completed', 'active'] },
                'payment.status': 'paid'
              } 
            },
            { 
              $group: { 
                 _id: null, 
                 totalCtvCommission: { $sum: "$pricing.ctvCommission" }
              } 
            }
          ]);
          if (bookingsData.length > 0) {
             totalEarned += (bookingsData[0].totalCtvCommission || 0);
          }
        }

        // Calculate total completed payouts
        const payouts = await Payout.aggregate([
          { $match: { payee: u._id, status: 'completed' } },
          { $group: { _id: null, totalPaid: { $sum: "$amount" } } }
        ]);
        totalPaid = payouts.length > 0 ? payouts[0].totalPaid : 0;
      }

      // Allow using totalEarnings field from User model as fallback / base
      const baseEarnings = Math.max(u.totalEarnings || 0, totalEarned);
      const unpaidBalance = Math.max(0, baseEarnings - totalPaid);

      return {
        _id: u._id,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        role: u.role,
        bankAccount: u.bankAccount || {},
        totalEarned: baseEarnings,
        totalPaid,
        unpaidBalance
      };
    }));

    res.json(balances);
  } catch (error) {
    console.error('Error fetching balances:', error);
    res.status(500).json({ message: 'Error fetching balances', error: error.message });
  }
});

// GET /api/payouts/history/:userId
// Get payout history for a specific user
router.get('/history/:userId', auth, isAdmin, async (req, res) => {
  try {
    let payouts;
    if (isMssql) {
      const payoutRepo = require('../repositories/payoutRepo');
      payouts = await payoutRepo.getByPayee(req.params.userId);
      // Mock populate processedBy since payouts table stores adminId
      // Alternatively, just send adminId and frontend can handle it
    } else {
      payouts = await Payout.find({ payee: req.params.userId })
        .populate('processedBy', 'fullName email')
        .sort({ createdAt: -1 });
    }
    res.json(payouts);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Error fetching history' });
  }
});

// POST /api/payouts
// Create a new payout record
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const { payeeId, amount, transactionId, notes } = req.body;
    
    if (!payeeId || !amount) {
      return res.status(400).json({ message: 'Payee and amount are required' });
    }

    const payee = await User.findById(payeeId);
    if (!payee) return res.status(404).json({ message: 'User not found' });

    let newPayout;
    if (isMssql) {
      const payoutRepo = require('../repositories/payoutRepo');
      newPayout = await payoutRepo.create({
        payee: payee._id,
        role: payee.role,
        amount: Number(amount),
        status: 'completed',
        method: 'bank_transfer',
        transactionId,
        notes,
        admin: req.user.id
      });
    } else {
      newPayout = new Payout({
        payee: payee._id,
        role: payee.role,
        amount: Number(amount),
        status: 'completed',
        transactionId,
        notes,
        bankAccount: payee.bankAccount, // Snapshot of the bank account
        processedBy: req.user.id
      });
      await newPayout.save();
    }

    res.status(201).json({ message: 'Payout recorded successfully', payout: newPayout });
  } catch (error) {
    console.error('Error creating payout:', error);
    res.status(500).json({ message: 'Error creating payout', error: error.message });
  }
});

// PUT /api/payouts/bank/:userId
// Update user's bank account information
router.put('/bank/:userId', auth, isAdmin, async (req, res) => {
  try {
    const { bankName, accountNumber, accountName } = req.body;
    
    let user;
    if (isMssql) {
      const userRepo = require('../repositories/userRepo');
      user = await userRepo.getUserById(req.params.userId);
    } else {
      user = await User.findById(req.params.userId);
    }

    if (!user) return res.status(404).json({ message: 'User not found' });

    const updatedBank = {
      bankName: bankName || user.bankAccount?.bankName,
      accountNumber: accountNumber || user.bankAccount?.accountNumber,
      accountName: accountName || user.bankAccount?.accountName
    };

    if (isMssql) {
      const userRepo = require('../repositories/userRepo');
      await userRepo.updateUser(req.params.userId, { bankAccount: updatedBank });
    } else {
      user.bankAccount = updatedBank;
      await user.save();
    }
    
    res.json({ message: 'Bank account updated successfully', bankAccount: updatedBank });
  } catch (error) {
    console.error('Error updating bank info:', error);
    res.status(500).json({ message: 'Error updating bank information' });
  }
});

module.exports = router;
